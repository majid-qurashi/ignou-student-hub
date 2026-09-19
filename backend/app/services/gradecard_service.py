import httpx
import uuid
import time
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.gradecard_parser import GradeCardParser
from app.services.gradecard_rules import GradeCardCalculator
from app.services.marks_report_service import MarksReportService

# Type mappings:
# Frontend value -> IGNOU portal query param type
# 0 -> 1 (For BCA/MCA/MP/MPB/PGDCA/MBA...)
# 1 -> 2 (For BDP/BA/B.COM/B.Sc./ASSO...)
# 2 -> 4 (For CBCS Programmes)
# 3 -> 3 (For Other Programmes)
FRONTEND_TO_IGNOU_TYPE = {
    0: 1,
    1: 2,
    2: 4,
    3: 3
}

# In-memory short-lived store for PDF reports (TTL: 1 hour)
_REPORT_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600

def _prune_cache():
    now = time.time()
    expired_keys = [k for k, v in _REPORT_CACHE.items() if now - v.get("_created_at", 0) > CACHE_TTL_SECONDS]
    for k in expired_keys:
        _REPORT_CACHE.pop(k, None)

class GradeCardService:
    BASE_URL = "https://gradecard.ignou.ac.in/view_gradecard.aspx"

    @staticmethod
    def resolve_ignou_type(programme_code: str, requested_type: Optional[int] = None) -> int:
        """
        Maps the requested type (0, 1, 2, 3) to the official IGNOU query type (1, 2, 4, 3).
        If already 1, 2, 4, 3, preserves it. Otherwise resolves automatically from programme code.
        """
        if requested_type is not None:
            if requested_type in FRONTEND_TO_IGNOU_TYPE:
                return FRONTEND_TO_IGNOU_TYPE[requested_type]
            if requested_type in [1, 2, 3, 4]:
                return requested_type

        # Fallback automatic deduction by programme code
        code = programme_code.upper().strip()
        type_1_progs = {
            "BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL", "MBF", "MCA", "MCAOL", "MCA_NEW",
            "MCA_NEWOL", "MP", "MPB", "PGDCA", "PGDCA_NEW", "PGDHRM", "PGDFM", "PGDOM",
            "PGDMM", "PGDFMP"
        }
        type_2_progs = {"ASSO", "BA", "BCOM", "BDP", "BSC"}
        type_4_progs = {
            "BAECH", "BAEGH", "BAG", "BAHDH", "BAHIH", "BAPAH", "BAPCH", "BAPSH",
            "BASOH", "BAVTM", "BCOMG", "BCOMOL", "BSCANH", "BSCBCH", "BSCG", "BSWG", "BSWGOL"
        }

        if code in type_1_progs:
            return 1
        elif code in type_2_progs:
            return 2
        elif code in type_4_progs or any(code.startswith(p) for p in ["BAE", "BAH", "BAP", "BAS", "BAV"]):
            return 4
        else:
            return 3

    @staticmethod
    def check_gradecard(enrollment_no: str, programme_code: str, gradecard_type: Optional[int] = None) -> Dict[str, Any]:
        eno = enrollment_no.strip()
        prog = programme_code.upper().strip()

        if not eno or len(eno) < 5:
            return {
                "status": "error",
                "message": "Invalid enrollment number. Please enter a valid 9 or 10-digit IGNOU enrollment number."
            }

        if not prog:
            return {
                "status": "error",
                "message": "Programme code is required. Please select or enter your programme code."
            }

        ignou_type = GradeCardService.resolve_ignou_type(prog, gradecard_type)
        portal_url = f"{GradeCardService.BASE_URL}?eno={eno}&prog={prog}&type={ignou_type}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache"
        }

        try:
            with httpx.Client(timeout=14.0, headers=headers, verify=False, follow_redirects=True) as client:
                response = client.get(portal_url)

                if response.status_code != 200:
                    return {
                        "status": "error",
                        "message": f"Official IGNOU portal returned status HTTP {response.status_code}. Please try again later."
                    }

                html_text = response.text

        except httpx.TimeoutException:
            return {
                "status": "error",
                "message": "The official IGNOU Grade Card portal is currently taking too long to respond. Please try again in a few moments."
            }
        except Exception:
            return {
                "status": "error",
                "message": "Unable to connect to the official IGNOU Grade Card portal. Please check your connection and try again."
            }

        # Parse Grade Card HTML
        parsed_result = GradeCardParser.parse(html_text, eno, prog)
        if not parsed_result.get("success"):
            return {
                "status": "error",
                "message": parsed_result.get("error", "No Grade Card record found for the provided details. Please check your enrollment number, programme, and group type.")
            }

        raw_courses = parsed_result.get("courses", [])

        # Calculate percentage using programme-specific rules
        calc_result = GradeCardCalculator.calculate(prog, raw_courses)
        evaluated_courses = calc_result.get("evaluated_courses", raw_courses)

        student_info = parsed_result.get("student_info", {})
        student_info["ignou_type"] = ignou_type
        student_info["official_portal_url"] = portal_url

        summary = {
            "overall_percentage": calc_result.get("percentage"),
            "total_courses": calc_result.get("total_courses", len(evaluated_courses)),
            "completed_courses": calc_result.get("completed_courses", 0),
            "not_completed_courses": calc_result.get("not_completed_courses", 0),
            "calculation_method": calc_result.get("method"),
            "calculation_status": calc_result.get("calculation_status")
        }

        # Generate report token for temporary PDF reference
        _prune_cache()
        report_id = str(uuid.uuid4())
        report_payload = {
            "_created_at": time.time(),
            "student_info": student_info,
            "summary": summary,
            "courses": evaluated_courses,
            "programme_code": prog,
            "enrollment_no": eno
        }
        _REPORT_CACHE[report_id] = report_payload

        return {
            "status": "success",
            "report_id": report_id,
            "student_info": student_info,
            "summary": summary,
            "courses": evaluated_courses,
            # Backward-compatible aliases for frontend table bindings
            "course_details": [
                {
                    "course": c.get("course_code"),
                    "course_code": c.get("course_code"),
                    "course_title": c.get("course_title", "-"),
                    "credits": c.get("credits", "-"),
                    "semester": c.get("semester", "-"),
                    "asgn1": c.get("assignment_marks", "-"),
                    "assignment_marks": c.get("assignment_marks", "-"),
                    "term_end_theory": c.get("tee_theory_marks", "-"),
                    "tee_theory_marks": c.get("tee_theory_marks", "-"),
                    "term_end_practical": c.get("tee_practical_marks", "-"),
                    "tee_practical_marks": c.get("tee_practical_marks", "-"),
                    "calculated_score": c.get("overall_marks", "-"),
                    "overall_marks": c.get("overall_marks", "-"),
                    "status": c.get("status", "NOT COMPLETED")
                }
                for c in evaluated_courses
            ]
        }

    @staticmethod
    def get_report_data(report_id: str) -> Optional[Dict[str, Any]]:
        _prune_cache()
        return _REPORT_CACHE.get(report_id)

    @staticmethod
    def generate_pdf_report(data: Dict[str, Any]) -> bytes:
        return MarksReportService.generate_pdf(data)

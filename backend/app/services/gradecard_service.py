import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any, List, Optional
import re

TYPE_1_PROGRAMMES = {
    "BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL", "MBF", "MCA", "MCAOL", "MCA_NEW",
    "MCA_NEWOL", "MP", "MPB", "PGDCA", "PGDCA_NEW", "PGDHRM", "PGDFM", "PGDOM",
    "PGDMM", "PGDFMP"
}

TYPE_2_PROGRAMMES = {
    "ASSO", "BA", "BCOM", "BDP", "BSC"
}

TYPE_4_PROGRAMMES = {
    "BAECH", "BAEGH", "BAG", "BAHDH", "BAHIH", "BAPAH", "BAPCH", "BAPSH",
    "BASOH", "BAVTM", "BCOMG", "BCOMOL", "BSCANH", "BSCBCH", "BSCG", "BSWG", "BSWGOL"
}

class GradeCardService:
    BASE_URL = "https://gradecard.ignou.ac.in/view_gradecard.aspx"

    @staticmethod
    def resolve_official_type(programme_code: str) -> int:
        code = programme_code.upper().strip()
        if code in TYPE_1_PROGRAMMES:
            return 1
        elif code in TYPE_2_PROGRAMMES:
            return 2
        elif code in TYPE_4_PROGRAMMES:
            return 4
        else:
            return 3

    @staticmethod
    def check_gradecard(enrollment_no: str, programme_code: str, gradecard_type: Optional[int] = None) -> Dict[str, Any]:
        eno = enrollment_no.strip()
        prog = programme_code.upper().strip()
        gtype = gradecard_type if gradecard_type in [1, 2, 3, 4] else GradeCardService.resolve_official_type(prog)

        url = f"{GradeCardService.BASE_URL}?eno={eno}&prog={prog}&type={gtype}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache"
        }

        try:
            with httpx.Client(timeout=12.0, headers=headers, verify=False, follow_redirects=True) as client:
                response = client.get(url)

                if response.status_code != 200:
                    return {
                        "status": "error",
                        "message": f"Official IGNOU portal returned status HTTP {response.status_code}. Please try again later."
                    }

                html_text = response.text
                if any(err in html_text for err in ["No Record Found", "Enrollment Number Not Found", "Invalid Enrollment Number", "Grade Card Not Found", "Invalid Enrolment"]):
                    return {
                        "status": "error",
                        "message": "Incorrect details provided or Grade Card not found on official IGNOU portal."
                    }

                return GradeCardService._parse_gradecard_html(html_text, eno, prog, gtype)

        except httpx.TimeoutException:
            return {
                "status": "error",
                "message": "Official IGNOU Grade Card portal timed out. Please try again later."
            }
        except Exception as _e:
            return {
                "status": "error",
                "message": "Unable to connect to official IGNOU portal. Please try again later."
            }

    @staticmethod
    def _parse_gradecard_html(html_text: str, eno: str, prog: str, gtype: int) -> Dict[str, Any]:
        soup = BeautifulSoup(html_text, "html.parser")

        # 1. METADATA EXTRACTION
        student_name = "STUDENT"

        lbl_name_span = soup.find(id=re.compile(r'lblname', re.I))
        if lbl_name_span:
            td_parent = lbl_name_span.find_parent("td")
            if td_parent:
                next_td = td_parent.find_next_sibling("td")
                if next_td and next_td.get_text(strip=True):
                    student_name = next_td.get_text(strip=True)

        if student_name == "STUDENT":
            for td in soup.find_all(["td", "span", "b"]):
                txt = td.get_text(strip=True)
                if "NAME:" in txt.upper():
                    nxt = td.find_next_sibling()
                    if nxt and nxt.get_text(strip=True) and "PROGRAMME" not in nxt.get_text(strip=True).upper():
                        student_name = nxt.get_text(strip=True)
                        break

        student_name = re.sub(r'\s+', ' ', student_name).strip()

        # 2. EXACT TABLE SCRAPING (9 Explicit Keys)
        tables = soup.find_all("table")
        raw_rows = []

        for table in tables:
            rows = table.find_all("tr")
            if not rows:
                continue

            header_map = {}
            first_row_cells = rows[0].find_all(["th", "td"])
            first_row_texts = [c.get_text(strip=True).upper() for c in first_row_cells]

            if not any("COURSE" in t for t in first_row_texts):
                continue

            for idx, text in enumerate(first_row_texts):
                if "COURSE" in text:
                    header_map["course"] = idx
                elif "ASGN1" in text or "ASGN" in text or "ASSIGNMENT" in text:
                    header_map["asgn1"] = idx
                elif "LAB1" in text:
                    header_map["lab1"] = idx
                elif "LAB2" in text:
                    header_map["lab2"] = idx
                elif "LAB3" in text:
                    header_map["lab3"] = idx
                elif "LAB4" in text:
                    header_map["lab4"] = idx
                elif "THEORY" in text or "TERM END THEORY" in text:
                    header_map["term_end_theory"] = idx
                elif "PRACTICAL" in text or "TERM END PRACTICAL" in text:
                    header_map["term_end_practical"] = idx
                elif "STATUS" in text:
                    header_map["status"] = idx

            for r in rows[1:]:
                cells = r.find_all(["td", "th"])
                cell_texts = [c.get_text(strip=True) for c in cells]

                if not cell_texts or len(cell_texts) < 2:
                    continue

                course_idx = header_map.get("course", 0)
                if course_idx >= len(cell_texts):
                    continue

                c_code = cell_texts[course_idx].strip()
                if not c_code or c_code.upper() in ["COURSE", "COURSE CODE", "HEADER"]:
                    continue

                def get_col_val(key: str) -> Any:
                    idx = header_map.get(key)
                    if idx is not None and idx < len(cell_texts):
                        v = cell_texts[idx].strip()
                        if v and v not in ["-", "NC", "AB", "N/A"]:
                            try:
                                return float(v)
                            except ValueError:
                                return v
                    return "-"

                asgn1_val = get_col_val("asgn1")
                lab1_val = get_col_val("lab1")
                lab2_val = get_col_val("lab2")
                lab3_val = get_col_val("lab3")
                lab4_val = get_col_val("lab4")
                theory_val = get_col_val("term_end_theory")
                practical_val = get_col_val("term_end_practical")

                status_idx = header_map.get("status", len(cell_texts) - 1)
                status_str = cell_texts[status_idx].strip().upper() if status_idx < len(cell_texts) else "NOT COMPLETED"
                if not status_str or status_str == "-":
                    status_str = "COMPLETED" if (isinstance(asgn1_val, (int, float)) or isinstance(theory_val, (int, float)) or isinstance(practical_val, (int, float)) or isinstance(lab1_val, (int, float))) else "NOT COMPLETED"

                raw_rows.append({
                    "course": c_code,
                    "asgn1": asgn1_val,
                    "lab1": lab1_val,
                    "lab2": lab2_val,
                    "lab3": lab3_val,
                    "lab4": lab4_val,
                    "term_end_theory": theory_val,
                    "term_end_practical": practical_val,
                    "status": status_str
                })

        if not raw_rows:
            return {
                "status": "error",
                "message": "Incorrect details provided or Grade Card not found."
            }

        # 3. EXACT COMPONENT CALCULATIONS & CREDIT-WEIGHTED PERCENTAGE
        course_details = []
        total_weighted_points = 0.0
        total_credits = 0.0
        completed_count = 0
        not_completed_count = 0

        for r in raw_rows:
            asgn = r["asgn1"] if isinstance(r["asgn1"], (int, float)) and r["asgn1"] > 0 else 0
            theory = r["term_end_theory"] if isinstance(r["term_end_theory"], (int, float)) and r["term_end_theory"] > 0 else 0
            practical = r["term_end_practical"] if isinstance(r["term_end_practical"], (int, float)) and r["term_end_practical"] > 0 else 0
            lab1 = r["lab1"] if isinstance(r["lab1"], (int, float)) and r["lab1"] > 0 else 0

            status = r["status"]

            # Determine Component Type, Score & Credits
            component_type = "THEORY"
            calc_score = 0.0
            credits = 4.0 # Default subject credits

            c_upper = r["course"].upper()
            if c_upper.startswith("MCSP") or "PROJECT" in c_upper or "VIVA" in c_upper or c_upper.endswith("P"):
                component_type = "PROJECT"
                calc_score = max(practical, lab1) if (practical > 0 or lab1 > 0) else 0.0
                credits = 6.0
            elif asgn > 0 and theory > 0:
                component_type = "THEORY"
                calc_score = (asgn * 0.30) + (theory * 0.70)
                credits = 6.0 if "1" in r["course"] else 4.0
            elif asgn > 0 and practical > 0:
                component_type = "LAB_WITH_ASSIGN"
                calc_score = (asgn * 0.30) + (practical * 0.70)
                credits = 2.0
            elif practical > 0 or lab1 > 0:
                component_type = "LAB_STANDALONE"
                calc_score = max(practical, lab1)
                credits = 2.0
            elif theory > 0:
                component_type = "THEORY"
                calc_score = theory
                credits = 4.0
            elif asgn > 0:
                component_type = "THEORY"
                calc_score = asgn
                credits = 4.0

            calc_score = round(calc_score, 2)

            if status == "COMPLETED":
                completed_count += 1
                total_weighted_points += (calc_score * credits)
                total_credits += credits
            else:
                not_completed_count += 1
                calc_score = "Pending"

            course_details.append({
                "course": r["course"],
                "asgn1": r["asgn1"],
                "lab1": r["lab1"],
                "lab2": r["lab2"],
                "lab3": r["lab3"],
                "lab4": r["lab4"],
                "term_end_theory": r["term_end_theory"],
                "term_end_practical": r["term_end_practical"],
                "evaluated_component_type": component_type,
                "credits": credits,
                "calculated_score": calc_score,
                "status": status
            })

        overall_percentage = round(total_weighted_points / total_credits, 2) if total_credits > 0 else 0.00

        return {
            "status": "success",
            "student_info": {
                "student_name": student_name,
                "enrollment_no": eno,
                "program": prog,
                "type_group": str(gtype)
            },
            "summary": {
                "overall_percentage": overall_percentage,
                "total_courses": len(course_details),
                "completed_courses": completed_count,
                "not_completed_courses": not_completed_count,
                "total_credits": total_credits
            },
            "course_details": course_details
        }

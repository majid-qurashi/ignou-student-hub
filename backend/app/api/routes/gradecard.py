from fastapi import APIRouter, HTTPException, Body, Response
from pydantic import BaseModel, Field
from app.services.gradecard_service import GradeCardService
from typing import Optional, Dict, Any

router = APIRouter()

class GradeCardCheckRequest(BaseModel):
    enrollment_no: str = Field(..., example="2633547882", description="Student Enrollment Number")
    programme_code: str = Field(..., example="BSCM", description="IGNOU Programme Code e.g. BSCM, BCA, BA, BAG")
    type: Optional[int] = Field(None, description="Grade Card Group Type: 0, 1, 2, or 3. Optional.")

class GradeCardReportRequest(BaseModel):
    report_id: Optional[str] = Field(None, description="Secure temporary report ID from check response")
    grade_card_data: Optional[Dict[str, Any]] = Field(None, description="Optional validated grade-card data payload")

@router.post("/gradecard/check")
def check_gradecard(req: GradeCardCheckRequest = Body(...)):
    """
    POST /api/gradecard/check
    Fetches student Grade Card from official IGNOU portal, parses course marks & status,
    and returns computed percentage with programme-specific rules.
    """
    eno = req.enrollment_no.strip()
    prog = req.programme_code.strip()
    gtype = req.type

    if not eno or len(eno) < 5:
        return {
            "status": "error",
            "message": "Please enter a valid IGNOU enrollment number (minimum 5 characters)."
        }

    if not prog:
        return {
            "status": "error",
            "message": "Please select a valid IGNOU programme code."
        }

    res = GradeCardService.check_gradecard(enrollment_no=eno, programme_code=prog, gradecard_type=gtype)
    return res

@router.post("/gradecard/report")
def download_marks_report(req: GradeCardReportRequest = Body(...)):
    """
    POST /api/gradecard/report
    Generates and returns an unofficial reference PDF marks report for the retrieved grade card.
    """
    data = None
    if req.report_id:
        data = GradeCardService.get_report_data(req.report_id)

    if not data and req.grade_card_data:
        data = req.grade_card_data

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Report data not found or expired. Please check your grade card again."
        )

    try:
        pdf_bytes = GradeCardService.generate_pdf_report(data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate marks report PDF: {str(e)}"
        )

    prog = data.get("programme_code") or data.get("student_info", {}).get("programme_code", "IGNOU")
    eno = data.get("enrollment_no") or data.get("student_info", {}).get("enrollment_no", "STUDENT")
    filename = f"ignou-marks-report-{prog}-{eno}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )

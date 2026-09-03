from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from app.services.gradecard_service import GradeCardService
from typing import Optional

router = APIRouter()

class GradeCardCheckRequest(BaseModel):
    enrollment_no: str = Field(..., example="2633547882", description="Student Enrollment Number")
    programme_code: str = Field(..., example="BSCM", description="IGNOU Programme Code e.g. BSCM, BCA, BA, BAG")
    type: Optional[int] = Field(None, description="Grade Card Type: 1, 2, 4, or 3. Optional.")

@router.post("/gradecard/check")
def check_gradecard(req: GradeCardCheckRequest = Body(...)):
    """
    POST /api/gradecard/check
    Fetches student Grade Card from official IGNOU portal, parses course marks & status,
    and returns computed weighted percentage.
    """
    eno = req.enrollment_no.strip()
    prog = req.programme_code.strip()
    gtype = req.type

    if not eno or len(eno) < 5:
        return {
            "status": "error",
            "message": "Incorrect details provided or Grade Card not found."
        }

    if not prog:
        return {
            "status": "error",
            "message": "Incorrect details provided or Grade Card not found."
        }

    res = GradeCardService.check_gradecard(enrollment_no=eno, programme_code=prog, gradecard_type=gtype)
    return res

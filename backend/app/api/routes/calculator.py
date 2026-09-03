from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PercentageRequest(BaseModel):
    obtainedMarks: float
    totalMarks: float

@router.post("/calculator/percentage")
def calculate_percentage(req: PercentageRequest):
    if req.totalMarks <= 0:
        return {"percentage": 0.0, "formattedPercentage": "0.00%"}
    
    pct = (req.obtainedMarks / req.totalMarks) * 100
    return {
        "obtainedMarks": req.obtainedMarks,
        "totalMarks": req.totalMarks,
        "percentage": round(pct, 2),
        "formattedPercentage": f"{pct:.2f}%"
    }

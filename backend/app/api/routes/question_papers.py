from fastapi import APIRouter, Query
from typing import Optional
from app.services.question_paper_service import QuestionPaperService

router = APIRouter()

@router.get("/question-papers")
def get_question_papers(
    programme: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    year: Optional[str] = Query(None)
):
    return QuestionPaperService.get_question_papers(programme=programme, course=course, year=year)

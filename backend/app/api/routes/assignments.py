from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.assignment_service import AssignmentService
from app.models.schemas import AssignmentSchema
from typing import List, Optional

router = APIRouter()

@router.get("/assignments", response_model=List[AssignmentSchema])
def get_assignments(
    programme: Optional[str] = Query(None, description="IGNOU Programme Code e.g. BCA"),
    session: Optional[str] = Query(None, description="Session e.g. July 2025 – January 2026"),
    course: Optional[str] = Query(None, description="Course Code e.g. BCS-012"),
    search: Optional[str] = Query(None, description="Search term for course or subject"),
    db: Session = Depends(get_db)
):
    """
    Returns assignments matching parameters.
    Supports /api/assignments?programme=BCA&session=July%202025%20-%20January%202026&course=BCS-012
    and /api/assignments?search=BCS-012
    """
    if not programme and not search and not course:
        raise HTTPException(status_code=400, detail="Please specify programme, course, or search query.")

    results = AssignmentService.get_assignments(
        db=db,
        programme_code=programme or "",
        session_label=session,
        course_code=course,
        search_query=search
    )
    return results

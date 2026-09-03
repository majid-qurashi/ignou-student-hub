from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.assignment_service import AssignmentService
from app.models.schemas import ProgrammeSchema, SessionSchema, CourseSchema
from typing import List, Optional

router = APIRouter()

@router.get("/programmes", response_model=List[ProgrammeSchema])
def get_programmes(db: Session = Depends(get_db)):
    """
    Returns all master IGNOU programmes stored in database.
    """
    return AssignmentService.get_programmes(db)

@router.get("/programmes/{code}/sessions", response_model=List[SessionSchema])
def get_programme_sessions(code: str, db: Session = Depends(get_db)):
    """
    Returns available sessions for a specific programme.
    """
    sessions = AssignmentService.get_sessions(db, programme_code=code)
    if not sessions:
        # Trigger single programme sync
        AssignmentService.sync_programme_by_code(db, code)
        sessions = AssignmentService.get_sessions(db, programme_code=code)
    return sessions

@router.get("/programmes/{code}/courses", response_model=List[CourseSchema])
def get_programme_courses(
    code: str,
    session: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns courses discovered for programme and session.
    """
    return AssignmentService.get_courses(db, programme_code=code, session_label=session)

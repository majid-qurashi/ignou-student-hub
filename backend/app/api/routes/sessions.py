from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.assignment_service import AssignmentService
from app.models.schemas import SessionSchema
from typing import List, Optional

router = APIRouter()

@router.get("/sessions", response_model=List[SessionSchema])
def get_sessions(
    programme: Optional[str] = Query(None, description="IGNOU Programme Code e.g. BCA"),
    db: Session = Depends(get_db)
):
    """
    Returns available sessions for selected programme.
    """
    return AssignmentService.get_sessions(db, programme_code=programme)

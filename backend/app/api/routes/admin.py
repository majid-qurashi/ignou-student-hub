from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.assignment_service import AssignmentService
from app.models.schemas import SyncRunSchema
from typing import Optional

router = APIRouter()

@router.post("/admin/sync-assignments", response_model=SyncRunSchema)
def trigger_master_sync(
    limit: Optional[int] = Query(None, description="Limit number of programmes to process"),
    x_admin_key: str = Header(None, alias="X-Admin-Key"),
    db: Session = Depends(get_db)
):
    """
    Triggers Master Synchronization across all master IGNOU programmes.
    """
    expected_key = "ignou_admin_secret_key"
    if x_admin_key and x_admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid admin key.")

    sync_run = AssignmentService.sync_all_programmes(db, max_programmes=limit)
    return sync_run

@router.post("/admin/sync-assignments/{programme_code}")
def trigger_single_programme_sync(
    programme_code: str,
    session: Optional[str] = Query(None),
    x_admin_key: str = Header(None, alias="X-Admin-Key"),
    db: Session = Depends(get_db)
):
    """
    Targeted single-programme synchronization. Useful for rapid testing!
    Example: POST /api/admin/sync-assignments/BCA
    """
    expected_key = "ignou_admin_secret_key"
    if x_admin_key and x_admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid admin key.")

    res = AssignmentService.sync_programme_by_code(db, programme_code=programme_code, target_session=session)
    return res

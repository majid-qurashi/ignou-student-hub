from fastapi import APIRouter, Query
from typing import Optional
from app.services.project_service import ProjectService

router = APIRouter()

@router.get("/projects")
def get_projects(programme: Optional[str] = Query(None)):
    return ProjectService.get_projects(programme=programme)

from pydantic import BaseModel
from typing import Optional, List
import datetime

class ProgrammeSchema(BaseModel):
    id: int
    code: str
    name: str
    category: Optional[str] = "General"
    source_url: Optional[str] = None
    active: bool

    class Config:
        from_attributes = True

class SessionSchema(BaseModel):
    id: int
    programme_id: int
    label: str
    active: bool

    class Config:
        from_attributes = True

class CourseSchema(BaseModel):
    id: int
    programme_id: int
    code: str
    name: str
    semester: Optional[str] = None
    medium: Optional[str] = "English"

    class Config:
        from_attributes = True

class AssignmentSchema(BaseModel):
    id: int
    course_code: str
    course_name: str
    programme_code: str
    session_label: str
    title: str
    source_url: str
    medium: Optional[str] = "English"
    semester: Optional[str] = None
    max_marks: Optional[int] = None
    due_date_june: Optional[str] = None
    due_date_december: Optional[str] = None
    status: Optional[str] = "Active"

    class Config:
        from_attributes = True

class SyncRunSchema(BaseModel):
    id: int
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    status: str
    programmes_total: int
    programmes_processed: int
    programmes_failed: int
    sessions_found: int
    courses_found: int
    assignments_found: int
    new_assignments: int
    updated_assignments: int
    error_log: Optional[str] = None

    class Config:
        from_attributes = True

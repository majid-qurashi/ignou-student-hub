import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class ProgrammeModel(Base):
    __tablename__ = "programmes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True) # e.g. "Bachelor's Degree", "Master's Degree", "PG Diploma", "Certificate", "PhD"
    source_url = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    last_synced = Column(DateTime, nullable=True)

    sessions = relationship("SessionModel", back_populates="programme", cascade="all, delete-orphan")
    courses = relationship("CourseModel", back_populates="programme", cascade="all, delete-orphan")
    assignments = relationship("AssignmentModel", back_populates="programme", cascade="all, delete-orphan")

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    programme_id = Column(Integer, ForeignKey("programmes.id"), nullable=False)
    label = Column(String(100), index=True, nullable=False) # e.g. "July 2025 – January 2026" or "2025-26"
    source_url = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    last_synced = Column(DateTime, nullable=True)

    programme = relationship("ProgrammeModel", back_populates="sessions")
    assignments = relationship("AssignmentModel", back_populates="session", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("programme_id", "label", name="uq_programme_session_label"),
    )

class CourseModel(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    programme_id = Column(Integer, ForeignKey("programmes.id"), nullable=False)
    code = Column(String(50), index=True, nullable=False) # e.g. "BCS-011"
    name = Column(String(255), nullable=False)
    semester = Column(String(50), nullable=True)
    medium = Column(String(50), default="English")
    active = Column(Boolean, default=True)
    last_synced = Column(DateTime, nullable=True)

    programme = relationship("ProgrammeModel", back_populates="courses")
    assignments = relationship("AssignmentModel", back_populates="course", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("programme_id", "code", name="uq_programme_course_code"),
    )

class AssignmentModel(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    programme_id = Column(Integer, ForeignKey("programmes.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    source_url = Column(Text, nullable=False) # Official IGNOU Document URL
    medium = Column(String(50), default="English")
    semester = Column(String(50), nullable=True)
    max_marks = Column(Integer, nullable=True)
    weightage = Column(String(50), nullable=True)
    due_date_june = Column(String(100), nullable=True)
    due_date_december = Column(String(100), nullable=True)
    last_modified = Column(String(100), nullable=True)
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    programme = relationship("ProgrammeModel", back_populates="assignments")
    session = relationship("SessionModel", back_populates="assignments")
    course = relationship("CourseModel", back_populates="assignments")

    __table_args__ = (
        UniqueConstraint("programme_id", "session_id", "course_id", "medium", "source_url", name="uq_assignment_record"),
    )

class SyncRunModel(Base):
    __tablename__ = "sync_runs"

    id = Column(Integer, primary_key=True, index=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="Running") # "Running", "Completed", "Failed"
    programmes_total = Column(Integer, default=0)
    programmes_processed = Column(Integer, default=0)
    programmes_failed = Column(Integer, default=0)
    sessions_found = Column(Integer, default=0)
    courses_found = Column(Integer, default=0)
    assignments_found = Column(Integer, default=0)
    new_assignments = Column(Integer, default=0)
    updated_assignments = Column(Integer, default=0)
    failed_items = Column(Text, nullable=True)
    error_log = Column(Text, nullable=True)

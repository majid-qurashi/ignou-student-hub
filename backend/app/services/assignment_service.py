import datetime
from sqlalchemy.orm import Session
from app.models.database import ProgrammeModel, SessionModel, CourseModel, AssignmentModel, SyncRunModel
from app.services.ignou_assignment_source import IgnouAssignmentSource
from typing import List, Dict, Any, Optional

class AssignmentService:

    @staticmethod
    def get_programmes(db: Session) -> List[ProgrammeModel]:
        """
        Retrieves all active programmes. If empty, populates master programme registry.
        """
        programmes = db.query(ProgrammeModel).filter(ProgrammeModel.active == True).all()
        if not programmes:
            AssignmentService.initialize_master_programmes(db)
            programmes = db.query(ProgrammeModel).filter(ProgrammeModel.active == True).all()
        return programmes

    @staticmethod
    def initialize_master_programmes(db: Session):
        """
        Populates all 600+ programme codes from master registry without duplicate integrity errors.
        """
        adapter = IgnouAssignmentSource()
        master_list = adapter.discover_programmes()

        for item in master_list:
            code = item["code"].upper().strip()
            existing = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()
            if not existing:
                prog = ProgrammeModel(
                    code=code,
                    name=item["name"],
                    category=item.get("category", "General"),
                    active=True,
                    last_synced=datetime.datetime.utcnow()
                )
                db.add(prog)
        db.commit()

    @staticmethod
    def get_sessions(db: Session, programme_code: str) -> List[SessionModel]:
        """
        Returns sessions for selected programme.
        """
        code = programme_code.upper().strip()
        prog = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()
        if not prog:
            AssignmentService.sync_programme_by_code(db, code)
            prog = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()

        if not prog:
            return []

        sessions = db.query(SessionModel).filter(
            SessionModel.programme_id == prog.id,
            SessionModel.active == True
        ).all()

        if not sessions:
            AssignmentService.sync_programme_by_code(db, code)
            sessions = db.query(SessionModel).filter(
                SessionModel.programme_id == prog.id,
                SessionModel.active == True
            ).all()

        return sessions

    @staticmethod
    def get_courses(db: Session, programme_code: str, session_label: Optional[str] = None) -> List[CourseModel]:
        """
        Returns courses discovered for programme & session.
        """
        code = programme_code.upper().strip()
        prog = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()
        if not prog:
            return []

        return db.query(CourseModel).filter(
            CourseModel.programme_id == prog.id,
            CourseModel.active == True
        ).all()

    @staticmethod
    def get_assignments(
        db: Session,
        programme_code: str,
        session_label: Optional[str] = None,
        course_code: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves assignments for programme & session from database.
        Triggers real-time crawler if records are missing.
        """
        code = programme_code.upper().strip()
        prog = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()
        if not prog:
            AssignmentService.sync_programme_by_code(db, code)
            prog = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()

        if not prog:
            return []

        query = db.query(AssignmentModel).join(CourseModel).join(SessionModel).filter(
            AssignmentModel.programme_id == prog.id
        )

        if session_label:
            query = query.filter(SessionModel.label == session_label)

        if course_code:
            query = query.filter(CourseModel.code.ilike(f"%{course_code}%"))

        if search_query:
            pattern = f"%{search_query}%"
            query = query.filter(
                (CourseModel.code.ilike(pattern)) |
                (CourseModel.name.ilike(pattern)) |
                (AssignmentModel.title.ilike(pattern))
            )

        assignments = query.all()

        if not assignments and session_label:
            AssignmentService.sync_programme_by_code(db, code, target_session=session_label)
            assignments = query.all()

        results = []
        for a in assignments:
            results.append({
                "id": a.id,
                "course_code": a.course.code,
                "course_name": a.course.name,
                "programme_code": prog.code,
                "session_label": a.session.label,
                "title": a.title,
                "source_url": a.source_url,
                "medium": a.medium,
                "semester": a.semester,
                "max_marks": a.max_marks,
                "due_date_june": a.due_date_june,
                "due_date_december": a.due_date_december,
                "status": a.status
            })

        return results

    @staticmethod
    def sync_programme_by_code(
        db: Session,
        programme_code: str,
        target_session: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Single-programme targeted synchronization. Safe UPSERT pattern.
        """
        adapter = IgnouAssignmentSource()
        code = programme_code.upper().strip()

        prog = db.query(ProgrammeModel).filter(ProgrammeModel.code == code).first()
        if not prog:
            prog = ProgrammeModel(code=code, name=f"{code} Programme", active=True, last_synced=datetime.datetime.utcnow())
            db.add(prog)
            db.commit()
            db.refresh(prog)

        sessions_labels = [target_session] if target_session else adapter.discover_sessions(code)
        
        s_count = 0
        c_count = 0
        a_count = 0

        for s_label in sessions_labels[:3]: # top active sessions
            sess = db.query(SessionModel).filter(
                SessionModel.programme_id == prog.id,
                SessionModel.label == s_label
            ).first()

            if not sess:
                sess = SessionModel(
                    programme_id=prog.id,
                    label=s_label,
                    active=True,
                    last_synced=datetime.datetime.utcnow()
                )
                db.add(sess)
                db.commit()
                db.refresh(sess)
                s_count += 1

            extracted = adapter.discover_assignments(code, s_label)
            for item in extracted:
                c_code = item["course_code"].upper().strip()
                course = db.query(CourseModel).filter(
                    CourseModel.programme_id == prog.id,
                    CourseModel.code == c_code
                ).first()

                if not course:
                    course = CourseModel(
                        programme_id=prog.id,
                        code=c_code,
                        name=item["course_name"],
                        medium=item.get("medium", "English"),
                        active=True,
                        last_synced=datetime.datetime.utcnow()
                    )
                    db.add(course)
                    db.commit()
                    db.refresh(course)
                    c_count += 1

                # Unique UPSERT check
                existing = db.query(AssignmentModel).filter(
                    AssignmentModel.programme_id == prog.id,
                    AssignmentModel.session_id == sess.id,
                    AssignmentModel.course_id == course.id,
                    AssignmentModel.source_url == item["source_url"]
                ).first()

                if not existing:
                    asg = AssignmentModel(
                        programme_id=prog.id,
                        session_id=sess.id,
                        course_id=course.id,
                        title=item["title"],
                        source_url=item["source_url"],
                        medium=item.get("medium", "English"),
                        max_marks=item.get("max_marks", 100),
                        due_date_june=item.get("due_date_june"),
                        due_date_december=item.get("due_date_december"),
                        status="Active"
                    )
                    db.add(asg)
                    a_count += 1

        prog.last_synced = datetime.datetime.utcnow()
        db.commit()

        return {
            "status": "SUCCESS",
            "programme": code,
            "sessions_found": len(sessions_labels),
            "new_sessions": s_count,
            "new_courses": c_count,
            "new_assignments": a_count
        }

    @staticmethod
    def sync_all_programmes(db: Session, max_programmes: Optional[int] = None) -> SyncRunModel:
        """
        Master Synchronization runner across all 600+ programme codes.
        Logs metrics and per-programme failure reasons in SyncRunModel.
        """
        AssignmentService.initialize_master_programmes(db)

        sync_run = SyncRunModel(
            started_at=datetime.datetime.utcnow(),
            status="Running"
        )
        db.add(sync_run)
        db.commit()
        db.refresh(sync_run)

        all_programmes = db.query(ProgrammeModel).filter(ProgrammeModel.active == True).all()
        if max_programmes:
            all_programmes = all_programmes[:max_programmes]

        sync_run.programmes_total = len(all_programmes)

        p_processed = 0
        p_failed = 0
        s_found = 0
        c_found = 0
        a_found = 0
        failed_log = []

        for prog in all_programmes:
            try:
                res = AssignmentService.sync_programme_by_code(db, prog.code)
                p_processed += 1
                s_found += res.get("sessions_found", 0)
                c_found += res.get("new_courses", 0)
                a_found += res.get("new_assignments", 0)
            except Exception as e:
                p_failed += 1
                failed_log.append(f"{prog.code}: {str(e)}")

        sync_run.completed_at = datetime.datetime.utcnow()
        sync_run.status = "Completed"
        sync_run.programmes_processed = p_processed
        sync_run.programmes_failed = p_failed
        sync_run.sessions_found = s_found
        sync_run.courses_found = c_found
        sync_run.assignments_found = a_found
        sync_run.new_assignments = a_found
        sync_run.error_log = "\n".join(failed_log) if failed_log else "None"

        db.commit()
        db.refresh(sync_run)
        return sync_run

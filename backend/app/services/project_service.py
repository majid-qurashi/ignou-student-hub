from typing import List, Dict, Any

class ProjectService:
    @staticmethod
    def get_projects(programme: str = None) -> List[Dict[str, Any]]:
        all_projects = [
            {
                "id": "prj-bcsp064-01",
                "title": "Student Management & Portal System",
                "courseCode": "BCSP-064",
                "programme": "BCA",
                "type": "Report"
            },
            {
                "id": "prj-mcsp232-01",
                "title": "Library Document Verification System Synopsis",
                "courseCode": "MCSP-232",
                "programme": "MCA",
                "type": "Synopsis"
            }
        ]
        if programme:
            return [p for p in all_projects if p["programme"].upper() == programme.upper()]
        return all_projects

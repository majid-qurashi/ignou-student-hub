from typing import List, Dict, Any

class QuestionPaperService:
    @staticmethod
    def get_question_papers(programme: str = None, course: str = None, year: str = None) -> List[Dict[str, Any]]:
        all_papers = [
            {
                "id": "qp-bcs011-2025",
                "courseCode": "BCS-011",
                "courseName": "Computer Basics and PC Software",
                "programme": "BCA",
                "year": "2025",
                "term": "December TEE",
                "isSolved": True
            },
            {
                "id": "qp-bcs012-2025",
                "courseCode": "BCS-012",
                "courseName": "Basic Mathematics",
                "programme": "BCA",
                "year": "2025",
                "term": "June TEE",
                "isSolved": True
            }
        ]
        return all_papers

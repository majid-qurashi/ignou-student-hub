import unittest
from app.services.gradecard_service import GradeCardService, FRONTEND_TO_IGNOU_TYPE
from app.services.gradecard_parser import GradeCardParser
from app.services.gradecard_rules import GradeCardCalculator
from app.services.marks_report_service import MarksReportService

SAMPLE_HTML_BSCM = """
<!DOCTYPE html>
<html>
<head><title>Grade Card</title></head>
<body>
    <span id="lblDispname">RAHUL SHARMA</span>
    <span>Status as on March 15, 2026</span>
    <table>
        <tr>
            <th>COURSE</th>
            <th>ASGN1</th>
            <th>LAB1</th>
            <th>TERM END THEORY</th>
            <th>TERM END PRACTICAL</th>
            <th>STATUS</th>
        </tr>
        <tr>
            <td>MTE01</td>
            <td>75</td>
            <td>-</td>
            <td>60</td>
            <td>-</td>
            <td>COMPLETED</td>
        </tr>
        <tr>
            <td>MTE02</td>
            <td>80</td>
            <td>-</td>
            <td>70</td>
            <td>-</td>
            <td>COMPLETED</td>
        </tr>
        <tr>
            <td>PHE03L</td>
            <td>-</td>
            <td>65</td>
            <td>-</td>
            <td>75</td>
            <td>COMPLETED</td>
        </tr>
        <tr>
            <td>MTE04</td>
            <td>60</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>NOT COMPLETED</td>
        </tr>
    </table>
</body>
</html>
"""

SAMPLE_HTML_NO_RECORD = """
<!DOCTYPE html>
<html>
<body>
    <div>Enrollment Number Not Found</div>
</body>
</html>
"""

class TestGradeCardServices(unittest.TestCase):

    def test_type_resolution(self):
        # 0 -> 1 (BCA/MCA/MBA)
        self.assertEqual(GradeCardService.resolve_ignou_type("BCA", 0), 1)
        # 1 -> 2 (BDP/BA/B.COM)
        self.assertEqual(GradeCardService.resolve_ignou_type("BA", 1), 2)
        # 2 -> 4 (CBCS)
        self.assertEqual(GradeCardService.resolve_ignou_type("BAG", 2), 4)
        # 3 -> 3 (Other Programmes)
        self.assertEqual(GradeCardService.resolve_ignou_type("BSCM", 3), 3)

        # Automatic fallback without explicit type
        self.assertEqual(GradeCardService.resolve_ignou_type("BCA", None), 1)
        self.assertEqual(GradeCardService.resolve_ignou_type("BA", None), 2)
        self.assertEqual(GradeCardService.resolve_ignou_type("BAG", None), 4)
        self.assertEqual(GradeCardService.resolve_ignou_type("BSCM", None), 3)

    def test_parser_extraction_and_hyphen_preservation(self):
        parsed = GradeCardParser.parse(SAMPLE_HTML_BSCM, "2633547882", "BSCM")
        self.assertTrue(parsed["success"])
        self.assertEqual(parsed["student_info"]["student_name"], "RAHUL SHARMA")
        self.assertEqual(parsed["student_info"]["enrollment_no"], "2633547882")
        
        courses = parsed["courses"]
        self.assertEqual(len(courses), 4)

        # Check course 1: MTE01
        c1 = courses[0]
        self.assertEqual(c1["course_code"], "MTE01")
        self.assertEqual(c1["assignment_marks"], 75)
        self.assertEqual(c1["tee_theory_marks"], 60)
        self.assertEqual(c1["status"], "COMPLETED")

        # Check hyphen preservation: MTE01 practical and lab must be '-', NOT 0
        self.assertEqual(c1["tee_practical_marks"], "-")
        self.assertNotEqual(c1["tee_practical_marks"], 0)

        # Check course 4: MTE04 (NOT COMPLETED, theory '-')
        c4 = courses[3]
        self.assertEqual(c4["course_code"], "MTE04")
        self.assertEqual(c4["tee_theory_marks"], "-")
        self.assertNotEqual(c4["tee_theory_marks"], 0)
        self.assertEqual(c4["status"], "NOT COMPLETED")

    def test_parser_no_record(self):
        parsed = GradeCardParser.parse(SAMPLE_HTML_NO_RECORD, "9999999999", "BCA")
        self.assertFalse(parsed["success"])
        self.assertIn("No record found", parsed["error"])

    def test_bscm_calculation_rules(self):
        courses = [
            {"course_code": "MTE01", "assignment_marks": 75, "tee_theory_marks": 60, "status": "COMPLETED"},
            {"course_code": "MTE02", "assignment_marks": 80, "tee_theory_marks": 70, "status": "COMPLETED"},
            {"course_code": "PHE03L", "assignment_marks": "-", "tee_practical_marks": 70, "status": "COMPLETED"},
            {"course_code": "MTE04", "assignment_marks": 60, "tee_theory_marks": "-", "status": "NOT COMPLETED"},
        ]
        res = GradeCardCalculator.calculate("BSCM", courses)
        self.assertEqual(res["calculation_status"], "SUCCESS")
        # MTE01: 75 * 0.3 + 60 * 0.7 = 22.5 + 42 = 64.5
        # MTE02: 80 * 0.3 + 70 * 0.7 = 24 + 49 = 73.0
        # PHE03L: standalone practical = 70.0
        # Average of completed: (64.5 + 73.0 + 70.0) / 3 = 207.5 / 3 = 69.17
        self.assertAlmostEqual(res["percentage"], 69.17, places=2)
        self.assertEqual(res["total_courses"], 4)
        self.assertEqual(res["completed_courses"], 3)
        self.assertEqual(res["not_completed_courses"], 1)

    def test_bca_calculation_rules(self):
        # BCA Theory: 25% Assignment + 75% TEE Theory
        # BCA Lab: 70% Continuous Practical + 30% Term-End Practical
        courses = [
            {"course_code": "MCS011", "assignment_marks": 80, "tee_theory_marks": 60, "status": "COMPLETED"},
            {"course_code": "BCSL013", "assignment_marks": 70, "tee_theory_marks": "-", "tee_practical_marks": 80, "status": "COMPLETED"}
        ]
        res = GradeCardCalculator.calculate("BCA", courses)
        self.assertEqual(res["calculation_status"], "SUCCESS")
        # MCS011: 80*0.25 + 60*0.75 = 20 + 45 = 65.0
        # BCSL013: 70*0.70 + 80*0.30 = 49 + 24 = 73.0
        # Average: (65.0 + 73.0) / 2 = 69.0
        self.assertAlmostEqual(res["percentage"], 69.0, places=2)

    def test_exact_theory_30_70_formula(self):
        # User example: Assignment = 70, TEE = 60 -> (70*0.30) + (60*0.70) = 21 + 42 = 63
        courses = [
            {"course_code": "MTE01", "assignment_marks": 70, "tee_theory_marks": 60, "status": "COMPLETED"}
        ]
        res = GradeCardCalculator.calculate("BSCM", courses)
        self.assertEqual(res["calculation_status"], "SUCCESS")
        self.assertEqual(res["evaluated_courses"][0]["overall_marks"], 63.0)
        self.assertEqual(res["percentage"], 63.0)

    def test_unsupported_programme_rules(self):
        courses = [
            {"course_code": "XYZ101", "assignment_marks": 70, "tee_theory_marks": 60, "status": "COMPLETED"}
        ]
        res = GradeCardCalculator.calculate("UNSUPPORTED_XYZ", courses)
        # Must be None, never fabricated!
        self.assertIsNone(res["percentage"])
        self.assertEqual(res["calculation_status"], "RULE_NOT_AVAILABLE")

    def test_marks_report_pdf_generation(self):
        data = {
            "student_info": {
                "student_name": "RAHUL SHARMA",
                "enrollment_no": "2633547882",
                "programme": "BSCM",
                "programme_code": "BSCM",
                "retrieved_on": "19-Sep-2026 21:00",
                "status_date": "March 15, 2026"
            },
            "summary": {
                "overall_percentage": 69.17,
                "total_courses": 4,
                "completed_courses": 3,
                "not_completed_courses": 1
            },
            "courses": [
                {
                    "course_code": "MTE01",
                    "course_title": "Calculus",
                    "credits": 4,
                    "assignment_marks": 75,
                    "tee_theory_marks": 60,
                    "tee_practical_marks": "-",
                    "overall_marks": 64.5,
                    "status": "COMPLETED"
                },
                {
                    "course_code": "MTE04",
                    "course_title": "Elementary Algebra",
                    "credits": 4,
                    "assignment_marks": 60,
                    "tee_theory_marks": "-",
                    "tee_practical_marks": "-",
                    "overall_marks": "-",
                    "status": "NOT COMPLETED"
                }
            ]
        }
        pdf_bytes = MarksReportService.generate_pdf(data)
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(len(pdf_bytes) > 500)
        # PDF files must start with %PDF
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

        # Strictly 1 page assertion
        import io, pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        self.assertEqual(len(reader.pages), 1)

if __name__ == "__main__":
    unittest.main()

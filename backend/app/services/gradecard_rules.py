from typing import List, Dict, Any, Optional

class GradeCardCalculator:

    @staticmethod
    def calculate(programme_code: str, courses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Data-driven IGNOU percentage calculation engine.
        Calculates programme-specific percentages based on official evaluation rules.
        """
        code = programme_code.upper().strip()
        
        total_courses = len(courses)
        completed_courses = sum(1 for c in courses if str(c.get("status", "")).upper() == "COMPLETED")
        not_completed_courses = total_courses - completed_courses

        if not courses:
            return {
                "percentage": None,
                "total_courses": 0,
                "completed_courses": 0,
                "not_completed_courses": 0,
                "method": "No courses found in grade card",
                "is_estimate": True,
                "calculation_status": "NO_COURSES"
            }

        # Check if programme-specific rule exists
        if code == "BSCM":
            return GradeCardCalculator._calculate_bscm(courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL"]:
            return GradeCardCalculator._calculate_bca(courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["MCA", "MCAOL", "MCA_NEW", "PGDCA", "PGDCA_NEW"]:
            return GradeCardCalculator._calculate_mca(courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["BDP", "BA", "BCOM", "BSC", "BAG", "BCOMG", "BSCG", "BSW", "BSWG"]:
            return GradeCardCalculator._calculate_standard_30_70("BDP/BA/BCOM/BSC Standard (30% Assignment + 70% TEE)", courses, total_courses, completed_courses, not_completed_courses)
        elif code.startswith("BA") or code.startswith("BCOM") or code.startswith("BSC"):
            return GradeCardCalculator._calculate_standard_30_70("CBCS Standard (30% Assignment + 70% TEE)", courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["MBA", "MBAOL", "MBF", "MCOM", "MEG", "MHD", "MAH", "MPS", "MSO"]:
            return GradeCardCalculator._calculate_standard_30_70("Master's Standard (30% Assignment + 70% TEE)", courses, total_courses, completed_courses, not_completed_courses)
        else:
            # Fallback for unsupported programmes
            return {
                "percentage": None,
                "total_courses": total_courses,
                "completed_courses": completed_courses,
                "not_completed_courses": not_completed_courses,
                "method": f"Calculation rules for programme '{code}' are not yet implemented.",
                "is_estimate": True,
                "calculation_status": "RULE_NOT_IMPLEMENTED"
            }

    @staticmethod
    def _calculate_bscm(courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        BSCM (Bachelor of Science - Mathematics/Science) Evaluation Rules:
        - Theory Courses: 30% Assignment + 70% TEE Theory
        - Lab Courses: 30% Assignment + 70% TEE Practical (or 100% Practical if no assignment)
        """
        scores = []
        for c in courses:
            asgn = c.get("assignment_marks")
            tee_t = c.get("tee_theory_marks")
            tee_p = c.get("tee_practical_marks")
            lab = c.get("lab_marks")

            tee_score = tee_t if tee_t is not None else (tee_p if tee_p is not None else lab)

            if asgn is not None and tee_score is not None:
                final_score = (asgn * 0.30) + (tee_score * 0.70)
                scores.append(final_score)
            elif tee_score is not None:
                scores.append(float(tee_score))
            elif asgn is not None:
                scores.append(float(asgn))

        percentage = round(sum(scores) / len(scores), 2) if scores else None

        return {
            "percentage": percentage,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": "BSCM Rule: 30% Assignment + 70% TEE (Theory/Practical)",
            "is_estimate": True,
            "calculation_status": "SUCCESS" if percentage is not None else "INCOMPLETE_MARKS"
        }

    @staticmethod
    def _calculate_bca(courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        BCA Evaluation Rules:
        - Theory & Lab: 25%/30% Assignment + 75%/70% TEE Theory/Lab
        """
        scores = []
        for c in courses:
            asgn = c.get("assignment_marks")
            tee_t = c.get("tee_theory_marks")
            tee_p = c.get("tee_practical_marks")
            lab = c.get("lab_marks")

            tee = tee_t if tee_t is not None else (tee_p if tee_p is not None else lab)

            if asgn is not None and tee is not None:
                scores.append((asgn * 0.25) + (tee * 0.75))
            elif tee is not None:
                scores.append(float(tee))
            elif asgn is not None:
                scores.append(float(asgn))

        percentage = round(sum(scores) / len(scores), 2) if scores else None

        return {
            "percentage": percentage,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": "BCA Rule: 25% Assignment + 75% TEE Theory/Lab",
            "is_estimate": True,
            "calculation_status": "SUCCESS" if percentage is not None else "INCOMPLETE_MARKS"
        }

    @staticmethod
    def _calculate_mca(courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        MCA Evaluation Rules:
        - 30% Assignment + 70% TEE Theory/Practical
        """
        return GradeCardCalculator._calculate_standard_30_70("MCA Rule (30% Assignment + 70% TEE)", courses, total, completed, not_completed)

    @staticmethod
    def _calculate_standard_30_70(method_label: str, courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        Standard 30% Assignment + 70% TEE Evaluation Rule
        """
        scores = []
        for c in courses:
            asgn = c.get("assignment_marks")
            tee_t = c.get("tee_theory_marks")
            tee_p = c.get("tee_practical_marks")
            lab = c.get("lab_marks")

            tee = tee_t if tee_t is not None else (tee_p if tee_p is not None else lab)

            if asgn is not None and tee is not None:
                scores.append((asgn * 0.30) + (tee * 0.70))
            elif tee is not None:
                scores.append(float(tee))
            elif asgn is not None:
                scores.append(float(asgn))

        percentage = round(sum(scores) / len(scores), 2) if scores else None

        return {
            "percentage": percentage,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": method_label,
            "is_estimate": True,
            "calculation_status": "SUCCESS" if percentage is not None else "INCOMPLETE_MARKS"
        }

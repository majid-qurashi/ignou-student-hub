from typing import List, Dict, Any, Optional

class GradeCardCalculator:
    """
    Programme-specific and course-type aware IGNOU percentage calculation engine.
    
    1. THEORY COURSES:
       Where official programme/course rule specifies:
       Assignment / Continuous Evaluation = 30%, TEE = 70%
       Final Course Marks = (Assignment × 0.30) + (TEE × 0.70)
       (For BCA: Assignment = 25%, TEE = 75%)

    2. PRACTICAL / LAB COURSES:
       Does NOT automatically use 30:70 for practical courses.
       - Where programme documentation specifies:
         Continuous Practical = 70%, Term-End Practical = 30% (e.g. BCA/MCA Lab courses):
         Final Practical Marks = (Continuous Practical × 0.70) + (TEE Practical × 0.30)
       - Where programme specifies 50% Continuous + 50% Practical exam (e.g. B.Sc. / BSCG science labs):
         Final Practical Marks = (Continuous Practical × 0.50) + (TEE Practical × 0.50)
       - Where standalone practical:
         Final Practical Marks = TEE Practical × 1.0

    3. PROJECT COURSES:
       Final Marks = Project / Viva Marks × 1.0
    """

    @staticmethod
    def calculate(programme_code: str, courses: List[Dict[str, Any]]) -> Dict[str, Any]:
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
                "is_estimate": False,
                "calculation_status": "NO_COURSES",
                "evaluated_courses": []
            }

        # Route to programme-specific evaluator
        if code == "BSCM":
            return GradeCardCalculator._eval_bscm(courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL"]:
            return GradeCardCalculator._eval_bca(courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["MCA", "MCAOL", "MCA_NEW", "MCA_NEWOL", "PGDCA", "PGDCA_NEW"]:
            return GradeCardCalculator._eval_mca(courses, total_courses, completed_courses, not_completed_courses)
        elif code in ["BDP", "BA", "BCOM", "BSC"]:
            return GradeCardCalculator._eval_standard_ug(
                "BDP/BA/B.Com/B.Sc. Standard (Theory: 30:70 | Science Lab: 50:50)",
                code, courses, total_courses, completed_courses, not_completed_courses
            )
        elif code in ["BAG", "BCOMG", "BSCG", "BSWG", "BSWGOL"] or (
            any(code.startswith(prefix) for prefix in ["BAE", "BAH", "BAP", "BAS", "BAV", "BSC", "BCOM"])
        ):
            return GradeCardCalculator._eval_cbcs(
                "CBCS Standard (Theory: 30% Assignment + 70% TEE | Science Lab: 50:50)",
                code, courses, total_courses, completed_courses, not_completed_courses
            )
        elif code in ["MBA", "MBAOL", "MBF", "MCOM", "MEG", "MHD", "MAH", "MPS", "MSO", "MSW", "MLIS", "MP"]:
            return GradeCardCalculator._eval_masters_30_70(
                "Master's Standard (30% Assignment + 70% TEE)",
                courses, total_courses, completed_courses, not_completed_courses
            )
        else:
            # Rule not available - do NOT invent or fabricate
            evaluated = []
            for c in courses:
                item = dict(c)
                if item.get("overall_marks") in ["-", None, ""]:
                    item["overall_marks"] = "-"
                evaluated.append(item)

            return {
                "percentage": None,
                "total_courses": total_courses,
                "completed_courses": completed_courses,
                "not_completed_courses": not_completed_courses,
                "method": "Percentage calculation is not currently available for this programme.",
                "is_estimate": False,
                "calculation_status": "RULE_NOT_AVAILABLE",
                "evaluated_courses": evaluated
            }

    @staticmethod
    def _parse_num(val: Any) -> Optional[float]:
        if val in [None, "-", "--", "NC", "AB", "ABS", "N/A", "NA", ""]:
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _is_project(course_code: str, title: str = "") -> bool:
        c = course_code.upper()
        t = title.upper()
        return any(c.startswith(p) for p in ["MCSP", "BCSP", "CS76", "PTS", "MPP", "MEDP"]) or "PROJECT" in c or "PROJECT" in t or "VIVA" in c

    @staticmethod
    def _is_practical(course_code: str, title: str = "") -> bool:
        c = course_code.upper()
        t = title.upper()
        if GradeCardCalculator._is_project(c, t):
            return False
        return (
            c.endswith("L") or
            c.endswith("P") or
            "LAB" in c or
            "LAB" in t or
            "PRACTICAL" in c or
            "PRACTICAL" in t or
            any(c.startswith(p) for p in ["BCSL", "MCSL", "CITL", "BPHCL", "BCHCL", "BBYCL", "BZYCL", "PHE", "CHE", "LSE"])
        )

    @staticmethod
    def _eval_bscm(courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        BSCM (Bachelor of Science - Mathematics)
        - Theory courses (e.g. MTE01, MTE02, MTE04, FST01):
          Assignment = 30%, TEE Theory = 70%
          Final Course Marks = (Assignment × 0.30) + (TEE Theory × 0.70)
        - Science Practical / Lab courses (e.g. PHE03L, CHE03L):
          Official B.Sc. rule specifies: Continuous Lab = 50% + Term-End Practical = 50%
          If continuous lab not separate: Standalone Term-End Practical = 100%
        """
        evaluated_courses = []
        scores_for_pct = []

        for c in courses:
            item = dict(c)
            code = str(item.get("course_code", "")).upper()
            title = str(item.get("course_title", ""))
            asgn = GradeCardCalculator._parse_num(item.get("assignment_marks"))
            tee_t = GradeCardCalculator._parse_num(item.get("tee_theory_marks"))
            tee_p = GradeCardCalculator._parse_num(item.get("tee_practical_marks"))
            lab1 = GradeCardCalculator._parse_num(item.get("lab1"))
            lab2 = GradeCardCalculator._parse_num(item.get("lab2"))
            lab = lab1 if lab1 is not None else lab2

            score = None

            if GradeCardCalculator._is_practical(code, title):
                continuous = lab if lab is not None else asgn
                if continuous is not None and tee_p is not None:
                    # B.Sc. Science Lab Rule: 50% Continuous + 50% Practical Exam
                    score = round((continuous * 0.50) + (tee_p * 0.50), 2)
                elif tee_p is not None:
                    score = round(tee_p, 2)
                elif continuous is not None:
                    score = round(continuous, 2)
            else:
                # Theory Course: Official 30:70 Rule
                if asgn is not None and tee_t is not None:
                    score = round((asgn * 0.30) + (tee_t * 0.70), 2)
                elif item.get("overall_marks") not in ["-", None]:
                    score = GradeCardCalculator._parse_num(item.get("overall_marks"))

            if score is not None:
                item["overall_marks"] = score
                if item.get("status") == "COMPLETED":
                    scores_for_pct.append(score)
            else:
                if item.get("overall_marks") in ["-", None]:
                    item["overall_marks"] = "-"

            evaluated_courses.append(item)

        pct = round(sum(scores_for_pct) / len(scores_for_pct), 2) if scores_for_pct else None

        return {
            "percentage": pct,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": "BSCM Rule (Theory: 30% Assignment + 70% TEE | Lab: 50% Continuous + 50% Practical)",
            "is_estimate": False,
            "calculation_status": "SUCCESS" if pct is not None else "INSUFFICIENT_DATA",
            "evaluated_courses": evaluated_courses
        }

    @staticmethod
    def _eval_bca(courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        BCA (Bachelor of Computer Applications)
        - Theory courses:
          Official BCA rule specifies: Assignment = 25%, TEE Theory = 75%
          Final Course Marks = (Assignment × 0.25) + (TEE Theory × 0.75)
        - Lab courses (BCSL013, BCSL021, BCSL022, etc.):
          Official BCA rule specifies: Continuous Practical = 70%, Term-End Practical = 30%
          Final Practical Marks = (Continuous Practical × 0.70) + (TEE Practical × 0.30)
          If continuous practical not separate, uses available component.
        - Project courses (BCSP064, CS76):
          100% Project / Viva examination
        """
        evaluated_courses = []
        scores_for_pct = []

        for c in courses:
            item = dict(c)
            code = str(item.get("course_code", "")).upper()
            title = str(item.get("course_title", ""))
            asgn = GradeCardCalculator._parse_num(item.get("assignment_marks"))
            tee_t = GradeCardCalculator._parse_num(item.get("tee_theory_marks"))
            tee_p = GradeCardCalculator._parse_num(item.get("tee_practical_marks"))
            lab1 = GradeCardCalculator._parse_num(item.get("lab1"))
            lab2 = GradeCardCalculator._parse_num(item.get("lab2"))
            lab = lab1 if lab1 is not None else lab2

            score = None

            if GradeCardCalculator._is_project(code, title):
                # 100% Project
                proj = tee_p if tee_p is not None else (lab if lab is not None else tee_t)
                if proj is not None:
                    score = round(proj, 2)
            elif GradeCardCalculator._is_practical(code, title):
                # BCA Lab Course: Continuous Practical 70% + Term-End Practical 30%
                continuous = lab if lab is not None else asgn
                if continuous is not None and tee_p is not None:
                    score = round((continuous * 0.70) + (tee_p * 0.30), 2)
                elif tee_p is not None:
                    score = round(tee_p, 2)
                elif continuous is not None:
                    score = round(continuous, 2)
            else:
                # BCA Theory Course: 25% Assignment + 75% TEE Theory
                if asgn is not None and tee_t is not None:
                    score = round((asgn * 0.25) + (tee_t * 0.75), 2)
                elif item.get("overall_marks") not in ["-", None]:
                    score = GradeCardCalculator._parse_num(item.get("overall_marks"))

            if score is not None:
                item["overall_marks"] = score
                if item.get("status") == "COMPLETED":
                    scores_for_pct.append(score)
            else:
                if item.get("overall_marks") in ["-", None]:
                    item["overall_marks"] = "-"

            evaluated_courses.append(item)

        pct = round(sum(scores_for_pct) / len(scores_for_pct), 2) if scores_for_pct else None

        return {
            "percentage": pct,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": "BCA Rule (Theory: 25:75 | Lab: 70% Continuous + 30% Term-End Practical)",
            "is_estimate": False,
            "calculation_status": "SUCCESS" if pct is not None else "INSUFFICIENT_DATA",
            "evaluated_courses": evaluated_courses
        }

    @staticmethod
    def _eval_mca(courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        MCA / PGDCA
        - Theory courses: 30% Assignment + 70% TEE Theory
        - Lab courses: Continuous Practical 70% + Term-End Practical 30% (or 50:50 if specified)
        - Projects: 100%
        """
        evaluated_courses = []
        scores_for_pct = []

        for c in courses:
            item = dict(c)
            code = str(item.get("course_code", "")).upper()
            title = str(item.get("course_title", ""))
            asgn = GradeCardCalculator._parse_num(item.get("assignment_marks"))
            tee_t = GradeCardCalculator._parse_num(item.get("tee_theory_marks"))
            tee_p = GradeCardCalculator._parse_num(item.get("tee_practical_marks"))
            lab1 = GradeCardCalculator._parse_num(item.get("lab1"))
            lab = lab1 if lab1 is not None else GradeCardCalculator._parse_num(item.get("lab2"))

            score = None

            if GradeCardCalculator._is_project(code, title):
                proj = tee_p if tee_p is not None else (lab if lab is not None else tee_t)
                if proj is not None:
                    score = round(proj, 2)
            elif GradeCardCalculator._is_practical(code, title):
                continuous = lab if lab is not None else asgn
                if continuous is not None and tee_p is not None:
                    score = round((continuous * 0.70) + (tee_p * 0.30), 2)
                elif tee_p is not None:
                    score = round(tee_p, 2)
                elif continuous is not None:
                    score = round(continuous, 2)
            else:
                if asgn is not None and tee_t is not None:
                    score = round((asgn * 0.30) + (tee_t * 0.70), 2)
                elif item.get("overall_marks") not in ["-", None]:
                    score = GradeCardCalculator._parse_num(item.get("overall_marks"))

            if score is not None:
                item["overall_marks"] = score
                if item.get("status") == "COMPLETED":
                    scores_for_pct.append(score)
            else:
                if item.get("overall_marks") in ["-", None]:
                    item["overall_marks"] = "-"

            evaluated_courses.append(item)

        pct = round(sum(scores_for_pct) / len(scores_for_pct), 2) if scores_for_pct else None

        return {
            "percentage": pct,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": "MCA Rule (Theory: 30:70 | Lab: 70% Continuous + 30% TEE Practical)",
            "is_estimate": False,
            "calculation_status": "SUCCESS" if pct is not None else "INSUFFICIENT_DATA",
            "evaluated_courses": evaluated_courses
        }

    @staticmethod
    def _eval_standard_ug(method_label: str, prog_code: str, courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        BDP/BA/B.COM/BSC
        - Theory: 30% Assignment + 70% TEE
        - Science Lab (if BSC): 50% Continuous + 50% Practical Exam
        """
        evaluated_courses = []
        scores_for_pct = []

        for c in courses:
            item = dict(c)
            code = str(item.get("course_code", "")).upper()
            title = str(item.get("course_title", ""))
            asgn = GradeCardCalculator._parse_num(item.get("assignment_marks"))
            tee_t = GradeCardCalculator._parse_num(item.get("tee_theory_marks"))
            tee_p = GradeCardCalculator._parse_num(item.get("tee_practical_marks"))
            lab1 = GradeCardCalculator._parse_num(item.get("lab1"))
            lab = lab1 if lab1 is not None else GradeCardCalculator._parse_num(item.get("lab2"))

            score = None

            if GradeCardCalculator._is_practical(code, title):
                continuous = lab if lab is not None else asgn
                if continuous is not None and tee_p is not None:
                    score = round((continuous * 0.50) + (tee_p * 0.50), 2)
                elif tee_p is not None:
                    score = round(tee_p, 2)
                elif continuous is not None:
                    score = round(continuous, 2)
            else:
                if asgn is not None and tee_t is not None:
                    score = round((asgn * 0.30) + (tee_t * 0.70), 2)
                elif item.get("overall_marks") not in ["-", None]:
                    score = GradeCardCalculator._parse_num(item.get("overall_marks"))

            if score is not None:
                item["overall_marks"] = score
                if item.get("status") == "COMPLETED":
                    scores_for_pct.append(score)
            else:
                if item.get("overall_marks") in ["-", None]:
                    item["overall_marks"] = "-"

            evaluated_courses.append(item)

        pct = round(sum(scores_for_pct) / len(scores_for_pct), 2) if scores_for_pct else None

        return {
            "percentage": pct,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": method_label,
            "is_estimate": False,
            "calculation_status": "SUCCESS" if pct is not None else "INSUFFICIENT_DATA",
            "evaluated_courses": evaluated_courses
        }

    @staticmethod
    def _eval_cbcs(method_label: str, prog_code: str, courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        CBCS Programmes (BAG, BCOMG, BSCG, etc.)
        - Theory: 30% Assignment + 70% TEE Theory
        - Practical: 50% Continuous Practical + 50% Term-End Practical (for science labs)
        """
        return GradeCardCalculator._eval_standard_ug(method_label, prog_code, courses, total, completed, not_completed)

    @staticmethod
    def _eval_masters_30_70(method_label: str, courses: List[Dict[str, Any]], total: int, completed: int, not_completed: int) -> Dict[str, Any]:
        """
        Master's Degree standard (MBA, MCOM, MAH, MEG, etc.)
        - Theory / Dissertation: 30% Assignment / Continuous + 70% TEE
        """
        evaluated_courses = []
        scores_for_pct = []

        for c in courses:
            item = dict(c)
            code = str(item.get("course_code", "")).upper()
            title = str(item.get("course_title", ""))
            asgn = GradeCardCalculator._parse_num(item.get("assignment_marks"))
            tee_t = GradeCardCalculator._parse_num(item.get("tee_theory_marks"))
            tee_p = GradeCardCalculator._parse_num(item.get("tee_practical_marks"))
            lab = GradeCardCalculator._parse_num(item.get("lab1"))

            tee = tee_t if tee_t is not None else (tee_p if tee_p is not None else lab)
            score = None

            if GradeCardCalculator._is_project(code, title):
                score = tee if tee is not None else asgn
            elif asgn is not None and tee is not None:
                score = round((asgn * 0.30) + (tee * 0.70), 2)
            elif tee is not None:
                score = round(tee, 2)
            elif item.get("overall_marks") not in ["-", None]:
                score = GradeCardCalculator._parse_num(item.get("overall_marks"))

            if score is not None:
                item["overall_marks"] = score
                if item.get("status") == "COMPLETED":
                    scores_for_pct.append(score)
            else:
                if item.get("overall_marks") in ["-", None]:
                    item["overall_marks"] = "-"

            evaluated_courses.append(item)

        pct = round(sum(scores_for_pct) / len(scores_for_pct), 2) if scores_for_pct else None

        return {
            "percentage": pct,
            "total_courses": total,
            "completed_courses": completed,
            "not_completed_courses": not_completed,
            "method": method_label,
            "is_estimate": False,
            "calculation_status": "SUCCESS" if pct is not None else "INSUFFICIENT_DATA",
            "evaluated_courses": evaluated_courses
        }

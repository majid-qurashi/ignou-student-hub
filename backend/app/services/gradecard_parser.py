from bs4 import BeautifulSoup
from typing import Dict, Any, List, Optional
import re
from datetime import datetime

class GradeCardParser:
    """
    Dedicated HTML parser for IGNOU Grade Card portal pages.
    Extracts student metadata and course performance records without altering values
    (preserving '-' and null without converting them to zero).
    """

    @staticmethod
    def parse(html_text: str, enrollment_no: str, programme_code: str) -> Dict[str, Any]:
        soup = BeautifulSoup(html_text, "html.parser")

        # Check for invalid or not found indicators
        text_content = soup.get_text()
        error_indicators = [
            "no record found",
            "enrollment number not found",
            "invalid enrollment number",
            "grade card not found",
            "invalid enrolment"
        ]
        if any(err in text_content.lower() for err in error_indicators):
            return {
                "success": False,
                "error": "No record found for this Enrollment Number and Programme Code."
            }

        # 1. EXTRACT STUDENT METADATA
        student_name = ""

        # Strategy A: lblDispname ID match
        disp_span = soup.find(id=re.compile(r'lblDispname', re.I))
        if disp_span and disp_span.get_text(strip=True):
            student_name = disp_span.get_text(strip=True)

        # Strategy B: lblname ID match
        if not student_name:
            lbl_name_span = soup.find(id=re.compile(r'lblname', re.I))
            if lbl_name_span:
                nxt = lbl_name_span.find_next_sibling()
                if nxt and nxt.get_text(strip=True):
                    student_name = nxt.get_text(strip=True)
                else:
                    td_parent = lbl_name_span.find_parent("td")
                    if td_parent:
                        next_td = td_parent.find_next_sibling("td")
                        if next_td and next_td.get_text(strip=True):
                            student_name = next_td.get_text(strip=True)

        # Strategy C: Regex match for lblDispname span
        if not student_name:
            m = re.search(r'lblDispname[^>]*>\s*([^<]+)\s*</span', html_text, re.I)
            if m and m.group(1).strip():
                student_name = m.group(1).strip()

        # Strategy D: Search elements containing 'Name:'
        if not student_name:
            for elem in soup.find_all(["td", "th", "span", "b", "div", "p"]):
                txt = elem.get_text(strip=True)
                if re.search(r'\bNAME\b\s*:', txt, re.I):
                    parts = re.split(r'\bNAME\b\s*:', txt, flags=re.I)
                    if len(parts) > 1 and parts[1].strip():
                        val = parts[1].strip()
                        val = re.split(r'PROGRAMME|ENROL|COURSE|DATE', val, flags=re.I)[0].strip()
                        if val:
                            student_name = val
                            break
                    nxt = elem.find_next_sibling()
                    if nxt and nxt.get_text(strip=True):
                        val = nxt.get_text(strip=True)
                        val = re.split(r'PROGRAMME|ENROL|COURSE|DATE', val, flags=re.I)[0].strip()
                        if val and val.upper() != "NAME:":
                            student_name = val
                            break

        student_name = re.sub(r'\s+', ' ', student_name).strip()
        student_name = student_name.lstrip(": ").rstrip(":")
        if not student_name or student_name.upper() in ["NAME", "NAME:", "STUDENT", "N/A"]:
            student_name = "STUDENT"

        # Check for status date if mentioned in portal (e.g. "Status as on ...")
        status_date = None
        date_match = re.search(r'Status\s+as\s+on\s+([A-Za-z0-9,\s\-]+)', text_content, re.I)
        if date_match:
            status_date = date_match.group(1).strip()
            status_date = status_date.split('\n')[0].split('\r')[0].strip()
        if not status_date:
            status_date = datetime.now().strftime("%B %d, %Y")

        # 2. EXTRACT COURSE ROWS
        tables = soup.find_all("table")
        parsed_courses: List[Dict[str, Any]] = []

        for table in tables:
            rows = table.find_all("tr")
            if not rows:
                continue

            header_map = {}
            first_row_cells = rows[0].find_all(["th", "td"])
            first_row_texts = [c.get_text(strip=True).upper() for c in first_row_cells]

            if not any("COURSE" in t for t in first_row_texts):
                continue

            for idx, text in enumerate(first_row_texts):
                if "COURSE" in text and "TITLE" not in text and "NAME" not in text:
                    header_map["course"] = idx
                elif "TITLE" in text or "NAME" in text or "DESCRIPTION" in text:
                    header_map["title"] = idx
                elif "CREDIT" in text:
                    header_map["credits"] = idx
                elif "SEM" in text or "YEAR" in text:
                    header_map["semester"] = idx
                elif "ASGN" in text or "ASSIGNMENT" in text:
                    header_map["asgn"] = idx
                elif "LAB1" in text:
                    header_map["lab1"] = idx
                elif "LAB2" in text:
                    header_map["lab2"] = idx
                elif "LAB3" in text:
                    header_map["lab3"] = idx
                elif "LAB4" in text:
                    header_map["lab4"] = idx
                elif "THEORY" in text or "TERM END THEORY" in text:
                    header_map["theory"] = idx
                elif "PRACTICAL" in text or "TERM END PRACTICAL" in text:
                    header_map["practical"] = idx
                elif "OVERALL" in text or "TOTAL" in text:
                    header_map["overall"] = idx
                elif "STATUS" in text:
                    header_map["status"] = idx

            for r in rows[1:]:
                cells = r.find_all(["td", "th"])
                cell_texts = [c.get_text(strip=True) for c in cells]

                if not cell_texts or len(cell_texts) < 2:
                    continue

                course_idx = header_map.get("course", 0)
                if course_idx >= len(cell_texts):
                    continue

                c_code = cell_texts[course_idx].strip()
                if not c_code or c_code.upper() in ["COURSE", "COURSE CODE", "HEADER"]:
                    continue

                def extract_val(key: str) -> Any:
                    idx = header_map.get(key)
                    if idx is not None and idx < len(cell_texts):
                        raw_str = cell_texts[idx].strip()
                        if raw_str in ["", "-", "--", "N/A", "NA", "NC", "AB", "ABS"]:
                            return "-"
                        try:
                            num = float(raw_str)
                            return int(num) if num.is_integer() else num
                        except ValueError:
                            return raw_str
                    return "-"

                def extract_text(key: str) -> str:
                    idx = header_map.get(key)
                    if idx is not None and idx < len(cell_texts):
                        t = cell_texts[idx].strip()
                        return t if t and t not in ["-", "--", "N/A"] else "-"
                    return "-"

                asgn_val = extract_val("asgn")
                theory_val = extract_val("theory")
                practical_val = extract_val("practical")
                lab1_val = extract_val("lab1")
                lab2_val = extract_val("lab2")
                lab3_val = extract_val("lab3")
                lab4_val = extract_val("lab4")
                overall_val = extract_val("overall")

                course_title = extract_text("title")
                credits_val = extract_val("credits")
                semester_val = extract_text("semester")

                status_idx = header_map.get("status", len(cell_texts) - 1)
                raw_status = cell_texts[status_idx].strip().upper() if status_idx < len(cell_texts) else ""

                if "NOT" in raw_status or "NC" in raw_status or "INCOMPLETE" in raw_status:
                    status = "NOT COMPLETED"
                elif "COMPLETED" in raw_status:
                    status = "COMPLETED"
                elif raw_status in ["-", ""]:
                    status = "COMPLETED" if (isinstance(asgn_val, (int, float)) and (isinstance(theory_val, (int, float)) or isinstance(practical_val, (int, float)))) else "NOT COMPLETED"
                else:
                    status = raw_status

                parsed_courses.append({
                    "course_code": c_code,
                    "course_title": course_title,
                    "credits": credits_val,
                    "semester": semester_val,
                    "assignment_marks": asgn_val,
                    "tee_theory_marks": theory_val,
                    "tee_practical_marks": practical_val,
                    "lab_marks": lab1_val if lab1_val != "-" else practical_val,
                    "lab1": lab1_val,
                    "lab2": lab2_val,
                    "lab3": lab3_val,
                    "lab4": lab4_val,
                    "overall_marks": overall_val,
                    "status": status
                })

        if not parsed_courses:
            return {
                "success": False,
                "error": "No course records could be found for the provided details."
            }

        return {
            "success": True,
            "student_info": {
                "student_name": student_name,
                "enrollment_no": enrollment_no,
                "programme": programme_code,
                "programme_code": programme_code,
                "status_date": status_date,
                "retrieved_on": datetime.now().strftime("%d-%b-%Y %H:%M")
            },
            "courses": parsed_courses
        }

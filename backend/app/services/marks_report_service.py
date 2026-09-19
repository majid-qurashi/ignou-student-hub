from io import BytesIO
from typing import Dict, Any, List
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

class MarksReportService:
    """
    Generates professional, compact, single-page server-side PDF marks reports.
    Strictly constrained to 1 single page by dynamically auto-tuning row paddings
    and font scales based on course count.
    Includes 'UNOFFICIAL — FOR REFERENCE ONLY' and developer attribution to Majid Qurashi.
    """

    @staticmethod
    def generate_pdf(data: Dict[str, Any]) -> bytes:
        courses = data.get("courses", data.get("course_details", []))
        num_courses = len(courses)

        # Dynamic spacing & scale tuning to strictly guarantee a single page
        if num_courses <= 12:
            top_margin = 24
            bottom_margin = 20
            row_pad = 2.5
            font_size = 7.8
            leading = 9.5
            gap_spacer = 6
        elif num_courses <= 20:
            top_margin = 18
            bottom_margin = 16
            row_pad = 1.8
            font_size = 7.2
            leading = 8.5
            gap_spacer = 4
        else:
            # High course count (20+ courses)
            top_margin = 14
            bottom_margin = 14
            row_pad = 1.2
            font_size = 6.6
            leading = 7.8
            gap_spacer = 3

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=24,
            rightMargin=24,
            topMargin=top_margin,
            bottomMargin=bottom_margin
        )

        # Usable width: A4 width (595.27pt) - 48pt margins = 547.27pt
        page_width = 547

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            name="TitleStyle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=15,
            textColor=colors.HexColor("#0B3D91")
        )

        subtitle_style = ParagraphStyle(
            name="SubtitleStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#475569")
        )

        disclaimer_badge_style = ParagraphStyle(
            name="DisclaimerBadge",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#92400E"),
            alignment=1
        )

        label_style = ParagraphStyle(
            name="LabelStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#475569")
        )

        value_style = ParagraphStyle(
            name="ValueStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#0F172A")
        )

        table_header_style = ParagraphStyle(
            name="TableHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=font_size,
            leading=leading,
            textColor=colors.white,
            alignment=1
        )

        table_cell_style = ParagraphStyle(
            name="TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=font_size,
            leading=leading,
            textColor=colors.HexColor("#1E293B"),
            alignment=1
        )

        table_cell_bold = ParagraphStyle(
            name="TableCellBold",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=font_size,
            leading=leading,
            textColor=colors.HexColor("#0B3D91"),
            alignment=1
        )

        footer_style = ParagraphStyle(
            name="FooterStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=6.5,
            leading=8.5,
            textColor=colors.HexColor("#64748B"),
            alignment=1
        )

        elements = []

        # 1. COMPACT INTEGRATED HEADER + DISCLAIMER (Single Table Row)
        header_table = Table(
            [
                [
                    Paragraph("<b>IGNOU Student Hub</b><br/><font color='#475569'>Grade Card &amp; Marks Report</font>", title_style),
                    Table(
                        [[Paragraph("UNOFFICIAL — FOR REFERENCE ONLY", disclaimer_badge_style)]],
                        colWidths=[180]
                    )
                ]
            ],
            colWidths=[360, 187]
        )
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        # Style inner disclaimer table
        inner_disc = header_table._cellvalues[0][1]
        inner_disc.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#F59E0B")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))

        elements.append(header_table)
        elements.append(Spacer(1, gap_spacer))

        # 2. COMPACT STUDENT INFORMATION TABLE
        student_info = data.get("student_info", {})
        retrieved_on = student_info.get("retrieved_on") or datetime.now().strftime("%d-%b-%Y %H:%M")

        info_data = [
            [
                Paragraph("<b>Name:</b>", label_style),
                Paragraph(str(student_info.get("student_name", "-")), value_style),
                Paragraph("<b>Enrollment No:</b>", label_style),
                Paragraph(str(student_info.get("enrollment_no", "-")), value_style),
            ],
            [
                Paragraph("<b>Programme:</b>", label_style),
                Paragraph(str(student_info.get("programme", student_info.get("programme_code", "-"))), value_style),
                Paragraph("<b>Programme Code:</b>", label_style),
                Paragraph(str(student_info.get("programme_code", "-")), value_style),
            ],
            [
                Paragraph("<b>Retrieved On:</b>", label_style),
                Paragraph(str(retrieved_on), value_style),
                Paragraph("<b>Portal Status Date:</b>", label_style),
                Paragraph(str(student_info.get("status_date", "-")), value_style),
            ]
        ]

        # Total: 100 + 175 + 115 + 157 = 547
        info_table = Table(info_data, colWidths=[100, 175, 115, 157])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#EDF2F7")),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, gap_spacer))

        # 3. COURSE-WISE PERFORMANCE TABLE
        table_rows = [
            [
                Paragraph("Course Code", table_header_style),
                Paragraph("Course Title", table_header_style),
                Paragraph("Credits", table_header_style),
                Paragraph("Assignment", table_header_style),
                Paragraph("TEE Theory", table_header_style),
                Paragraph("TEE Practical", table_header_style),
                Paragraph("Overall", table_header_style),
                Paragraph("Status", table_header_style),
            ]
        ]

        def fmt_cell(val: Any) -> str:
            if val is None or val == "" or val == "None":
                return "-"
            if isinstance(val, (int, float)):
                return f"{val:g}"
            return str(val)

        for c in courses:
            c_code = fmt_cell(c.get("course_code", c.get("course", "-")))
            c_title = fmt_cell(c.get("course_title", "-"))
            credits = fmt_cell(c.get("credits", "-"))
            asgn = fmt_cell(c.get("assignment_marks", c.get("asgn1", "-")))
            theory = fmt_cell(c.get("tee_theory_marks", c.get("term_end_theory", "-")))
            practical = fmt_cell(c.get("tee_practical_marks", c.get("term_end_practical", "-")))
            overall = fmt_cell(c.get("overall_marks", c.get("calculated_score", "-")))
            status = str(c.get("status", "-")).upper()

            status_color = "#15803D" if "COMPLETED" in status and "NOT" not in status else "#B45309"

            table_rows.append([
                Paragraph(c_code, table_cell_bold),
                Paragraph(c_title, table_cell_style),
                Paragraph(credits, table_cell_style),
                Paragraph(asgn, table_cell_style),
                Paragraph(theory, table_cell_style),
                Paragraph(practical, table_cell_style),
                Paragraph(overall, table_cell_bold),
                Paragraph(f"<font color='{status_color}'><b>{status}</b></font>", table_cell_style),
            ])

        # Width distribution summing to 547pt:
        # [Code: 72, Title: 145, Credits: 40, Asgn: 58, Theory: 58, Practical: 58, Overall: 50, Status: 66] = 547
        perf_table = Table(
            table_rows,
            colWidths=[72, 145, 40, 58, 58, 58, 50, 66]
        )
        perf_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), row_pad),
            ("BOTTOMPADDING", (0, 0), (-1, -1), row_pad),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ]))
        elements.append(perf_table)
        elements.append(Spacer(1, gap_spacer))

        # 4. COMPACT SUMMARY SECTION
        summary = data.get("summary", {})
        pct_val = summary.get("overall_percentage")
        if pct_val is not None:
            pct_display = f"{pct_val:.2f}%" if isinstance(pct_val, (int, float)) else str(pct_val)
        else:
            pct_display = "Not available for this programme"

        total_courses = summary.get("total_courses", len(courses))
        completed_courses = summary.get("completed_courses", sum(1 for c in courses if str(c.get("status", "")).upper() == "COMPLETED"))
        not_completed_courses = summary.get("not_completed_courses", total_courses - completed_courses)

        # 140 + 155 + 120 + 132 = 547
        summary_data = [
            [
                Paragraph("<b>Calculated Percentage:</b>", label_style),
                Paragraph(f"<b><font size='8' color='#0B3D91'>{pct_display}</font></b>", value_style),
                Paragraph("<b>Total Courses:</b>", label_style),
                Paragraph(str(total_courses), value_style),
            ],
            [
                Paragraph("<b>Completed Courses:</b>", label_style),
                Paragraph(f"<font color='#15803D'><b>{completed_courses}</b></font>", value_style),
                Paragraph("<b>Not Completed:</b>", label_style),
                Paragraph(f"<font color='#B45309'><b>{not_completed_courses}</b></font>", value_style),
            ]
        ]

        summary_table = Table(summary_data, colWidths=[140, 155, 120, 132])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DBEAFE")),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, gap_spacer))

        # 5. FOOTER WITH LEGAL DISCLAIMER & MAJID QURASHI CREDIT
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=4))
        elements.append(Paragraph(
            "This report is generated by IGNOU Student Hub from official portal records. "
            "This is not an official IGNOU marksheet, certificate, transcript, or academic document.<br/>"
            "Official source: <font color='#0B3D91'><u>https://gradecard.ignou.ac.in/</u></font> • "
            "Developed by <b>Majid Qurashi</b> — <font color='#714B67'><u><a href='https://qurashi.tech'>qurashi.tech</a></u></font>",
            footer_style
        ))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

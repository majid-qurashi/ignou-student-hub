import { GradeCardResponse } from '../services/api';

/**
 * Generates a clean, compact, professional 1-page PDF marks report in pure TypeScript.
 * Strictly constrained to a single A4 page with dynamic vertical scaling.
 */
export class MarksReportGenerator {
  public static generatePdf(data: Partial<GradeCardResponse> | any): Buffer {
    const studentInfo = data.student_info || {};
    const summary = data.summary || {};
    const courses = (data.courses || data.course_details || []).slice(0, 32); // Max 32 courses on 1 page

    const studentName = String(studentInfo.student_name || 'STUDENT').toUpperCase();
    const enrollmentNo = String(studentInfo.enrollment_no || data.enrollment_no || '-');
    const programme = String(studentInfo.programme || studentInfo.programme_code || data.programme_code || 'IGNOU').toUpperCase();
    const statusDate = String(studentInfo.status_date || studentInfo.retrieved_on || 'Current');
    const retrievedOn = String(studentInfo.retrieved_on || new Date().toLocaleDateString());

    const percentageStr = summary.overall_percentage !== null && summary.overall_percentage !== undefined
      ? `${Number(summary.overall_percentage).toFixed(2)}%`
      : 'N/A';
    const methodStr = String(summary.calculation_method || 'Standard Evaluation');
    const totalCourses = summary.total_courses ?? courses.length;
    const completedCourses = summary.completed_courses ?? courses.filter((c: any) => String(c.status || '').toUpperCase() === 'COMPLETED').length;
    const notCompletedCourses = summary.not_completed_courses ?? (totalCourses - completedCourses);

    // Page dimensions (A4 in points: 595.28 x 841.89)
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 28;
    const contentWidth = pageWidth - margin * 2;

    // Stream instructions
    let stream = '';

    // Color helpers
    const setFillColor = (r: number, g: number, b: number) => {
      stream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg\n`;
    };
    const setStrokeColor = (r: number, g: number, b: number) => {
      stream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG\n`;
    };
    const drawRect = (x: number, y: number, w: number, h: number, fill = false, stroke = true) => {
      stream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? 'B' : fill ? 'f' : 'S'}\n`;
    };
    const escapeText = (str: string) => {
      return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    };
    const drawText = (font: string, size: number, x: number, y: number, text: string) => {
      stream += `BT\n/${font} ${size} Tf\n${x.toFixed(2)} ${y.toFixed(2)} Td\n(${escapeText(text)}) Tj\nET\n`;
    };

    // Calculate row height based on course count to guarantee strictly 1 page
    const numCourses = courses.length;
    let rowHeight = 16;
    let tableFontSize = 7.5;
    if (numCourses > 22) {
      rowHeight = 11.5;
      tableFontSize = 6.2;
    } else if (numCourses > 14) {
      rowHeight = 13.5;
      tableFontSize = 6.8;
    }

    let curY = pageHeight - 32;

    // 1. HEADER
    setFillColor(11, 61, 145); // Navy
    drawText('F1', 13, margin, curY, 'INDIRA GANDHI NATIONAL OPEN UNIVERSITY');
    curY -= 14;

    setFillColor(71, 85, 105); // Slate
    drawText('F1', 9, margin, curY, 'STUDENT GRADE CARD & CONSOLIDATED MARKS REPORT');

    // Disclaimer Badge
    setFillColor(254, 243, 199); // Amber-100 fill
    setStrokeColor(217, 119, 6); // Amber-600 stroke
    drawRect(contentWidth + margin - 200, curY - 2, 200, 16, true, true);
    setFillColor(146, 64, 14); // Amber-900
    drawText('F1', 7, contentWidth + margin - 195, curY + 2, 'UNOFFICIAL — FOR REFERENCE ONLY');
    curY -= 18;

    // Divider
    setStrokeColor(226, 232, 240);
    stream += `0.75 w\n${margin} ${curY} m ${(pageWidth - margin)} ${curY} l S\n`;
    curY -= 12;

    // 2. STUDENT METADATA BOX
    const metaBoxHeight = 38;
    setFillColor(248, 250, 252);
    setStrokeColor(203, 213, 225);
    drawRect(margin, curY - metaBoxHeight, contentWidth, metaBoxHeight, true, true);

    const colW = contentWidth / 4;
    setFillColor(100, 116, 139);
    drawText('F1', 6.5, margin + 8, curY - 12, 'STUDENT NAME');
    setFillColor(15, 23, 42);
    drawText('F1', 8, margin + 8, curY - 24, studentName.slice(0, 26));

    setFillColor(100, 116, 139);
    drawText('F1', 6.5, margin + colW + 8, curY - 12, 'ENROLLMENT NO.');
    setFillColor(15, 23, 42);
    drawText('F1', 8, margin + colW + 8, curY - 24, enrollmentNo);

    setFillColor(100, 116, 139);
    drawText('F1', 6.5, margin + colW * 2 + 8, curY - 12, 'PROGRAMME');
    setFillColor(15, 23, 42);
    drawText('F1', 8, margin + colW * 2 + 8, curY - 24, programme);

    setFillColor(100, 116, 139);
    drawText('F1', 6.5, margin + colW * 3 + 8, curY - 12, 'STATUS DATE / RETRIEVED');
    setFillColor(15, 23, 42);
    drawText('F2', 7.5, margin + colW * 3 + 8, curY - 24, `${statusDate}`);

    curY -= (metaBoxHeight + 10);

    // 3. PERCENTAGE SUMMARY BOX
    const summaryHeight = 36;
    setFillColor(241, 245, 249);
    setStrokeColor(203, 213, 225);
    drawRect(margin, curY - summaryHeight, contentWidth, summaryHeight, true, true);

    setFillColor(100, 116, 139);
    drawText('F1', 6.5, margin + 10, curY - 12, 'CALCULATED PERCENTAGE');
    setFillColor(13, 110, 253); // Blue
    drawText('F1', 14, margin + 10, curY - 28, percentageStr);

    setFillColor(100, 116, 139);
    drawText('F1', 6.5, margin + 150, curY - 12, 'EVALUATION METHOD');
    setFillColor(51, 65, 85);
    drawText('F2', 7, margin + 150, curY - 24, methodStr.slice(0, 52));

    setFillColor(100, 116, 139);
    drawText('F1', 6.5, contentWidth + margin - 150, curY - 12, 'COURSE SUMMARY');
    setFillColor(15, 23, 42);
    drawText('F1', 7.5, contentWidth + margin - 150, curY - 24, `Total: ${totalCourses}  |  Passed: ${completedCourses}  |  Pending: ${notCompletedCourses}`);

    curY -= (summaryHeight + 10);

    // 4. COURSE TABLE
    // Columns width definition (sum = 539)
    const cols = [
      { key: 'code', label: 'COURSE', w: 65, align: 'left' },
      { key: 'title', label: 'COURSE TITLE', w: 160, align: 'left' },
      { key: 'credits', label: 'CREDITS', w: 42, align: 'center' },
      { key: 'asgn', label: 'ASSIGN', w: 50, align: 'center' },
      { key: 'theory', label: 'THEORY', w: 50, align: 'center' },
      { key: 'practical', label: 'PRACTICAL', w: 56, align: 'center' },
      { key: 'overall', label: 'OVERALL', w: 52, align: 'center' },
      { key: 'status', label: 'STATUS', w: 64, align: 'center' }
    ];

    // Table Header
    setFillColor(30, 41, 59); // Slate-800
    drawRect(margin, curY - 16, contentWidth, 16, true, false);
    setFillColor(255, 255, 255);

    let colX = margin;
    cols.forEach(col => {
      const textX = col.align === 'center' ? colX + col.w / 2 - 12 : colX + 4;
      drawText('F1', 6.8, textX, curY - 11, col.label);
      colX += col.w;
    });

    curY -= 16;

    // Table Rows
    courses.forEach((c: any, index: number) => {
      const isCompleted = String(c.status || '').toUpperCase() === 'COMPLETED';
      const cCode = String(c.course_code || c.course || '-');
      const cTitle = String(c.course_title || '-').slice(0, 32);
      const credits = String(c.credits !== undefined && c.credits !== null ? c.credits : '-');
      const asgn = String(c.assignment_marks !== undefined ? c.assignment_marks : (c.asgn1 ?? '-'));
      const theory = String(c.tee_theory_marks !== undefined ? c.tee_theory_marks : (c.term_end_theory ?? '-'));
      const practical = String(c.tee_practical_marks !== undefined ? c.tee_practical_marks : (c.term_end_practical ?? '-'));
      const overall = String(c.overall_marks !== undefined ? c.overall_marks : (c.calculated_score ?? '-'));
      const status = isCompleted ? 'COMPLETED' : 'NOT COMPLETED';

      // Background alternating
      if (index % 2 === 1) {
        setFillColor(248, 250, 252);
        drawRect(margin, curY - rowHeight, contentWidth, rowHeight, true, false);
      }

      // Bottom row border
      setStrokeColor(226, 232, 240);
      stream += `0.5 w\n${margin} ${(curY - rowHeight).toFixed(2)} m ${(pageWidth - margin)} ${(curY - rowHeight).toFixed(2)} l S\n`;

      const values = [cCode, cTitle, credits, asgn, theory, practical, overall, status];
      let cx = margin;
      values.forEach((val, vi) => {
        const colDef = cols[vi];
        if (vi === 0) {
          setFillColor(13, 110, 253); // Course code in Blue
          drawText('F1', tableFontSize, cx + 4, curY - rowHeight + 4, val);
        } else if (vi === 7) {
          if (isCompleted) {
            setFillColor(22, 101, 52); // Green
          } else {
            setFillColor(180, 83, 9); // Amber
          }
          drawText('F1', tableFontSize - 0.5, cx + 4, curY - rowHeight + 4, val);
        } else {
          setFillColor(51, 65, 85);
          const tx = colDef.align === 'center' ? cx + colDef.w / 2 - 8 : cx + 4;
          drawText(vi === 6 ? 'F1' : 'F2', tableFontSize, tx, curY - rowHeight + 4, val);
        }
        cx += colDef.w;
      });

      curY -= rowHeight;
    });

    // 5. FOOTER DISCLAIMER
    const footerY = 24;
    setStrokeColor(226, 232, 240);
    stream += `0.5 w\n${margin} ${footerY + 16} m ${(pageWidth - margin)} ${footerY + 16} l S\n`;

    setFillColor(100, 116, 139);
    drawText('F2', 6.2, margin, footerY + 8, 'Disclaimer: This unofficial statement is strictly for reference purposes based on official IGNOU web records.');
    drawText('F1', 6.2, margin, footerY, 'IGNOU Student Hub  •  Generated on ' + retrievedOn);
    drawText('F2', 6.2, contentWidth + margin - 140, footerY, 'Platform Developer: Majid Qurashi');

    // Build PDF Object Structure
    const objects: string[] = [];
    function addObject(content: string): number {
      objects.push(content);
      return objects.length;
    }

    // 1: Catalog
    addObject('<< /Type /Catalog /Pages 2 0 R >>');
    // 2: Pages
    addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    // 3: Page
    addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`);
    // 4: Contents Stream
    const streamLength = Buffer.byteLength(stream, 'utf-8');
    addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);
    // 5: F1 Helvetica-Bold
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    // 6: F2 Helvetica
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    for (let i = 0; i < objects.length; i++) {
      offsets.push(Buffer.byteLength(pdf, 'utf-8'));
      pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const startxref = Buffer.byteLength(pdf, 'utf-8');
    pdf += 'xref\n';
    pdf += `0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (const offset of offsets) {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    pdf += 'trailer\n';
    pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += 'startxref\n';
    pdf += `${startxref}\n`;
    pdf += '%%EOF';

    return Buffer.from(pdf, 'utf-8');
  }
}

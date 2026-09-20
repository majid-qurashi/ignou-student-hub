export interface ParsedCourse {
  course_code: string;
  course_title: string;
  credits: number | string;
  semester: string;
  assignment_marks: number | string;
  tee_theory_marks: number | string;
  tee_practical_marks: number | string;
  lab_marks: number | string;
  lab1: number | string;
  lab2: number | string;
  lab3: number | string;
  lab4: number | string;
  overall_marks: number | string;
  status: string;
}

export interface StudentInfo {
  student_name: string;
  enrollment_no: string;
  programme: string;
  programme_code: string;
  status_date: string;
  retrieved_on: string;
  official_portal_url?: string;
  ignou_type?: number;
}

export interface ParseResult {
  success: boolean;
  student_info?: StudentInfo;
  courses?: ParsedCourse[];
  error?: string;
}

export const FRONTEND_TO_IGNOU_TYPE: Record<number, number> = {
  0: 1,
  1: 2,
  2: 4,
  3: 3
};

const TYPE_1_PROGRAMMES = new Set([
  'BCA', 'BCAOL', 'BCA_NEW', 'BCA_NEWOL', 'MBF', 'MCA', 'MCAOL', 'MCA_NEW',
  'MCA_NEWOL', 'MP', 'MPB', 'PGDCA', 'PGDCA_NEW', 'PGDHRM', 'PGDFM', 'PGDOM',
  'PGDMM', 'PGDFMP', 'MBA', 'MBAOL'
]);

const TYPE_2_PROGRAMMES = new Set([
  'ASSO', 'BA', 'BCOM', 'BDP', 'BSC'
]);

const TYPE_4_PROGRAMMES = new Set([
  'BAECH', 'BAEGH', 'BAG', 'BAHDH', 'BAHIH', 'BAPAH', 'BAPCH', 'BAPSH',
  'BASOH', 'BAVTM', 'BCOMG', 'BCOMOL', 'BSCANH', 'BSCBCH', 'BSCG', 'BSWG', 'BSWGOL'
]);

export function resolveOfficialType(programmeCode: string, requestedType?: number): number {
  if (requestedType !== undefined && requestedType in FRONTEND_TO_IGNOU_TYPE) {
    return FRONTEND_TO_IGNOU_TYPE[requestedType];
  }
  if (requestedType !== undefined && [1, 2, 3, 4].includes(requestedType)) {
    return requestedType;
  }
  const code = programmeCode.trim().toUpperCase();
  if (TYPE_1_PROGRAMMES.has(code)) return 1;
  if (TYPE_2_PROGRAMMES.has(code)) return 2;
  if (TYPE_4_PROGRAMMES.has(code) || code.startsWith('BAE') || code.startsWith('BAH') || code.startsWith('BAP') || code.startsWith('BAS') || code.startsWith('BAV')) {
    return 4;
  }
  return 3;
}

export class GradeCardParser {
  /**
   * Dedicated HTML parser for IGNOU Grade Card portal pages.
   * Extracts student metadata and course performance records without altering values
   * (preserving '-' and null without converting them to zero).
   */
  public static parse(htmlText: string, enrollmentNo: string, programmeCode: string): ParseResult {
    const lower = htmlText.toLowerCase();

    // Check for explicit error strings from portal
    const errorIndicators = [
      'no record found',
      'enrollment number not found',
      'invalid enrollment number',
      'grade card not found',
      'invalid enrolment',
      'invalid request parameters'
    ];
    if (errorIndicators.some(err => lower.includes(err))) {
      return {
        success: false,
        error: 'No Grade Card record found for this Enrollment Number and Programme Code.'
      };
    }

    // 1. EXTRACT STUDENT METADATA
    let studentName = '';

    // Strategy A: lblDispname ID match
    const dispMatch = htmlText.match(/lblDispname[^>]*>(?:<[^>]+>)*\s*([^<]+)/i);
    if (dispMatch && dispMatch[1].trim()) {
      studentName = dispMatch[1].replace(/&nbsp;/g, ' ').trim();
    }

    // Strategy B: lblname ID match
    if (!studentName) {
      const nameMatch = htmlText.match(/lblname[^>]*>(?:<[^>]+>)*\s*([^<]+)/i);
      if (nameMatch && nameMatch[1].trim()) {
        studentName = nameMatch[1].replace(/&nbsp;/g, ' ').trim();
      }
    }

    // Strategy C: 'Name:' pattern match
    if (!studentName) {
      const namePattern = /\bNAME\b\s*:\s*([^<\r\n]+)/i;
      const m = htmlText.match(namePattern);
      if (m && m[1].trim()) {
        const val = m[1].replace(/&nbsp;/g, ' ').trim();
        const parts = val.split(/PROGRAMME|ENROL|COURSE|DATE/i);
        if (parts[0] && parts[0].trim()) {
          studentName = parts[0].trim();
        }
      }
    }

    studentName = (studentName || '').replace(/\s+/g, ' ').trim();
    studentName = studentName.replace(/^[:\s]+/, '').replace(/[:\s]+$/, '');
    if (!studentName || ['NAME', 'NAME:', 'STUDENT', 'N/A', '-'].includes(studentName.toUpperCase())) {
      studentName = 'STUDENT';
    }

    // Extract enrollment number if rendered in page
    let resolvedEnrollment = enrollmentNo;
    const enrMatch = htmlText.match(/lblDispEnrolno[^>]*>(?:<[^>]+>)*\s*([^<]+)/i);
    if (enrMatch && enrMatch[1].trim()) {
      resolvedEnrollment = enrMatch[1].replace(/&nbsp;/g, ' ').trim();
    }

    // Extract status date
    let statusDate = '';
    const dateSpanMatch = htmlText.match(/lblgcasondt[^>]*>(?:<[^>]+>)*\s*([^<]+)/i);
    if (dateSpanMatch && dateSpanMatch[1].trim()) {
      statusDate = dateSpanMatch[1].replace(/&nbsp;/g, ' ').trim();
    }
    if (!statusDate) {
      const dateTextMatch = htmlText.match(/Status\s+as\s+on\s+([A-Za-z0-9,\s\-]+)/i);
      if (dateTextMatch && dateTextMatch[1].trim()) {
        statusDate = dateTextMatch[1].replace(/&nbsp;/g, ' ').trim().split('\n')[0].split('\r')[0];
      }
    }
    if (!statusDate) {
      statusDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    // 2. EXTRACT TABLE ROWS
    const trMatches = htmlText.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    const rows: string[][] = [];

    for (const tr of trMatches) {
      const cellMatches = tr.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
      const cells = cellMatches.map(cell =>
        cell
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    let headerMap: Record<string, number> | null = null;
    const parsedCourses: ParsedCourse[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const upperRow = row.map(c => c.toUpperCase());

      // Detect header row containing 'COURSE'
      if (upperRow.some(c => c.includes('COURSE'))) {
        headerMap = {};
        upperRow.forEach((colText, colIdx) => {
          if (colText.includes('COURSE') && !colText.includes('TITLE') && !colText.includes('NAME')) {
            headerMap!['course'] = colIdx;
          } else if (colText.includes('TITLE') || colText.includes('NAME') || colText.includes('DESCRIPTION')) {
            headerMap!['title'] = colIdx;
          } else if (colText.includes('CREDIT')) {
            headerMap!['credits'] = colIdx;
          } else if (colText.includes('SEM') || colText.includes('YEAR')) {
            headerMap!['semester'] = colIdx;
          } else if (colText.includes('ASGN') || colText.includes('ASSIGNMENT')) {
            headerMap!['asgn'] = colIdx;
          } else if (colText.includes('LAB1')) {
            headerMap!['lab1'] = colIdx;
          } else if (colText.includes('LAB2')) {
            headerMap!['lab2'] = colIdx;
          } else if (colText.includes('LAB3')) {
            headerMap!['lab3'] = colIdx;
          } else if (colText.includes('LAB4')) {
            headerMap!['lab4'] = colIdx;
          } else if (colText.includes('THEORY') || colText.includes('TERM END THEORY')) {
            headerMap!['theory'] = colIdx;
          } else if (colText.includes('PRACTICAL') || colText.includes('TERM END PRACTICAL')) {
            headerMap!['practical'] = colIdx;
          } else if (colText.includes('OVERALL') || colText.includes('TOTAL')) {
            headerMap!['overall'] = colIdx;
          } else if (colText.includes('STATUS')) {
            headerMap!['status'] = colIdx;
          }
        });
        continue;
      }

      // Process course data rows
      if (headerMap && row.length >= 2) {
        const courseIdx = headerMap['course'] !== undefined ? headerMap['course'] : 0;
        if (courseIdx >= row.length) continue;

        const cCode = row[courseIdx]?.trim();
        if (!cCode || ['COURSE', 'COURSE CODE', 'HEADER'].includes(cCode.toUpperCase())) continue;

        const extractVal = (key: string): number | string => {
          const idx = headerMap![key];
          if (idx !== undefined && idx < row.length) {
            const raw = row[idx].trim();
            if (['', '-', '--', 'N/A', 'NA', 'NC', 'AB', 'ABS'].includes(raw)) return '-';
            const num = Number(raw);
            if (!isNaN(num)) return num;
            return raw;
          }
          return '-';
        };

        const extractText = (key: string): string => {
          const idx = headerMap![key];
          if (idx !== undefined && idx < row.length) {
            const raw = row[idx].trim();
            return (raw && !['-', '--', 'N/A'].includes(raw)) ? raw : '-';
          }
          return '-';
        };

        const asgnVal = extractVal('asgn');
        const theoryVal = extractVal('theory');
        const practicalVal = extractVal('practical');
        const lab1Val = extractVal('lab1');
        const lab2Val = extractVal('lab2');
        const lab3Val = extractVal('lab3');
        const lab4Val = extractVal('lab4');
        const overallVal = extractVal('overall');

        const titleVal = extractText('title');
        const creditsVal = extractVal('credits');
        const semesterVal = extractText('semester');

        const statusIdx = headerMap['status'] !== undefined ? headerMap['status'] : row.length - 1;
        const rawStatus = (statusIdx < row.length ? row[statusIdx].trim() : '').toUpperCase();

        let status = 'NOT COMPLETED';
        if (rawStatus.includes('NOT') || rawStatus.includes('NC') || rawStatus.includes('INCOMPLETE')) {
          status = 'NOT COMPLETED';
        } else if (rawStatus.includes('COMPLETED')) {
          status = 'COMPLETED';
        } else if (['-', ''].includes(rawStatus)) {
          status = (typeof asgnVal === 'number' && (typeof theoryVal === 'number' || typeof practicalVal === 'number'))
            ? 'COMPLETED'
            : 'NOT COMPLETED';
        } else {
          status = rawStatus;
        }

        parsedCourses.push({
          course_code: cCode,
          course_title: titleVal,
          credits: creditsVal,
          semester: semesterVal,
          assignment_marks: asgnVal,
          tee_theory_marks: theoryVal,
          tee_practical_marks: practicalVal,
          lab_marks: lab1Val !== '-' ? lab1Val : practicalVal,
          lab1: lab1Val,
          lab2: lab2Val,
          lab3: lab3Val,
          lab4: lab4Val,
          overall_marks: overallVal,
          status
        });
      }
    }

    // Check if no courses could be extracted or page was blank
    if (parsedCourses.length === 0) {
      return {
        success: false,
        error: 'No course records could be found for the provided details. Please verify your enrollment number, programme code, and group type.'
      };
    }

    return {
      success: true,
      student_info: {
        student_name: studentName,
        enrollment_no: resolvedEnrollment,
        programme: programmeCode,
        programme_code: programmeCode,
        status_date: statusDate,
        retrieved_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      courses: parsedCourses
    };
  }
}

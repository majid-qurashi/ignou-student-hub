import { NextRequest, NextResponse } from 'next/server';

const TYPE_1_PROGRAMMES = new Set([
  'BCA', 'BCAOL', 'BCA_NEW', 'BCA_NEWOL', 'MBF', 'MCA', 'MCAOL', 'MCA_NEW',
  'MCA_NEWOL', 'MP', 'MPB', 'PGDCA', 'PGDCA_NEW', 'PGDHRM', 'PGDFM', 'PGDOM',
  'PGDMM', 'PGDFMP'
]);

const TYPE_2_PROGRAMMES = new Set([
  'ASSO', 'BA', 'BCOM', 'BDP', 'BSC'
]);

const TYPE_4_PROGRAMMES = new Set([
  'BAECH', 'BAEGH', 'BAG', 'BAHDH', 'BAHIH', 'BAPAH', 'BAPCH', 'BAPSH',
  'BASOH', 'BAVTM', 'BCOMG', 'BCOMOL', 'BSCANH', 'BSCBCH', 'BSCG', 'BSWG', 'BSWGOL'
]);

function resolveOfficialType(programmeCode: string): number {
  const code = programmeCode.trim().toUpperCase();
  if (TYPE_1_PROGRAMMES.has(code)) return 1;
  if (TYPE_2_PROGRAMMES.has(code)) return 2;
  if (TYPE_4_PROGRAMMES.has(code)) return 4;
  return 3;
}

function cleanHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function parseGradeCardHtml(htmlText: string, eno: string, prog: string, gtype: number) {
  // 1. Check for official error indicators in IGNOU response
  const errorPatterns = [
    "No Record Found",
    "Enrollment Number Not Found",
    "Invalid Enrollment Number",
    "Grade Card Not Found",
    "Invalid Enrolment"
  ];
  if (errorPatterns.some(err => htmlText.toUpperCase().includes(err.toUpperCase()))) {
    return {
      status: 'error',
      message: 'Incorrect details provided or Grade Card not found on official IGNOU portal.'
    };
  }

  // 2. Metadata Extraction (Student Name)
  let studentName = 'STUDENT';
  const nameMatch = htmlText.match(/lblname[^>]*>([^<]+)/i) || 
                    htmlText.match(/Name\s*:?\s*<\/td>\s*<td[^>]*>([^<]+)/i) ||
                    htmlText.match(/Name\s*:?\s*([^<,\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    const extracted = cleanHtmlTags(nameMatch[1]);
    if (extracted && extracted.toUpperCase() !== 'STUDENT' && !extracted.toUpperCase().includes('PROGRAMME')) {
      studentName = extracted;
    }
  }

  // 3. Extract Tables & Header Mappings
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;
  const rawRows: Array<Record<string, any>> = [];

  while ((tableMatch = tableRegex.exec(htmlText)) !== null) {
    const tableContent = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    const tableRows: string[][] = [];

    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const rowContent = rowMatch[1];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch: RegExpExecArray | null;
      const cells: string[] = [];

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        cells.push(cleanHtmlTags(cellMatch[1]));
      }

      if (cells.length > 0) {
        tableRows.push(cells);
      }
    }

    if (tableRows.length < 2) continue;

    const firstRowTexts = tableRows[0].map(c => c.toUpperCase());
    if (!firstRowTexts.some(t => t.includes('COURSE'))) continue;

    const headerMap: Record<string, number> = {};
    firstRowTexts.forEach((text, idx) => {
      if (text.includes('COURSE')) headerMap['course'] = idx;
      else if (text.includes('ASGN') || text.includes('ASSIGN')) headerMap['asgn1'] = idx;
      else if (text.includes('LAB1')) headerMap['lab1'] = idx;
      else if (text.includes('LAB2')) headerMap['lab2'] = idx;
      else if (text.includes('LAB3')) headerMap['lab3'] = idx;
      else if (text.includes('LAB4')) headerMap['lab4'] = idx;
      else if (text.includes('THEORY') || text.includes('TERM END THEORY')) headerMap['term_end_theory'] = idx;
      else if (text.includes('PRACTICAL') || text.includes('TERM END PRACTICAL')) headerMap['term_end_practical'] = idx;
      else if (text.includes('STATUS')) headerMap['status'] = idx;
    });

    for (let r = 1; r < tableRows.length; r++) {
      const cellTexts = tableRows[r];
      if (cellTexts.length < 2) continue;

      const courseIdx = headerMap['course'] ?? 0;
      if (courseIdx >= cellTexts.length) continue;

      const cCode = cellTexts[courseIdx].trim();
      if (!cCode || ['COURSE', 'COURSE CODE', 'HEADER'].includes(cCode.toUpperCase())) continue;

      const getColVal = (key: string) => {
        const idx = headerMap[key];
        if (idx !== undefined && idx < cellTexts.length) {
          const v = cellTexts[idx].trim();
          if (v && !['-', 'NC', 'AB', 'N/A'].includes(v)) {
            const num = parseFloat(v);
            return isNaN(num) ? v : num;
          }
        }
        return '-';
      };

      const asgn1Val = getColVal('asgn1');
      const lab1Val = getColVal('lab1');
      const lab2Val = getColVal('lab2');
      const lab3Val = getColVal('lab3');
      const lab4Val = getColVal('lab4');
      const theoryVal = getColVal('term_end_theory');
      const practicalVal = getColVal('term_end_practical');

      const statusIdx = headerMap['status'] ?? (cellTexts.length - 1);
      let statusStr = statusIdx < cellTexts.length ? cellTexts[statusIdx].trim().toUpperCase() : 'NOT COMPLETED';
      if (!statusStr || statusStr === '-') {
        statusStr = (typeof asgn1Val === 'number' || typeof theoryVal === 'number' || typeof practicalVal === 'number' || typeof lab1Val === 'number')
          ? 'COMPLETED'
          : 'NOT COMPLETED';
      }

      rawRows.push({
        course: cCode,
        asgn1: asgn1Val,
        lab1: lab1Val,
        lab2: lab2Val,
        lab3: lab3Val,
        lab4: lab4Val,
        term_end_theory: theoryVal,
        term_end_practical: practicalVal,
        status: statusStr
      });
    }
  }

  if (rawRows.length === 0) {
    return {
      status: 'error',
      message: 'Incorrect details provided or Grade Card not found.'
    };
  }

  // 4. Score Calculations
  const courseDetails: any[] = [];
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let completedCount = 0;
  let notCompletedCount = 0;

  for (const r of rawRows) {
    const asgn = typeof r.asgn1 === 'number' && r.asgn1 > 0 ? r.asgn1 : 0;
    const theory = typeof r.term_end_theory === 'number' && r.term_end_theory > 0 ? r.term_end_theory : 0;
    const practical = typeof r.term_end_practical === 'number' && r.term_end_practical > 0 ? r.term_end_practical : 0;
    const lab1 = typeof r.lab1 === 'number' && r.lab1 > 0 ? r.lab1 : 0;

    const status = r.status;
    let componentType = 'THEORY';
    let calcScore = 0;
    let credits = 4.0;

    const cUpper = r.course.toUpperCase();
    if (cUpper.startsWith('MCSP') || cUpper.includes('PROJECT') || cUpper.includes('VIVA') || cUpper.endsWith('P')) {
      componentType = 'PROJECT';
      calcScore = Math.max(practical, lab1);
      credits = 6.0;
    } else if (asgn > 0 && theory > 0) {
      componentType = 'THEORY';
      calcScore = (asgn * 0.30) + (theory * 0.70);
      credits = cUpper.includes('1') ? 6.0 : 4.0;
    } else if (asgn > 0 && practical > 0) {
      componentType = 'LAB_WITH_ASSIGN';
      calcScore = (asgn * 0.30) + (practical * 0.70);
      credits = 2.0;
    } else if (practical > 0 || lab1 > 0) {
      componentType = 'LAB_STANDALONE';
      calcScore = Math.max(practical, lab1);
      credits = 2.0;
    } else if (theory > 0) {
      componentType = 'THEORY';
      calcScore = theory;
      credits = 4.0;
    } else if (asgn > 0) {
      componentType = 'THEORY';
      calcScore = asgn;
      credits = 4.0;
    }

    calcScore = Math.round(calcScore * 100) / 100;
    let displayScore: string | number = calcScore;

    if (status === 'COMPLETED') {
      completedCount++;
      totalWeightedPoints += (calcScore * credits);
      totalCredits += credits;
    } else {
      notCompletedCount++;
      displayScore = 'Pending';
    }

    courseDetails.push({
      course: r.course,
      asgn1: r.asgn1,
      lab1: r.lab1,
      lab2: r.lab2,
      lab3: r.lab3,
      lab4: r.lab4,
      term_end_theory: r.term_end_theory,
      term_end_practical: r.term_end_practical,
      evaluated_component_type: componentType,
      credits: credits,
      calculated_score: displayScore,
      status: status
    });
  }

  const overallPercentage = totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : 0;

  return {
    status: 'success',
    student_info: {
      student_name: studentName,
      enrollment_no: eno,
      program: prog,
      type_group: String(gtype)
    },
    summary: {
      overall_percentage: overallPercentage,
      total_courses: courseDetails.length,
      completed_courses: completedCount,
      not_completed_courses: notCompletedCount,
      total_credits: totalCredits
    },
    course_details: courseDetails
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { enrollment_no, programme_code, type } = body || {};

    const eno = String(enrollment_no || '').trim();
    const prog = String(programme_code || '').trim().toUpperCase();
    const gtype = (type && [1, 2, 3, 4].includes(Number(type)))
      ? Number(type)
      : resolveOfficialType(prog);

    if (!eno || eno.length < 5) {
      return NextResponse.json({
        status: 'error',
        message: 'Please provide a valid enrollment number (minimum 5 digits).'
      }, { status: 400 });
    }

    if (!prog) {
      return NextResponse.json({
        status: 'error',
        message: 'Please select a valid programme code.'
      }, { status: 400 });
    }

    const officialUrl = `https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=${encodeURIComponent(eno)}&prog=${encodeURIComponent(prog)}&type=${gtype}`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(officialUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({
          status: 'error',
          message: `Official IGNOU portal returned HTTP ${response.status}. Please try again later.`
        }, { status: 502 });
      }

      const htmlText = await response.text();
      const parsedResult = parseGradeCardHtml(htmlText, eno, prog, gtype);

      return NextResponse.json(parsedResult);
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json({
          status: 'error',
          message: 'Official IGNOU Grade Card portal timed out. Please try again later.'
        }, { status: 504 });
      }
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to official IGNOU server. Please try again later.'
      }, { status: 502 });
    }

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Invalid request payload or server processing error.'
    }, { status: 400 });
  }
}

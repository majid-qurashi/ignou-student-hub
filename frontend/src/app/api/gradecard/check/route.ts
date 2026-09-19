import { NextRequest, NextResponse } from 'next/server';

const FRONTEND_TO_IGNOU_TYPE: Record<number, number> = {
  0: 1,
  1: 2,
  2: 4,
  3: 3
};

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

function resolveOfficialType(programmeCode: string, requestedType?: number): number {
  if (requestedType !== undefined && requestedType in FRONTEND_TO_IGNOU_TYPE) {
    return FRONTEND_TO_IGNOU_TYPE[requestedType];
  }
  if (requestedType !== undefined && [1, 2, 3, 4].includes(requestedType)) {
    return requestedType;
  }
  const code = programmeCode.trim().toUpperCase();
  if (TYPE_1_PROGRAMMES.has(code)) return 1;
  if (TYPE_2_PROGRAMMES.has(code)) return 2;
  if (TYPE_4_PROGRAMMES.has(code)) return 4;
  return 3;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { enrollment_no, programme_code, type } = body || {};

    const eno = String(enrollment_no || '').trim();
    const prog = String(programme_code || '').trim().toUpperCase();
    const gtype = resolveOfficialType(prog, type !== undefined ? Number(type) : undefined);

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

    // Try forwarding to FastAPI backend first
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';
    try {
      const backendRes = await fetch(`${backendUrl}/gradecard/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_no: eno,
          programme_code: prog,
          type: type !== undefined ? Number(type) : undefined
        }),
        cache: 'no-store'
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (_backendErr) {
      // Backend not running directly; fallback to official portal scrape
    }

    const officialUrl = `https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=${encodeURIComponent(eno)}&prog=${encodeURIComponent(prog)}&type=${gtype}`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache'
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

      // Check for error strings
      if (['no record found', 'enrollment number not found', 'invalid enrollment number', 'grade card not found'].some(e => htmlText.toLowerCase().includes(e))) {
        return NextResponse.json({
          status: 'error',
          message: 'No Grade Card record found for the provided details.'
        });
      }

      // Quick fallback parser if FastAPI is offline
      let studentName = 'STUDENT';
      const dispMatch = htmlText.match(/lblDispname[^>]*>([^<]+)/i);
      if (dispMatch && dispMatch[1]) {
        studentName = dispMatch[1].replace(/&nbsp;/g, ' ').trim();
      }

      return NextResponse.json({
        status: 'success',
        student_info: {
          student_name: studentName,
          enrollment_no: eno,
          programme: prog,
          programme_code: prog,
          official_portal_url: officialUrl,
          retrieved_on: new Date().toLocaleDateString()
        },
        summary: {
          overall_percentage: null,
          total_courses: 0,
          completed_courses: 0,
          not_completed_courses: 0,
          calculation_method: 'Fallback scraper active'
        },
        courses: []
      });

    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
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

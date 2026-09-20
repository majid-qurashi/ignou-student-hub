import { NextRequest, NextResponse } from 'next/server';
import { GradeCardParser, resolveOfficialType } from '@/lib/gradeCardParser';
import { GradeCardCalculator } from '@/lib/gradeCardCalculator';

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
        message: 'Please enter a valid IGNOU enrollment number (minimum 5 digits).'
      }, { status: 400 });
    }

    if (!prog) {
      return NextResponse.json({
        status: 'error',
        message: 'Please select a valid IGNOU programme code.'
      }, { status: 400 });
    }

    // 1. Try forwarding to backend if configured
    if (process.env.BACKEND_API_URL) {
      try {
        const backendRes = await fetch(`${process.env.BACKEND_API_URL}/gradecard/check`, {
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
        // Backend offline or unreachable; proceed to native scraper
      }
    }

    // 2. Fetch directly from official IGNOU portal
    const officialUrl = `https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=${encodeURIComponent(eno)}&prog=${encodeURIComponent(prog)}&type=${gtype}`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://gradecard.ignou.ac.in/',
      'Origin': 'https://gradecard.ignou.ac.in',
      'Cache-Control': 'no-cache'
    };

    // Ensure Node.js TLS validation does not reject IGNOU government certificate chain
    const prevTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let htmlText = '';
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
          message: `Official IGNOU portal returned HTTP ${response.status}. Please try again in a few moments.`
        }, { status: 502 });
      }

      htmlText = await response.text();
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr?.name === 'AbortError';
      return NextResponse.json({
        status: 'error',
        message: isTimeout
          ? 'The official IGNOU Grade Card portal is taking too long to respond. Please try again in a few moments.'
          : 'Unable to connect to official IGNOU server. Please check your connection or try again later.'
      }, { status: 502 });
    } finally {
      if (prevTlsReject !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTlsReject;
      }
    }

    // 3. Parse HTML
    const parseResult = GradeCardParser.parse(htmlText, eno, prog);
    if (!parseResult.success || !parseResult.courses || parseResult.courses.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: parseResult.error || 'No Grade Card record found for the provided details. Please verify your enrollment number, programme code, and group type.'
      });
    }

    // 4. Calculate Rule-Based Percentage
    const calcResult = GradeCardCalculator.calculate(prog, parseResult.courses);

    const studentInfo = {
      ...parseResult.student_info!,
      ignou_type: gtype,
      official_portal_url: officialUrl
    };

    // Generate unique report token for PDF marksheet download
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      status: 'success',
      report_id: reportId,
      student_info: studentInfo,
      summary: calcResult.summary,
      courses: calcResult.evaluated_courses,
      // Backward compatibility aliases for table bindings
      course_details: calcResult.evaluated_courses.map(c => ({
        course: c.course_code,
        course_code: c.course_code,
        course_title: c.course_title,
        credits: c.credits,
        semester: c.semester,
        asgn1: c.assignment_marks,
        assignment_marks: c.assignment_marks,
        term_end_theory: c.tee_theory_marks,
        tee_theory_marks: c.tee_theory_marks,
        term_end_practical: c.tee_practical_marks,
        tee_practical_marks: c.tee_practical_marks,
        calculated_score: c.overall_marks,
        overall_marks: c.overall_marks,
        status: c.status
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Invalid request payload or internal server processing error.'
    }, { status: 400 });
  }
}


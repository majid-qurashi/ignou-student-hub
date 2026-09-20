import { NextRequest, NextResponse } from 'next/server';
import { MarksReportGenerator } from '@/lib/marksReportGenerator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gradeCardData = body?.grade_card_data || body;

    // 1. Try forwarding to backend if BACKEND_API_URL is configured
    if (process.env.BACKEND_API_URL) {
      try {
        const res = await fetch(`${process.env.BACKEND_API_URL}/gradecard/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store'
        });

        if (res.ok) {
          const pdfBuffer = await res.arrayBuffer();
          const disposition = res.headers.get('content-disposition') || 'attachment; filename="ignou-marks-report.pdf"';

          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': disposition,
              'Cache-Control': 'no-cache'
            }
          });
        }
      } catch (_backendErr) {
        // Backend offline; proceed to native generator
      }
    }

    // 2. Generate PDF marks report using native TypeScript engine
    if (!gradeCardData || (!gradeCardData.student_info && !gradeCardData.courses && !gradeCardData.enrollment_no)) {
      return NextResponse.json({
        error: 'Report data not found or expired. Please check your grade card again.'
      }, { status: 400 });
    }

    const pdfBuffer = MarksReportGenerator.generatePdf(gradeCardData);
    const prog = gradeCardData?.student_info?.programme_code || gradeCardData?.programme_code || 'IGNOU';
    const eno = gradeCardData?.student_info?.enrollment_no || gradeCardData?.enrollment_no || 'STUDENT';
    const filename = `ignou-marks-report-${prog}-${eno}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to generate marks report PDF. Please try again.'
    }, { status: 500 });
  }
}


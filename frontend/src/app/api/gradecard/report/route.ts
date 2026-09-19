import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

    const res = await fetch(`${backendUrl}/gradecard/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate PDF' }));
      return NextResponse.json({ error: err.detail || 'Failed to generate PDF' }, { status: res.status });
    }

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
  } catch (error: any) {
    return NextResponse.json({
      error: 'Backend PDF generator service is unreachable. Please ensure the Python backend is running.'
    }, { status: 502 });
  }
}

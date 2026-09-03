import { NextRequest, NextResponse } from 'next/server';
import { AVAILABLE_YEARS } from '../../../../../lib/data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const sessions = AVAILABLE_YEARS.map((y, idx) => ({
    id: idx + 1,
    programme_id: 1,
    label: y,
    active: true
  }));

  return NextResponse.json(sessions);
}

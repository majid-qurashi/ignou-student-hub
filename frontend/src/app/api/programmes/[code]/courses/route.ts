import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_ASSIGNMENTS } from '../../../../../lib/data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const progCode = code.toUpperCase();

  const matchingAssignments = SAMPLE_ASSIGNMENTS.filter(a => a.programme === progCode);
  const courses = matchingAssignments.map((a, idx) => ({
    id: idx + 1,
    programme_id: 1,
    code: a.courseCode,
    name: a.courseName,
    semester: '1',
    medium: 'English'
  }));

  return NextResponse.json(courses);
}

import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_ASSIGNMENTS } from '../../../lib/data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const programme = searchParams.get('programme')?.toUpperCase();
  const session = searchParams.get('session');
  const course = searchParams.get('course')?.toUpperCase();

  let filtered = SAMPLE_ASSIGNMENTS.map((item, idx) => ({
    id: idx + 1,
    course_code: item.courseCode,
    course_name: item.courseName,
    programme_code: item.programme,
    session_label: item.year,
    title: `${item.courseCode} Official Assignment ${item.year}`,
    source_url: `https://webservices.ignou.ac.in/assignments/`,
    medium: 'English',
    semester: 'General',
    status: 'ACTIVE'
  }));

  if (programme) {
    filtered = filtered.filter(a => a.programme_code === programme);
  }
  if (session) {
    filtered = filtered.filter(a => a.session_label === session);
  }
  if (course) {
    filtered = filtered.filter(a => a.course_code === course);
  }

  return NextResponse.json(filtered);
}

import { IGNOU_PROGRAMMES } from '../lib/programmes';
import { AVAILABLE_YEARS } from '../lib/data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface ApiProgramme {
  id: number;
  code: string;
  name: string;
  category?: string;
  source_url?: string;
  active: boolean;
}

export interface ApiSession {
  id: number;
  programme_id: number;
  label: string;
  active: boolean;
}

export interface ApiCourse {
  id: number;
  programme_id: number;
  code: string;
  name: string;
  semester?: string;
  medium?: string;
}

export interface ApiAssignment {
  id: number;
  course_code: string;
  course_name: string;
  programme_code: string;
  session_label: string;
  title: string;
  source_url: string;
  medium?: string;
  semester?: string;
  max_marks?: number;
  due_date_june?: string;
  due_date_december?: string;
  status?: string;
}

export interface CourseDetailItem {
  course: string;
  asgn1: number | string;
  lab1: number | string;
  lab2: number | string;
  lab3: number | string;
  lab4: number | string;
  term_end_theory: number | string;
  term_end_practical: number | string;
  evaluated_component_type?: string;
  credits?: number;
  calculated_score: number | string;
  status: string;
}

export interface GradeCardResponse {
  status: string; // "success" or "error"
  message?: string;
  student_info?: {
    student_name: string;
    enrollment_no: string;
    program: string;
    type_group: string;
  };
  summary?: {
    overall_percentage: number;
    total_courses: number;
    completed_courses: number;
    not_completed_courses: number;
    total_credits?: number;
  };
  course_details?: CourseDetailItem[];
}

export async function fetchApiProgrammes(): Promise<{ code: string; name: string; category?: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/programmes`, { cache: 'no-store' });
    if (res.ok) {
      const data: ApiProgramme[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p) => ({
          code: p.code,
          name: p.name,
          category: p.category || "General"
        }));
      }
    }
  } catch (_e) {
    // API offline fallback
  }
  return IGNOU_PROGRAMMES.map((p) => ({ code: p.code, name: p.name, category: "General" }));
}

export async function fetchApiSessions(programmeCode: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/programmes/${encodeURIComponent(programmeCode)}/sessions`, { cache: 'no-store' });
    if (res.ok) {
      const data: ApiSession[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((s) => s.label);
      }
    }
  } catch (_e) {
    // API offline fallback
  }
  return AVAILABLE_YEARS;
}

export async function fetchApiCourses(programmeCode: string, sessionLabel: string): Promise<{ code: string; name: string }[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/programmes/${encodeURIComponent(programmeCode)}/courses?session=${encodeURIComponent(sessionLabel)}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data: ApiCourse[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c) => ({ code: c.code, name: c.name }));
      }
    }
  } catch (_e) {
    // API offline fallback
  }
  return [];
}

export async function fetchApiAssignments(
  programmeCode: string,
  sessionLabel: string,
  courseCode?: string
): Promise<{ success: boolean; data: ApiAssignment[]; message?: string }> {
  try {
    let url = `${API_BASE_URL}/assignments?programme=${encodeURIComponent(programmeCode)}&session=${encodeURIComponent(sessionLabel)}`;
    if (courseCode) {
      url += `&course=${encodeURIComponent(courseCode)}`;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data: ApiAssignment[] = await res.json();
      return { success: true, data };
    }
  } catch (_e) {
    return {
      success: false,
      data: [],
      message: 'IGNOU assignment source is temporarily unavailable. Please try again later.'
    };
  }

  return {
    success: false,
    data: [],
    message: 'No assignment found for the selected programme and session.'
  };
}

export async function fetchGradeCard(
  enrollmentNo: string,
  programmeCode: string,
  type?: number
): Promise<GradeCardResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/gradecard/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_no: enrollmentNo,
        programme_code: programmeCode,
        type: type
      }),
      cache: 'no-store'
    });

    if (res.ok) {
      return await res.json();
    } else {
      return {
        status: "error",
        message: "Incorrect details provided or Grade Card not found."
      };
    }
  } catch (_e) {
    return {
      status: "error",
      message: "Incorrect details provided or Grade Card not found."
    };
  }
}

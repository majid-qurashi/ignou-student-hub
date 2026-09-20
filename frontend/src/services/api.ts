import { IGNOU_PROGRAMMES } from '../lib/programmes';
import { AVAILABLE_YEARS } from '../lib/data';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';
};


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
  course_code: string;
  course_title?: string;
  credits?: number | string;
  semester?: string;
  assignment_marks: number | string;
  tee_theory_marks: number | string;
  tee_practical_marks: number | string;
  overall_marks: number | string;
  status: string;
  // Backward compatibility fields
  course?: string;
  asgn1?: number | string;
  lab1?: number | string;
  lab2?: number | string;
  lab3?: number | string;
  lab4?: number | string;
  term_end_theory?: number | string;
  term_end_practical?: number | string;
  calculated_score?: number | string;
  evaluated_component_type?: string;
}

export interface GradeCardResponse {
  status: string; // "success" or "error"
  message?: string;
  report_id?: string;
  student_info?: {
    student_name: string;
    enrollment_no: string;
    programme?: string;
    programme_code?: string;
    program?: string;
    status_date?: string;
    retrieved_on?: string;
    type_group?: string;
    ignou_type?: number;
    official_portal_url?: string;
  };
  summary?: {
    overall_percentage?: number | null;
    total_courses: number;
    completed_courses: number;
    not_completed_courses: number;
    calculation_method?: string;
    calculation_status?: string;
    total_credits?: number;
  };
  courses?: CourseDetailItem[];
  course_details?: CourseDetailItem[];
}

export async function fetchApiProgrammes(): Promise<{ code: string; name: string; category?: string }[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/programmes`, { cache: 'no-store' });
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/programmes/${encodeURIComponent(programmeCode)}/sessions`, { cache: 'no-store' });
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(
      `${baseUrl}/programmes/${encodeURIComponent(programmeCode)}/courses?session=${encodeURIComponent(sessionLabel)}`,
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
    const baseUrl = getApiBaseUrl();
    let url = `${baseUrl}/assignments?programme=${encodeURIComponent(programmeCode)}&session=${encodeURIComponent(sessionLabel)}`;
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/gradecard/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_no: enrollmentNo,
        programme_code: programmeCode,
        type: type
      }),
      cache: 'no-store'
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return data;
    } else if (data && data.message) {
      return {
        status: "error",
        message: data.message
      };
    } else {
      return {
        status: "error",
        message: `API request failed (HTTP ${res.status}). Please verify your connection or try again later.`
      };
    }
  } catch (_e) {
    return {
      status: "error",
      message: "Network error: Unable to connect to server. Please check your internet connection."
    };
  }
}

export async function downloadMarksReport(
  reportId?: string,
  gradeCardData?: any,
  fallbackFilename?: string
): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/gradecard/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: reportId,
        grade_card_data: gradeCardData
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      return false;
    }

    const blob = await res.blob();
    // Determine filename from content-disposition header if present
    let filename = fallbackFilename || 'ignou-marks-report.pdf';
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1].trim();
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    return true;
  } catch (_e) {
    return false;
  }
}


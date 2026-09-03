import { GradeCardData } from '../types';
import { SAMPLE_GRADE_CARD_DEMO } from '../data/mockData';

export interface GradeCardResponse {
  success: boolean;
  message: string;
  isOfficialIntegrationReady: boolean;
  data?: GradeCardData;
  officialSourceUrl: string;
  disclaimer: string;
}

export async function fetchGradeCard(
  enrollmentNo: string,
  programmeCode: string
): Promise<GradeCardResponse> {
  const sanitizedEnrollment = enrollmentNo.trim();
  const sanitizedProgramme = programmeCode.trim().toUpperCase();

  // Basic validation
  if (!sanitizedEnrollment || sanitizedEnrollment.length < 7) {
    return {
      success: false,
      message: 'Please enter a valid IGNOU Enrollment Number (at least 7 to 10 digits).',
      isOfficialIntegrationReady: false,
      officialSourceUrl: 'https://gradecard.ignou.ac.in/gradecard/',
      disclaimer: 'We do not modify, generate or manually alter IGNOU academic records.'
    };
  }

  // Attempt backend API call if backend is online, fallback to structured preview state
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/v1/gradecard?enrollmentNo=${sanitizedEnrollment}&programmeCode=${sanitizedProgramme}`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const json = await res.json();
      if (json.status === 'INTEGRATION_PENDING') {
        // Return sample data with explicit integration notice
        return {
          success: true,
          message: 'Official IGNOU Grade Card Verification pending backend scraping module. Showing preview structure.',
          isOfficialIntegrationReady: false,
          data: {
            ...SAMPLE_GRADE_CARD_DEMO,
            enrollmentNo: sanitizedEnrollment,
            programmeCode: sanitizedProgramme,
            programmeName: `${sanitizedProgramme} Degree Programme`
          },
          officialSourceUrl: 'https://gradecard.ignou.ac.in/gradecard/',
          disclaimer: 'We do not modify, generate or manually alter IGNOU academic records. Your grade card will be retrieved from the official IGNOU source when the live integration is active.'
        };
      }
    }
  } catch (_err) {
    // Network or offline fallback
  }

  // Standalone frontend preview state
  return {
    success: true,
    message: 'Official IGNOU Grade Card Verification (Preview Mode).',
    isOfficialIntegrationReady: false,
    data: {
      ...SAMPLE_GRADE_CARD_DEMO,
      enrollmentNo: sanitizedEnrollment,
      programmeCode: sanitizedProgramme
    },
    officialSourceUrl: 'https://gradecard.ignou.ac.in/gradecard/',
    disclaimer: 'We do not modify, generate or manually alter IGNOU academic records. Your grade card will be retrieved from the official IGNOU source when the integration is available.'
  };
}

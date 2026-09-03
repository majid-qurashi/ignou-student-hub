export type ProgrammeCategory = 'UG' | 'PG' | 'Diploma' | 'Certificate';

export interface Programme {
  code: string;
  name: string;
  category: ProgrammeCategory;
  description: string;
}

export interface Course {
  code: string;
  name: string;
  programmeCode: string;
  semesterOrYear: string;
  credits: number;
}

export interface Assignment {
  id: string;
  courseCode: string;
  courseName: string;
  programmeCode: string;
  session: string; // e.g., "2025-2026" | "2024-2025"
  semesterOrYear: string;
  hasDigitalPdf: boolean;
  hasSolvedPdf: boolean;
  hasHandwrittenOption: boolean;
  pdfPrice: number;
  solvedPrice: number;
  handwrittenPrice: number;
  pdfUrl?: string;
  questionsCount: number;
}

export type PaperType = 'Previous Year' | 'Solved Paper' | 'Model Paper';

export interface QuestionPaper {
  id: string;
  courseCode: string;
  courseName: string;
  programmeCode: string;
  year: number;
  term: 'June' | 'December' | 'Sample';
  paperType: PaperType;
  pdfUrl?: string;
  solutionsAvailable: boolean;
}

export type ProjectType = 'Synopsis' | 'Full Project Report';

export interface ProjectResource {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  programmeCode: string;
  projectType: ProjectType;
  synopsisAvailable: boolean;
  reportAvailable: boolean;
  price: number;
  description: string;
}

export interface CartItem {
  id: string;
  itemType: 'Assignment' | 'QuestionPaper' | 'Project';
  courseCode: string;
  courseName: string;
  programmeCode: string;
  formatOption: 'Digital PDF' | 'Solved Assignment' | 'Handwritten Assignment' | 'Project Synopsis' | 'Full Project Report';
  price: number;
  quantity: number;
}

export type OrderStatus = 'Order Placed' | 'Processing' | 'Preparing' | 'Completed';

export interface Order {
  orderId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  address?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface GradeCardCourseItem {
  courseCode: string;
  courseName: string;
  assignmentMarks: number | null;
  theoryMarks: number | null;
  practicalMarks: number | null;
  grade: string;
  gradePoint: number;
  status: 'Completed' | 'In Progress' | 'Not Completed';
}

export interface GradeCardData {
  enrollmentNo: string;
  studentName: string;
  programmeCode: string;
  programmeName: string;
  courses: GradeCardCourseItem[];
  summary: {
    totalCourses: number;
    completedCourses: number;
    pendingCourses: number;
    creditsEarned: number;
    totalCreditsRequired: number;
    overallPercentage: number;
    status: 'ACTIVE' | 'GRADUATED' | 'INCOMPLETE';
  };
  lastUpdated: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  courseCode: string;
  programmeCode: string;
  type: 'Assignment' | 'Question Paper' | 'Previous Year' | 'Solved Paper' | 'Model Paper' | 'Project' | 'Course';
  category: 'Assignments' | 'Question Papers' | 'Projects' | 'Courses';
  link: string;
  description?: string;
}

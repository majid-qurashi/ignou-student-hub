import { Programme, Course, Assignment, QuestionPaper, ProjectResource, GradeCardData } from '../types';

export const PROGRAMMES: Programme[] = [
  { code: 'BCA', name: 'Bachelor of Computer Applications', category: 'UG', description: 'Undergraduate computer application & programming degree.' },
  { code: 'MCA', name: 'Master of Computer Applications', category: 'PG', description: 'Postgraduate advanced computer application & software engineering.' },
  { code: 'BA', name: 'Bachelor of Arts (General)', category: 'UG', description: 'Undergraduate multi-disciplinary arts programme.' },
  { code: 'BCom', name: 'Bachelor of Commerce', category: 'UG', description: 'Undergraduate commerce, accountancy & business studies.' },
  { code: 'MA', name: 'Master of Arts (English / Political Science / History)', category: 'PG', description: 'Postgraduate humanities & social science degree.' },
  { code: 'MCom', name: 'Master of Commerce', category: 'PG', description: 'Postgraduate degree in financial management & commerce.' },
  { code: 'MBA', name: 'Master of Business Administration', category: 'PG', description: 'Postgraduate management & executive leadership programme.' },
  { code: 'BSc', name: 'Bachelor of Science', category: 'UG', description: 'Undergraduate pure sciences programme.' },
  { code: 'MSc', name: 'Master of Science', category: 'PG', description: 'Postgraduate specialized science degree.' },
  { code: 'BSW', name: 'Bachelor of Social Work', category: 'UG', description: 'Undergraduate professional social service degree.' },
  { code: 'MSW', name: 'Master of Social Work', category: 'PG', description: 'Postgraduate social development & welfare degree.' }
];

export const COURSES: Course[] = [
  { code: 'MCS-011', name: 'Problem Solving and Programming', programmeCode: 'BCA', semesterOrYear: 'Semester 1', credits: 3 },
  { code: 'MCS-012', name: 'Computer Organisation and Assembly Language Programming', programmeCode: 'BCA', semesterOrYear: 'Semester 1', credits: 4 },
  { code: 'MCS-013', name: 'Discrete Mathematics', programmeCode: 'BCA', semesterOrYear: 'Semester 1', credits: 2 },
  { code: 'BCSL-013', name: 'Computer Basics and PC Software Lab', programmeCode: 'BCA', semesterOrYear: 'Semester 1', credits: 2 },
  { code: 'FEG-02', name: 'Foundation Course in English-2', programmeCode: 'BA', semesterOrYear: 'Year 1', credits: 4 },
  { code: 'ECO-01', name: 'Elements of Business Mathematics', programmeCode: 'BCom', semesterOrYear: 'Year 1', credits: 4 },
  { code: 'MCO-01', name: 'Organization Theory and Behaviour', programmeCode: 'MCom', semesterOrYear: 'Year 1', credits: 6 },
  { code: 'MS-08', name: 'Quantitative Techniques for Managerial Decisions', programmeCode: 'MBA', semesterOrYear: 'Semester 1', credits: 6 },
  { code: 'MCS-211', name: 'Design and Analysis of Algorithms', programmeCode: 'MCA', semesterOrYear: 'Semester 1', credits: 4 },
  { code: 'BSWE-001', name: 'Introduction to Social Work', programmeCode: 'BSW', semesterOrYear: 'Year 1', credits: 6 },
  { code: 'MEG-01', name: 'British Poetry', programmeCode: 'MA', semesterOrYear: 'Year 1', credits: 8 },
  { code: 'CHE-01', name: 'Atoms and Molecules', programmeCode: 'BSc', semesterOrYear: 'Year 1', credits: 4 }
];

export const ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-mcs011-2025',
    courseCode: 'MCS-011',
    courseName: 'Problem Solving and Programming',
    programmeCode: 'BCA',
    session: '2025-2026',
    semesterOrYear: 'Semester 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 39,
    solvedPrice: 69,
    handwrittenPrice: 249,
    questionsCount: 5
  },
  {
    id: 'asg-mcs012-2025',
    courseCode: 'MCS-012',
    courseName: 'Computer Organisation and Assembly Language',
    programmeCode: 'BCA',
    session: '2025-2026',
    semesterOrYear: 'Semester 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 39,
    solvedPrice: 69,
    handwrittenPrice: 249,
    questionsCount: 4
  },
  {
    id: 'asg-feg02-2025',
    courseCode: 'FEG-02',
    courseName: 'Foundation Course in English-2',
    programmeCode: 'BA',
    session: '2025-2026',
    semesterOrYear: 'Year 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 29,
    solvedPrice: 49,
    handwrittenPrice: 199,
    questionsCount: 6
  },
  {
    id: 'asg-eco01-2025',
    courseCode: 'ECO-01',
    courseName: 'Elements of Business Mathematics',
    programmeCode: 'BCom',
    session: '2025-2026',
    semesterOrYear: 'Year 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 35,
    solvedPrice: 59,
    handwrittenPrice: 229,
    questionsCount: 5
  },
  {
    id: 'asg-mco01-2025',
    courseCode: 'MCO-01',
    courseName: 'Organization Theory and Behaviour',
    programmeCode: 'MCom',
    session: '2025-2026',
    semesterOrYear: 'Year 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 49,
    solvedPrice: 79,
    handwrittenPrice: 279,
    questionsCount: 5
  },
  {
    id: 'asg-ms08-2025',
    courseCode: 'MS-08',
    courseName: 'Quantitative Techniques for Managerial Decisions',
    programmeCode: 'MBA',
    session: '2025-2026',
    semesterOrYear: 'Semester 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 49,
    solvedPrice: 89,
    handwrittenPrice: 299,
    questionsCount: 5
  },
  {
    id: 'asg-mcs211-2025',
    courseCode: 'MCS-211',
    courseName: 'Design and Analysis of Algorithms',
    programmeCode: 'MCA',
    session: '2025-2026',
    semesterOrYear: 'Semester 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 45,
    solvedPrice: 75,
    handwrittenPrice: 269,
    questionsCount: 4
  },
  {
    id: 'asg-meg01-2025',
    courseCode: 'MEG-01',
    courseName: 'British Poetry',
    programmeCode: 'MA',
    session: '2025-2026',
    semesterOrYear: 'Year 1',
    hasDigitalPdf: true,
    hasSolvedPdf: true,
    hasHandwrittenOption: true,
    pdfPrice: 39,
    solvedPrice: 65,
    handwrittenPrice: 219,
    questionsCount: 5
  }
];

export const QUESTION_PAPERS: QuestionPaper[] = [
  { id: 'qp-mcs011-dec2024', courseCode: 'MCS-011', courseName: 'Problem Solving and Programming', programmeCode: 'BCA', year: 2024, term: 'December', paperType: 'Previous Year', solutionsAvailable: true },
  { id: 'qp-mcs011-june2024', courseCode: 'MCS-011', courseName: 'Problem Solving and Programming', programmeCode: 'BCA', year: 2024, term: 'June', paperType: 'Previous Year', solutionsAvailable: true },
  { id: 'qp-mcs011-model2025', courseCode: 'MCS-011', courseName: 'Problem Solving and Programming', programmeCode: 'BCA', year: 2025, term: 'Sample', paperType: 'Model Paper', solutionsAvailable: true },
  { id: 'qp-mcs012-dec2024', courseCode: 'MCS-012', courseName: 'Computer Organisation and Assembly Language', programmeCode: 'BCA', year: 2024, term: 'December', paperType: 'Previous Year', solutionsAvailable: true },
  { id: 'qp-feg02-june2024', courseCode: 'FEG-02', courseName: 'Foundation Course in English-2', programmeCode: 'BA', year: 2024, term: 'June', paperType: 'Previous Year', solutionsAvailable: true },
  { id: 'qp-eco01-dec2024', courseCode: 'ECO-01', courseName: 'Elements of Business Mathematics', programmeCode: 'BCom', year: 2024, term: 'December', paperType: 'Solved Paper', solutionsAvailable: true },
  { id: 'qp-mco01-model2025', courseCode: 'MCO-01', courseName: 'Organization Theory and Behaviour', programmeCode: 'MCom', year: 2025, term: 'Sample', paperType: 'Model Paper', solutionsAvailable: true },
  { id: 'qp-ms08-june2024', courseCode: 'MS-08', courseName: 'Quantitative Techniques for Managerial Decisions', programmeCode: 'MBA', year: 2024, term: 'June', paperType: 'Solved Paper', solutionsAvailable: true }
];

export const PROJECT_RESOURCES: ProjectResource[] = [
  {
    id: 'prj-bcsp064-01',
    title: 'Online Student Portal & Service Management System',
    courseCode: 'BCSP-064',
    courseName: 'BCA Major Project',
    programmeCode: 'BCA',
    projectType: 'Full Project Report',
    synopsisAvailable: true,
    reportAvailable: true,
    price: 499,
    description: 'Comprehensive Web Application project report with synopsis, ER diagram, DFD, source code structure, and viva guidance.'
  },
  {
    id: 'prj-mcsp232-01',
    title: 'AI-Based Attendance & Document Verification System',
    courseCode: 'MCSP-232',
    courseName: 'MCA Major Project',
    programmeCode: 'MCA',
    projectType: 'Synopsis',
    synopsisAvailable: true,
    reportAvailable: true,
    price: 299,
    description: 'Approved synopsis topic with detailed objective, literature review, software requirements, module description, and references.'
  },
  {
    id: 'prj-ms100-01',
    title: 'Employee Retention Strategies in IT Sector',
    courseCode: 'MS-100',
    courseName: 'MBA Project Work',
    programmeCode: 'MBA',
    projectType: 'Full Project Report',
    synopsisAvailable: true,
    reportAvailable: true,
    price: 599,
    description: 'HR specialization project report with questionnaire, survey data analysis using SPSS, findings, and managerial implications.'
  },
  {
    id: 'prj-mswp001-01',
    title: 'Impact of Community Support Programs in Rural Areas',
    courseCode: 'MSWP-001',
    courseName: 'MSW Project Dissertation',
    programmeCode: 'MSW',
    projectType: 'Synopsis',
    synopsisAvailable: true,
    reportAvailable: false,
    price: 349,
    description: 'Social work field work dissertation synopsis including methodology, sample size, hypothesis, and interview schedule.'
  }
];

export const SAMPLE_GRADE_CARD_DEMO: GradeCardData = {
  enrollmentNo: '2101234567',
  studentName: 'Aarav Sharma',
  programmeCode: 'BCA',
  programmeName: 'Bachelor of Computer Applications',
  courses: [
    { courseCode: 'MCS-011', courseName: 'Problem Solving and Programming', assignmentMarks: 85, theoryMarks: 72, practicalMarks: null, grade: 'A', gradePoint: 9, status: 'Completed' },
    { courseCode: 'MCS-012', courseName: 'Computer Organisation and Assembly Language', assignmentMarks: 78, theoryMarks: 64, practicalMarks: null, grade: 'B', gradePoint: 8, status: 'Completed' },
    { courseCode: 'MCS-013', courseName: 'Discrete Mathematics', assignmentMarks: 88, theoryMarks: 68, practicalMarks: null, grade: 'B', gradePoint: 8, status: 'Completed' },
    { courseCode: 'BCSL-013', courseName: 'Computer Basics Lab', assignmentMarks: null, theoryMarks: null, practicalMarks: 90, grade: 'A', gradePoint: 10, status: 'Completed' },
    { courseCode: 'FEG-02', courseName: 'Foundation Course in English-2', assignmentMarks: 82, theoryMarks: 65, practicalMarks: null, grade: 'B', gradePoint: 8, status: 'Completed' },
    { courseCode: 'ECO-01', courseName: 'Elements of Business Mathematics', assignmentMarks: 75, theoryMarks: 58, practicalMarks: null, grade: 'C', gradePoint: 7, status: 'In Progress' }
  ],
  summary: {
    totalCourses: 6,
    completedCourses: 5,
    pendingCourses: 1,
    creditsEarned: 15,
    totalCreditsRequired: 96,
    overallPercentage: 73.6,
    status: 'ACTIVE'
  },
  lastUpdated: '2026-02-15'
};

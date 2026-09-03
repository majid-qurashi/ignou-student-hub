export const AVAILABLE_YEARS = [
  '2026-27',
  '2025-26',
  '2024-25',
  '2023-24'
];

export interface AssignmentItem {
  id: string;
  courseCode: string;
  courseName: string;
  programme: string;
  year: string;
  pdfUrl?: string;
  questions: string[];
}

export const SAMPLE_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'bcs011-2026-27',
    courseCode: 'BCS-011',
    courseName: 'Computer Basics and PC Software',
    programme: 'BCA',
    year: '2026-27',
    questions: [
      'Q1. Explain the architecture of modern CPU and von Neumann machine model.',
      'Q2. Differentiate between RAM and ROM memory types with examples.',
      'Q3. What is an Operating System? List 4 functions of OS.',
      'Q4. Write steps to create a table in MS Word and calculate sum in MS Excel.'
    ]
  },
  {
    id: 'bcs012-2026-27',
    courseCode: 'BCS-012',
    courseName: 'Basic Mathematics',
    programme: 'BCA',
    year: '2026-27',
    questions: [
      'Q1. Find the inverse of a 3x3 matrix using determinant method.',
      'Q2. Solve the system of linear equations using Cramer’s Rule.',
      'Q3. Evaluate the limit of (x^2 - 4)/(x - 2) as x approaches 2.',
      'Q4. Find the derivative of f(x) = sin(x) * e^x.'
    ]
  },
  {
    id: 'mcs011-2026-27',
    courseCode: 'MCS-011',
    courseName: 'Problem Solving and Programming in C',
    programme: 'BCA',
    year: '2026-27',
    questions: [
      'Q1. Write a C program to check whether a number is prime or composite.',
      'Q2. Explain call by value and call by reference with C code example.',
      'Q3. What is a structure in C? How does it differ from a union?',
      'Q4. Write a program to perform binary search on an array of integers.'
    ]
  },
  {
    id: 'mcs012-2026-27',
    courseCode: 'MCS-012',
    courseName: 'Computer Organisation and Assembly Language',
    programme: 'BCA',
    year: '2026-27',
    questions: [
      'Q1. Draw logic diagram for 4-to-1 Multiplexer and write truth table.',
      'Q2. Differentiate between RISC and CISC architectures.',
      'Q3. Explain cache mapping techniques (Direct, Associative, Set-Associative).'
    ]
  },
  {
    id: 'feg02-2026-27',
    courseCode: 'FEG-02',
    courseName: 'Foundation Course in English-2',
    programme: 'BAG',
    year: '2026-27',
    questions: [
      'Q1. Read the passage and answer the comprehension questions.',
      'Q2. Write a formal letter to the Municipal Commissioner regarding local sanitation.',
      'Q3. Write an essay on "Role of Digital Education in Rural India".'
    ]
  },
  {
    id: 'eco01-2026-27',
    courseCode: 'ECO-01',
    courseName: 'Elements of Business Mathematics',
    programme: 'BCOMG',
    year: '2026-27',
    questions: [
      'Q1. Calculate simple and compound interest on ₹50,000 for 3 years at 8% per annum.',
      'Q2. Formulate linear programming problem for profit maximization.'
    ]
  },
  {
    id: 'mco01-2026-27',
    courseCode: 'MCO-01',
    courseName: 'Organization Theory and Behaviour',
    programme: 'MCOM',
    year: '2026-27',
    questions: [
      'Q1. Discuss Maslow’s Hierarchy of Needs theory and its managerial application.',
      'Q2. Compare classical organization theory with neo-classical approaches.'
    ]
  },
  {
    id: 'mcs211-2026-27',
    courseCode: 'MCS-211',
    courseName: 'Design and Analysis of Algorithms',
    programme: 'MCA',
    year: '2026-27',
    questions: [
      'Q1. Explain Asymptotic Notations (Big-O, Omega, Theta) with graphs.',
      'Q2. Write Merge Sort algorithm and derive its time complexity using recurrence relation.'
    ]
  }
];

export interface QuestionPaperItem {
  id: string;
  courseCode: string;
  courseName: string;
  programme: string;
  year: string;
  term: string;
  isSolved: boolean;
}

export const SAMPLE_QUESTION_PAPERS: QuestionPaperItem[] = [
  { id: 'qp-bcs011-2025', courseCode: 'BCS-011', courseName: 'Computer Basics and PC Software', programme: 'BCA', year: '2025', term: 'December TEE', isSolved: true },
  { id: 'qp-bcs012-2025', courseCode: 'BCS-012', courseName: 'Basic Mathematics', programme: 'BCA', year: '2025', term: 'June TEE', isSolved: true },
  { id: 'qp-mcs011-2024', courseCode: 'MCS-011', courseName: 'Problem Solving and Programming in C', programme: 'BCA', year: '2024', term: 'December TEE', isSolved: false },
  { id: 'qp-feg02-2025', courseCode: 'FEG-02', courseName: 'Foundation Course in English-2', programme: 'BAG', year: '2025', term: 'June TEE', isSolved: true }
];

export interface ModelPaperItem {
  id: string;
  courseCode: string;
  courseName: string;
  programme: string;
  year: string;
}

export const SAMPLE_MODEL_PAPERS: ModelPaperItem[] = [
  { id: 'mp-bcs011-2026', courseCode: 'BCS-011', courseName: 'Computer Basics Practice Model Paper', programme: 'BCA', year: '2026-27' },
  { id: 'mp-bcs012-2026', courseCode: 'BCS-012', courseName: 'Mathematics Practice Model Paper', programme: 'BCA', year: '2026-27' }
];

export interface ProjectItem {
  id: string;
  title: string;
  courseCode: string;
  programme: string;
  type: 'Synopsis' | 'Report';
}

export const SAMPLE_PROJECTS: ProjectItem[] = [
  { id: 'prj-bcsp064-01', title: 'Student Management & Portal System', courseCode: 'BCSP-064', programme: 'BCA', type: 'Report' },
  { id: 'prj-mcsp232-01', title: 'Library Document Verification System Synopsis', courseCode: 'MCSP-232', programme: 'MCA', type: 'Synopsis' }
];

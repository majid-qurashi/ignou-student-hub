import { ASSIGNMENTS, QUESTION_PAPERS, PROJECT_RESOURCES, COURSES } from '../data/mockData';
import { SearchResultItem } from '../types';

export function searchAllResources(query: string): {
  query: string;
  totalResults: number;
  grouped: {
    Assignments: SearchResultItem[];
    'Question Papers': SearchResultItem[];
    Projects: SearchResultItem[];
    Courses: SearchResultItem[];
  };
} {
  const q = query.trim().toLowerCase();
  
  if (!q) {
    return {
      query: '',
      totalResults: 0,
      grouped: {
        Assignments: [],
        'Question Papers': [],
        Projects: [],
        Courses: []
      }
    };
  }

  const assignmentResults: SearchResultItem[] = ASSIGNMENTS.filter(
    (a) =>
      a.courseCode.toLowerCase().includes(q) ||
      a.courseName.toLowerCase().includes(q) ||
      a.programmeCode.toLowerCase().includes(q)
  ).map((a) => ({
    id: a.id,
    title: `${a.courseCode}: ${a.courseName} (${a.session})`,
    courseCode: a.courseCode,
    programmeCode: a.programmeCode,
    type: 'Assignment',
    category: 'Assignments',
    link: `/assignments/${a.courseCode}`,
    description: `Session: ${a.session} | ${a.semesterOrYear} | Digital PDF & Handwritten available`
  }));

  const paperResults: SearchResultItem[] = QUESTION_PAPERS.filter(
    (p) =>
      p.courseCode.toLowerCase().includes(q) ||
      p.courseName.toLowerCase().includes(q) ||
      p.programmeCode.toLowerCase().includes(q) ||
      p.paperType.toLowerCase().includes(q)
  ).map((p) => ({
    id: p.id,
    title: `${p.courseCode}: ${p.courseName} - ${p.term} ${p.year} (${p.paperType})`,
    courseCode: p.courseCode,
    programmeCode: p.programmeCode,
    type: p.paperType,
    category: 'Question Papers',
    link: `/question-papers?course=${p.courseCode}`,
    description: `${p.paperType} for ${p.term} ${p.year} exams.`
  }));

  const projectResults: SearchResultItem[] = PROJECT_RESOURCES.filter(
    (pr) =>
      pr.title.toLowerCase().includes(q) ||
      pr.courseCode.toLowerCase().includes(q) ||
      pr.programmeCode.toLowerCase().includes(q) ||
      pr.description.toLowerCase().includes(q)
  ).map((pr) => ({
    id: pr.id,
    title: pr.title,
    courseCode: pr.courseCode,
    programmeCode: pr.programmeCode,
    type: 'Project',
    category: 'Projects',
    link: `/projects`,
    description: pr.description
  }));

  const courseResults: SearchResultItem[] = COURSES.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.programmeCode.toLowerCase().includes(q)
  ).map((c) => ({
    id: c.code,
    title: `${c.code}: ${c.name}`,
    courseCode: c.code,
    programmeCode: c.programmeCode,
    type: 'Course',
    category: 'Courses',
    link: `/assignments/${c.code}`,
    description: `Programme: ${c.programmeCode} | ${c.semesterOrYear} | ${c.credits} Credits`
  }));

  const totalResults =
    assignmentResults.length +
    paperResults.length +
    projectResults.length +
    courseResults.length;

  return {
    query,
    totalResults,
    grouped: {
      Assignments: assignmentResults,
      'Question Papers': paperResults,
      Projects: projectResults,
      Courses: courseResults
    }
  };
}

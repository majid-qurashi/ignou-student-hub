import { ParsedCourse } from './gradeCardParser';

export interface CalculationSummary {
  overall_percentage: number | null;
  total_courses: number;
  completed_courses: number;
  not_completed_courses: number;
  calculation_method: string;
  calculation_status: 'SUCCESS' | 'INSUFFICIENT_DATA' | 'RULE_NOT_AVAILABLE' | 'NO_COURSES';
  total_credits?: number;
}

export interface CalculationResult {
  summary: CalculationSummary;
  evaluated_courses: ParsedCourse[];
}

export class GradeCardCalculator {
  /**
   * Programme-specific and course-type aware IGNOU percentage calculation engine.
   *
   * 1. THEORY COURSES:
   *    Where official programme/course rule specifies:
   *    Assignment / Continuous Evaluation = 30%, TEE = 70%
   *    Final Course Marks = (Assignment × 0.30) + (TEE × 0.70)
   *    (For BCA: Assignment = 25%, TEE = 75%)
   *
   * 2. PRACTICAL / LAB COURSES:
   *    Does NOT automatically use 30:70 for practical courses.
   *    - Where programme specifies continuous 70% + term-end practical 30% (e.g. BCA/MCA Lab):
   *      Final Practical Marks = (Continuous Practical × 0.70) + (TEE Practical × 0.30)
   *    - Where programme specifies 50% Continuous + 50% Practical exam (e.g. B.Sc. / BSCG science labs):
   *      Final Practical Marks = (Continuous Practical × 0.50) + (TEE Practical × 0.50)
   *    - Standalone practical:
   *      Final Practical Marks = TEE Practical × 1.0
   *
   * 3. PROJECT COURSES:
   *    Final Marks = Project / Viva Marks × 1.0
   */
  public static calculate(programmeCode: string, courses: ParsedCourse[]): CalculationResult {
    const code = programmeCode.toUpperCase().trim();
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      c => String(c.status || '').toUpperCase() === 'COMPLETED'
    ).length;
    const notCompletedCourses = totalCourses - completedCourses;

    if (totalCourses === 0) {
      return {
        summary: {
          overall_percentage: null,
          total_courses: 0,
          completed_courses: 0,
          not_completed_courses: 0,
          calculation_method: 'No courses found in grade card',
          calculation_status: 'NO_COURSES'
        },
        evaluated_courses: []
      };
    }

    if (code === 'BSCM') {
      return this.evalBscm(courses, totalCourses, completedCourses, notCompletedCourses);
    } else if (['BCA', 'BCAOL', 'BCA_NEW', 'BCA_NEWOL'].includes(code)) {
      return this.evalBca(courses, totalCourses, completedCourses, notCompletedCourses);
    } else if (['MCA', 'MCAOL', 'MCA_NEW', 'MCA_NEWOL', 'PGDCA', 'PGDCA_NEW'].includes(code)) {
      return this.evalMca(courses, totalCourses, completedCourses, notCompletedCourses);
    } else if (['BDP', 'BA', 'BCOM', 'BSC'].includes(code)) {
      return this.evalStandardUg(
        'BDP/BA/B.Com/B.Sc. Standard (Theory: 30:70 | Science Lab: 50:50)',
        courses, totalCourses, completedCourses, notCompletedCourses
      );
    } else if (
      ['BAG', 'BCOMG', 'BSCG', 'BSWG', 'BSWGOL'].includes(code) ||
      ['BAE', 'BAH', 'BAP', 'BAS', 'BAV', 'BSC', 'BCOM'].some(prefix => code.startsWith(prefix))
    ) {
      return this.evalCbcs(
        'CBCS Standard (Theory: 30% Assignment + 70% TEE | Science Lab: 50:50)',
        courses, totalCourses, completedCourses, notCompletedCourses
      );
    } else if (
      ['MBA', 'MBAOL', 'MBF', 'MCOM', 'MEG', 'MHD', 'MAH', 'MPS', 'MSO', 'MSW', 'MLIS', 'MP'].includes(code)
    ) {
      return this.evalMasters(
        "Master's Standard (30% Assignment + 70% TEE)",
        courses, totalCourses, completedCourses, notCompletedCourses
      );
    } else {
      // Rule not available - preserve exact portal values without fabricating numbers
      const evaluated = courses.map(c => ({
        ...c,
        overall_marks: c.overall_marks !== undefined && c.overall_marks !== null && c.overall_marks !== ''
          ? c.overall_marks
          : '-'
      }));

      return {
        summary: {
          overall_percentage: null,
          total_courses: totalCourses,
          completed_courses: completedCourses,
          not_completed_courses: notCompletedCourses,
          calculation_method: 'Percentage calculation is not currently available for this programme.',
          calculation_status: 'RULE_NOT_AVAILABLE'
        },
        evaluated_courses: evaluated
      };
    }
  }

  private static parseNum(val: any): number | null {
    if (val === null || val === undefined || ['', '-', '--', 'NC', 'AB', 'ABS', 'N/A', 'NA'].includes(val)) {
      return null;
    }
    const num = Number(val);
    return isNaN(num) ? null : num;
  }

  private static isProject(courseCode: string, title: string = ''): boolean {
    const c = courseCode.toUpperCase();
    const t = title.toUpperCase();
    const projectPrefixes = ['MCSP', 'BCSP', 'CS76', 'PTS', 'MPP', 'MEDP'];
    return projectPrefixes.some(p => c.startsWith(p)) || c.includes('PROJECT') || t.includes('PROJECT') || c.includes('VIVA');
  }

  private static isPractical(courseCode: string, title: string = ''): boolean {
    const c = courseCode.toUpperCase();
    const t = title.toUpperCase();
    if (this.isProject(c, t)) return false;

    const practicalPrefixes = ['BCSL', 'MCSL', 'CITL', 'BPHCL', 'BCHCL', 'BBYCL', 'BZYCL', 'PHE', 'CHE', 'LSE'];
    return (
      c.endsWith('L') ||
      c.endsWith('P') ||
      c.includes('LAB') ||
      t.includes('LAB') ||
      c.includes('PRACTICAL') ||
      t.includes('PRACTICAL') ||
      practicalPrefixes.some(p => c.startsWith(p))
    );
  }

  private static round2(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  private static evalBscm(
    courses: ParsedCourse[],
    total: number,
    completed: number,
    notCompleted: number
  ): CalculationResult {
    const evaluatedCourses: ParsedCourse[] = [];
    const scoresForPct: number[] = [];

    for (const c of courses) {
      const item: ParsedCourse = { ...c };
      const code = String(item.course_code || '').toUpperCase();
      const title = String(item.course_title || '');
      const asgn = this.parseNum(item.assignment_marks);
      const teeT = this.parseNum(item.tee_theory_marks);
      const teeP = this.parseNum(item.tee_practical_marks);
      const lab1 = this.parseNum(item.lab1);
      const lab2 = this.parseNum(item.lab2);
      const lab = lab1 !== null ? lab1 : lab2;

      let score: number | null = null;

      if (this.isPractical(code, title)) {
        const continuous = lab !== null ? lab : asgn;
        if (continuous !== null && teeP !== null) {
          // B.Sc. Science Lab Rule: 50% Continuous + 50% Practical Exam
          score = this.round2((continuous * 0.50) + (teeP * 0.50));
        } else if (teeP !== null) {
          score = this.round2(teeP);
        } else if (continuous !== null) {
          score = this.round2(continuous);
        }
      } else {
        // Theory Course: Official 30:70 Rule
        if (asgn !== null && teeT !== null) {
          score = this.round2((asgn * 0.30) + (teeT * 0.70));
        } else if (item.overall_marks !== '-' && item.overall_marks !== null) {
          score = this.parseNum(item.overall_marks);
        }
      }

      if (score !== null) {
        item.overall_marks = score;
        if (String(item.status || '').toUpperCase() === 'COMPLETED') {
          scoresForPct.push(score);
        }
      } else {
        if (item.overall_marks === null || item.overall_marks === undefined || item.overall_marks === '') {
          item.overall_marks = '-';
        }
      }

      evaluatedCourses.push(item);
    }

    const pct = scoresForPct.length > 0
      ? this.round2(scoresForPct.reduce((a, b) => a + b, 0) / scoresForPct.length)
      : null;

    return {
      summary: {
        overall_percentage: pct,
        total_courses: total,
        completed_courses: completed,
        not_completed_courses: notCompleted,
        calculation_method: 'BSCM Rule (Theory: 30% Assignment + 70% TEE | Lab: 50% Continuous + 50% Practical)',
        calculation_status: pct !== null ? 'SUCCESS' : 'INSUFFICIENT_DATA'
      },
      evaluated_courses: evaluatedCourses
    };
  }

  private static evalBca(
    courses: ParsedCourse[],
    total: number,
    completed: number,
    notCompleted: number
  ): CalculationResult {
    const evaluatedCourses: ParsedCourse[] = [];
    const scoresForPct: number[] = [];

    for (const c of courses) {
      const item: ParsedCourse = { ...c };
      const code = String(item.course_code || '').toUpperCase();
      const title = String(item.course_title || '');
      const asgn = this.parseNum(item.assignment_marks);
      const teeT = this.parseNum(item.tee_theory_marks);
      const teeP = this.parseNum(item.tee_practical_marks);
      const lab1 = this.parseNum(item.lab1);
      const lab2 = this.parseNum(item.lab2);
      const lab = lab1 !== null ? lab1 : lab2;

      let score: number | null = null;

      if (this.isProject(code, title)) {
        const proj = teeP !== null ? teeP : (lab !== null ? lab : teeT);
        if (proj !== null) score = this.round2(proj);
      } else if (this.isPractical(code, title)) {
        // BCA Lab Course: Continuous Practical 70% + Term-End Practical 30%
        const continuous = lab !== null ? lab : asgn;
        if (continuous !== null && teeP !== null) {
          score = this.round2((continuous * 0.70) + (teeP * 0.30));
        } else if (teeP !== null) {
          score = this.round2(teeP);
        } else if (continuous !== null) {
          score = this.round2(continuous);
        }
      } else {
        // BCA Theory Course: 25% Assignment + 75% TEE Theory
        if (asgn !== null && teeT !== null) {
          score = this.round2((asgn * 0.25) + (teeT * 0.75));
        } else if (item.overall_marks !== '-' && item.overall_marks !== null) {
          score = this.parseNum(item.overall_marks);
        }
      }

      if (score !== null) {
        item.overall_marks = score;
        if (String(item.status || '').toUpperCase() === 'COMPLETED') {
          scoresForPct.push(score);
        }
      } else {
        if (item.overall_marks === null || item.overall_marks === undefined || item.overall_marks === '') {
          item.overall_marks = '-';
        }
      }

      evaluatedCourses.push(item);
    }

    const pct = scoresForPct.length > 0
      ? this.round2(scoresForPct.reduce((a, b) => a + b, 0) / scoresForPct.length)
      : null;

    return {
      summary: {
        overall_percentage: pct,
        total_courses: total,
        completed_courses: completed,
        not_completed_courses: notCompleted,
        calculation_method: 'BCA Rule (Theory: 25:75 | Lab: 70% Continuous + 30% Term-End Practical)',
        calculation_status: pct !== null ? 'SUCCESS' : 'INSUFFICIENT_DATA'
      },
      evaluated_courses: evaluatedCourses
    };
  }

  private static evalMca(
    courses: ParsedCourse[],
    total: number,
    completed: number,
    notCompleted: number
  ): CalculationResult {
    const evaluatedCourses: ParsedCourse[] = [];
    const scoresForPct: number[] = [];

    for (const c of courses) {
      const item: ParsedCourse = { ...c };
      const code = String(item.course_code || '').toUpperCase();
      const title = String(item.course_title || '');
      const asgn = this.parseNum(item.assignment_marks);
      const teeT = this.parseNum(item.tee_theory_marks);
      const teeP = this.parseNum(item.tee_practical_marks);
      const lab1 = this.parseNum(item.lab1);
      const lab = lab1 !== null ? lab1 : this.parseNum(item.lab2);

      let score: number | null = null;

      if (this.isProject(code, title)) {
        const proj = teeP !== null ? teeP : (lab !== null ? lab : teeT);
        if (proj !== null) score = this.round2(proj);
      } else if (this.isPractical(code, title)) {
        const continuous = lab !== null ? lab : asgn;
        if (continuous !== null && teeP !== null) {
          score = this.round2((continuous * 0.70) + (teeP * 0.30));
        } else if (teeP !== null) {
          score = this.round2(teeP);
        } else if (continuous !== null) {
          score = this.round2(continuous);
        }
      } else {
        if (asgn !== null && teeT !== null) {
          score = this.round2((asgn * 0.30) + (teeT * 0.70));
        } else if (item.overall_marks !== '-' && item.overall_marks !== null) {
          score = this.parseNum(item.overall_marks);
        }
      }

      if (score !== null) {
        item.overall_marks = score;
        if (String(item.status || '').toUpperCase() === 'COMPLETED') {
          scoresForPct.push(score);
        }
      } else {
        if (item.overall_marks === null || item.overall_marks === undefined || item.overall_marks === '') {
          item.overall_marks = '-';
        }
      }

      evaluatedCourses.push(item);
    }

    const pct = scoresForPct.length > 0
      ? this.round2(scoresForPct.reduce((a, b) => a + b, 0) / scoresForPct.length)
      : null;

    return {
      summary: {
        overall_percentage: pct,
        total_courses: total,
        completed_courses: completed,
        not_completed_courses: notCompleted,
        calculation_method: 'MCA Rule (Theory: 30:70 | Lab: 70% Continuous + 30% TEE Practical)',
        calculation_status: pct !== null ? 'SUCCESS' : 'INSUFFICIENT_DATA'
      },
      evaluated_courses: evaluatedCourses
    };
  }

  private static evalStandardUg(
    methodLabel: string,
    courses: ParsedCourse[],
    total: number,
    completed: number,
    notCompleted: number
  ): CalculationResult {
    const evaluatedCourses: ParsedCourse[] = [];
    const scoresForPct: number[] = [];

    for (const c of courses) {
      const item: ParsedCourse = { ...c };
      const code = String(item.course_code || '').toUpperCase();
      const title = String(item.course_title || '');
      const asgn = this.parseNum(item.assignment_marks);
      const teeT = this.parseNum(item.tee_theory_marks);
      const teeP = this.parseNum(item.tee_practical_marks);
      const lab1 = this.parseNum(item.lab1);
      const lab = lab1 !== null ? lab1 : this.parseNum(item.lab2);

      let score: number | null = null;

      if (this.isPractical(code, title)) {
        const continuous = lab !== null ? lab : asgn;
        if (continuous !== null && teeP !== null) {
          score = this.round2((continuous * 0.50) + (teeP * 0.50));
        } else if (teeP !== null) {
          score = this.round2(teeP);
        } else if (continuous !== null) {
          score = this.round2(continuous);
        }
      } else {
        if (asgn !== null && teeT !== null) {
          score = this.round2((asgn * 0.30) + (teeT * 0.70));
        } else if (item.overall_marks !== '-' && item.overall_marks !== null) {
          score = this.parseNum(item.overall_marks);
        }
      }

      if (score !== null) {
        item.overall_marks = score;
        if (String(item.status || '').toUpperCase() === 'COMPLETED') {
          scoresForPct.push(score);
        }
      } else {
        if (item.overall_marks === null || item.overall_marks === undefined || item.overall_marks === '') {
          item.overall_marks = '-';
        }
      }

      evaluatedCourses.push(item);
    }

    const pct = scoresForPct.length > 0
      ? this.round2(scoresForPct.reduce((a, b) => a + b, 0) / scoresForPct.length)
      : null;

    return {
      summary: {
        overall_percentage: pct,
        total_courses: total,
        completed_courses: completed,
        not_completed_courses: notCompleted,
        calculation_method: methodLabel,
        calculation_status: pct !== null ? 'SUCCESS' : 'INSUFFICIENT_DATA'
      },
      evaluated_courses: evaluatedCourses
    };
  }

  private static evalCbcs(
    methodLabel: string,
    courses: ParsedCourse[],
    total: number,
    completed: number,
    notCompleted: number
  ): CalculationResult {
    return this.evalStandardUg(methodLabel, courses, total, completed, notCompleted);
  }

  private static evalMasters(
    methodLabel: string,
    courses: ParsedCourse[],
    total: number,
    completed: number,
    notCompleted: number
  ): CalculationResult {
    const evaluatedCourses: ParsedCourse[] = [];
    const scoresForPct: number[] = [];

    for (const c of courses) {
      const item: ParsedCourse = { ...c };
      const code = String(item.course_code || '').toUpperCase();
      const title = String(item.course_title || '');
      const asgn = this.parseNum(item.assignment_marks);
      const teeT = this.parseNum(item.tee_theory_marks);
      const teeP = this.parseNum(item.tee_practical_marks);
      const lab = this.parseNum(item.lab1);

      const tee = teeT !== null ? teeT : (teeP !== null ? teeP : lab);
      let score: number | null = null;

      if (this.isProject(code, title)) {
        score = tee !== null ? tee : asgn;
      } else if (asgn !== null && tee !== null) {
        score = this.round2((asgn * 0.30) + (tee * 0.70));
      } else if (tee !== null) {
        score = this.round2(tee);
      } else if (item.overall_marks !== '-' && item.overall_marks !== null) {
        score = this.parseNum(item.overall_marks);
      }

      if (score !== null) {
        item.overall_marks = score;
        if (String(item.status || '').toUpperCase() === 'COMPLETED') {
          scoresForPct.push(score);
        }
      } else {
        if (item.overall_marks === null || item.overall_marks === undefined || item.overall_marks === '') {
          item.overall_marks = '-';
        }
      }

      evaluatedCourses.push(item);
    }

    const pct = scoresForPct.length > 0
      ? this.round2(scoresForPct.reduce((a, b) => a + b, 0) / scoresForPct.length)
      : null;

    return {
      summary: {
        overall_percentage: pct,
        total_courses: total,
        completed_courses: completed,
        not_completed_courses: notCompleted,
        calculation_method: methodLabel,
        calculation_status: pct !== null ? 'SUCCESS' : 'INSUFFICIENT_DATA'
      },
      evaluated_courses: evaluatedCourses
    };
  }
}

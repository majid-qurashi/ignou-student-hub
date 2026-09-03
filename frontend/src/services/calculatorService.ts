export interface ComponentMarksInput {
  theoryMarks?: number;
  theoryMaxMarks?: number;
  assignmentMarks?: number;
  assignmentMaxMarks?: number;
  practicalMarks?: number;
  practicalMaxMarks?: number;
  otherMarks?: number;
  otherMaxMarks?: number;
}

export interface SimpleMarksInput {
  obtainedMarks: number;
  totalMarks: number;
}

export interface CalculationResult {
  mode: 'COMPONENT' | 'SIMPLE';
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  formattedPercentage: string;
  grade: string;
  weightageBreakdown?: {
    theoryWeight?: number;
    assignmentWeight?: number;
    practicalWeight?: number;
    weightedPercentage?: number;
  };
}

// Configurable IGNOU Evaluation Rule Architecture
export const DEFAULT_IGNOU_WEIGHTS = {
  theoryWeight: 0.7,      // 70% Theory weight
  assignmentWeight: 0.3,  // 30% Assignment weight
  practicalWeight: 0,
};

export function calculateSimplePercentage(input: SimpleMarksInput): CalculationResult {
  const { obtainedMarks, totalMarks } = input;
  if (totalMarks <= 0) {
    return {
      mode: 'SIMPLE',
      obtainedMarks: 0,
      totalMarks: 0,
      percentage: 0,
      formattedPercentage: '0.00%',
      grade: 'N/A'
    };
  }

  const percentage = (obtainedMarks / totalMarks) * 100;
  const grade = getGradeFromPercentage(percentage);

  return {
    mode: 'SIMPLE',
    obtainedMarks,
    totalMarks,
    percentage: Number(percentage.toFixed(2)),
    formattedPercentage: `${percentage.toFixed(2)}%`,
    grade
  };
}

export function calculateComponentPercentage(
  input: ComponentMarksInput,
  weights = DEFAULT_IGNOU_WEIGHTS
): CalculationResult {
  const theoryObtained = input.theoryMarks || 0;
  const theoryMax = input.theoryMaxMarks || 100;

  const assignmentObtained = input.assignmentMarks || 0;
  const assignmentMax = input.assignmentMaxMarks || 100;

  const practicalObtained = input.practicalMarks || 0;
  const practicalMax = input.practicalMaxMarks || 0;

  let totalObtained = theoryObtained + assignmentObtained + practicalObtained;
  let totalMax = theoryMax + assignmentMax + practicalMax;

  // Normalized percentages
  const theoryPct = theoryMax > 0 ? (theoryObtained / theoryMax) * 100 : 0;
  const assignmentPct = assignmentMax > 0 ? (assignmentObtained / assignmentMax) * 100 : 0;
  const practicalPct = practicalMax > 0 ? (practicalObtained / practicalMax) * 100 : 0;

  // Weighted Percentage calculation
  let weightedPercentage = 0;
  if (practicalMax > 0) {
    // If practical exists, calculate proportional average
    weightedPercentage = (theoryPct * 0.5) + (assignmentPct * 0.25) + (practicalPct * 0.25);
  } else {
    weightedPercentage = (theoryPct * weights.theoryWeight) + (assignmentPct * weights.assignmentWeight);
  }

  const grade = getGradeFromPercentage(weightedPercentage);

  return {
    mode: 'COMPONENT',
    obtainedMarks: totalObtained,
    totalMarks: totalMax,
    percentage: Number(weightedPercentage.toFixed(2)),
    formattedPercentage: `${weightedPercentage.toFixed(2)}%`,
    grade,
    weightageBreakdown: {
      theoryWeight: weights.theoryWeight * 100,
      assignmentWeight: weights.assignmentWeight * 100,
      practicalWeight: practicalMax > 0 ? 25 : 0,
      weightedPercentage: Number(weightedPercentage.toFixed(2))
    }
  };
}

function getGradeFromPercentage(pct: number): string {
  if (pct >= 85) return 'A+ (Excellent)';
  if (pct >= 75) return 'A (Very Good)';
  if (pct >= 65) return 'B (Good)';
  if (pct >= 55) return 'C (Satisfactory)';
  if (pct >= 40) return 'D (Pass)';
  return 'F (Unsuccessful)';
}

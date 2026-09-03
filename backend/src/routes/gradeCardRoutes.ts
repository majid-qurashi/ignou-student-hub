import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/gradecard
 * Query params: enrollmentNo, programmeCode
 * 
 * Placeholder endpoint for future backend integration with official IGNOU Grade Card sources.
 */
router.get('/', (req: Request, res: Response) => {
  const { enrollmentNo, programmeCode } = req.query;

  if (!enrollmentNo || !programmeCode) {
    return res.status(400).json({
      success: false,
      error: 'Enrollment Number and Programme Code are required.',
    });
  }

  // Placeholder response architecture
  res.json({
    success: true,
    message: 'Official IGNOU Grade Card integration endpoint ready.',
    status: 'INTEGRATION_PENDING',
    disclaimer: 'We do not modify, generate or manually alter IGNOU academic records.',
    officialSource: 'http://www.ignou.ac.in/',
    query: {
      enrollmentNo,
      programmeCode,
    },
  });
});

export default router;

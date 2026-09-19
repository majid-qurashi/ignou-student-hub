import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gradeCardRoutes from './routes/gradeCardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'IGNOU Student Hub Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/v1/gradecard', gradeCardRoutes);

app.listen(PORT, () => {
  console.log(`[IGNOU Backend API] Server running on http://localhost:${PORT}`);
});

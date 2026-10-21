import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import employeeRoutes from './routes/employeeRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Employee Shift Scheduling System API',
    endpoints: {
      health: '/api/health',
      employees: '/api/employees',
      shifts: '/api/shifts',
      assign: 'POST /api/shifts/:id/assign',
    },
  });
});


app.use('/api/health', healthRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/items', itemRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;

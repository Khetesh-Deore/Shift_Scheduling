import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
} from '../controllers/employeeController.js';

const router = express.Router();

router.route('/')
  .post(createEmployee)
  .get(getEmployees);

router.route('/:id')
  .get(getEmployeeById)
  .delete(deleteEmployee);

export default router;

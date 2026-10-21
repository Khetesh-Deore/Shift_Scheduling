import express from 'express';
import {
  createShift,
  getShifts,
  getShiftById,
  deleteShift,
  assignEmployeeToShift,
  unassignEmployeeFromShift,
} from '../controllers/shiftController.js';

const router = express.Router();

router.route('/')
  .post(createShift)
  .get(getShifts);

router.route('/:id')
  .get(getShiftById)
  .delete(deleteShift);

router.route('/:id/assign')
  .post(assignEmployeeToShift);

router.route('/:id/assign/:employeeId')
  .delete(unassignEmployeeFromShift);

export default router;

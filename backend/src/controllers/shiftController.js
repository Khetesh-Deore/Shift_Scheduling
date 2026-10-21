import { Shift, calculateShiftTimes } from '../models/shiftModel.js';
import { Employee } from '../models/employeeModel.js';
import { findConflictingShift } from '../utils/conflictChecker.js';


export const createShift = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, and end time are required.',
      });
    }

    if (startTime === endTime) {
      return res.status(400).json({
        success: false,
        message: 'Shift end time cannot be identical to start time (duration must be greater than 0 minutes).',
      });
    }

    const { startDateTime, endDateTime, isOvernight } = calculateShiftTimes(
      date,
      startTime,
      endTime
    );

    const shift = await Shift.create({
      date,
      startTime,
      endTime,
      isOvernight,
      startDateTime,
      endDateTime,
      assignedEmployees: [],
    });

    res.status(201).json({
      success: true,
      message: 'Shift created successfully.',
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};


export const getShifts = async (req, res, next) => {
  try {
    const filter = {};

    
    if (req.query.date) {
      filter.date = req.query.date;
    }

    const shifts = await Shift.find(filter)
      .populate('assignedEmployees', 'employeeId name')
      .sort({ startDateTime: 1 });

    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    next(error);
  }
};


export const getShiftById = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id).populate(
      'assignedEmployees',
      'employeeId name'
    );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};


export const assignEmployeeToShift = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const shiftId = req.params.id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required.',
      });
    }

   
    const targetShift = await Shift.findById(shiftId);
    if (!targetShift) {
      return res.status(404).json({
        success: false,
        message: 'Target shift not found.',
      });
    }

  
    let employee = null;
    if (employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(employeeId);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase() });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee "${employeeId}" not found.`,
      });
    }

   
    const isAlreadyAssigned = targetShift.assignedEmployees.some(
      (id) => id.toString() === employee._id.toString()
    );

    if (isAlreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: `Employee "${employee.name}" (${employee.employeeId}) is already assigned to this shift.`,
      });
    }

   
    const otherShifts = await Shift.find({
      assignedEmployees: employee._id,
      _id: { $ne: targetShift._id },
    }).lean();

   
    const conflict = findConflictingShift(targetShift, otherShifts);

    if (conflict) {
      const conflictMsg = `Scheduling Conflict: Employee "${employee.name}" (${employee.employeeId}) is already assigned to an overlapping shift on ${conflict.date} from ${conflict.startTime} to ${conflict.endTime}${conflict.isOvernight ? ' (Overnight)' : ''}. Cannot assign to shift on ${targetShift.date} from ${targetShift.startTime} to ${targetShift.endTime}.`;

      return res.status(409).json({
        success: false,
        conflict: true,
        message: conflictMsg,
        conflictingShift: {
          _id: conflict._id,
          date: conflict.date,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          isOvernight: conflict.isOvernight,
        },
        requestedShift: {
          _id: targetShift._id,
          date: targetShift.date,
          startTime: targetShift.startTime,
          endTime: targetShift.endTime,
          isOvernight: targetShift.isOvernight,
        },
      });
    }

   
    targetShift.assignedEmployees.push(employee._id);
    await targetShift.save();

    const populatedShift = await Shift.findById(targetShift._id).populate(
      'assignedEmployees',
      'employeeId name'
    );

    res.status(200).json({
      success: true,
      message: `Employee "${employee.name}" (${employee.employeeId}) successfully assigned to shift.`,
      data: populatedShift,
    });
  } catch (error) {
    next(error);
  }
};


export const unassignEmployeeFromShift = async (req, res, next) => {
  try {
    const { id: shiftId, employeeId } = req.params;

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found.',
      });
    }

  
    let empMongoId = employeeId;
    if (!employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      const emp = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase() });
      if (emp) empMongoId = emp._id.toString();
    }

    const initialLength = shift.assignedEmployees.length;
    shift.assignedEmployees = shift.assignedEmployees.filter(
      (id) => id.toString() !== empMongoId.toString()
    );

    if (shift.assignedEmployees.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: 'Employee was not assigned to this shift.',
      });
    }

    await shift.save();

    const populatedShift = await Shift.findById(shift._id).populate(
      'assignedEmployees',
      'employeeId name'
    );

    res.status(200).json({
      success: true,
      message: 'Employee unassigned from shift.',
      data: populatedShift,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shift deleted successfully.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

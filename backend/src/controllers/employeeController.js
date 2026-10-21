import { Employee } from '../models/employeeModel.js';
import { Shift } from '../models/shiftModel.js';


export const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name } = req.body;

    if (!employeeId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Both Employee ID and Name are required.',
      });
    }

    const trimmedId = employeeId.trim().toUpperCase();
    const trimmedName = name.trim();

   
    const existing = await Employee.findOne({ employeeId: trimmedId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Employee with ID "${trimmedId}" already exists.`,
      });
    }

    const employee = await Employee.create({
      employeeId: trimmedId,
      name: trimmedName,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};


export const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ employeeId: 1 }).lean();

   
    const employeesWithCounts = await Promise.all(
      employees.map(async (emp) => {
        const shiftCount = await Shift.countDocuments({ assignedEmployees: emp._id });
        return {
          ...emp,
          totalAssignedShifts: shiftCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: employeesWithCounts.length,
      data: employeesWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    const assignedShifts = await Shift.find({ assignedEmployees: employee._id })
      .sort({ startDateTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        totalAssignedShifts: assignedShifts.length,
        assignedShifts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    // Clean up this employee from any shift assignments
    await Shift.updateMany(
      { assignedEmployees: employee._id },
      { $pull: { assignedEmployees: employee._id } }
    );

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: `Employee "${employee.name}" (${employee.employeeId}) deleted and unassigned from all shifts.`,
    });
  } catch (error) {
    next(error);
  }
};

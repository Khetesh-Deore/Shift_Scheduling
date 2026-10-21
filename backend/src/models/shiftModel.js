import mongoose from 'mongoose';

export const calculateShiftTimes = (dateStr, startTimeStr, endTimeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [startHour, startMin] = startTimeStr.split(':').map(Number);
  const [endHour, endMin] = endTimeStr.split(':').map(Number);

  const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0);
  let endDateTime = new Date(year, month - 1, day, endHour, endMin, 0);

  let isOvernight = false;
  if (endDateTime <= startDateTime) {
    isOvernight = true;
    
    endDateTime = new Date(year, month - 1, day + 1, endHour, endMin, 0);
  }

  return { startDateTime, endDateTime, isOvernight };
};

const shiftSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Shift date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    startTime: {
      type: String, 
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be formatted as HH:mm (24-hour)'],
    },
    endTime: {
      type: String, 
      required: [true, 'End time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be formatted as HH:mm (24-hour)'],
    },
    isOvernight: {
      type: Boolean,
      default: false,
    },
    startDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    endDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Shift = mongoose.model('Shift', shiftSchema);


export const hasTimeOverlap = (startA, endA, startB, endB) => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && sB < eA;
};


export const findConflictingShift = (candidateShift, existingShifts) => {
  const candStart = candidateShift.startDateTime;
  const candEnd = candidateShift.endDateTime;

  for (const shift of existingShifts) {
   
    if (shift._id.toString() === candidateShift._id.toString()) {
      continue;
    }

    if (hasTimeOverlap(candStart, candEnd, shift.startDateTime, shift.endDateTime)) {
      return shift;
    }
  }

  return null;
};

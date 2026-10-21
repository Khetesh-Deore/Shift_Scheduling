# Employee Shift Scheduling System

A web application to manage employees, schedule work shifts, and assign employees to shifts while preventing timing conflicts.

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite)
- **Database:**  MongoDB (`mongodb://127.0.0.1:27017/Shift_Scheduling_DB`)

## Project Structure
- `backend/` - Express API, database models, and conflict validation logic
- `frontend/` - React user interface

## Setup & Running

1. **Start MongoDB**: Make sure MongoDB is running locally on port 27017.

2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

3. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`.



## Shift Conflict Detection Logic

To determine whether an employee can be assigned to a new shift, the candidate shift `[startA, endA]` is compared against all existing shifts `[startB, endB]` already assigned to that employee.

Two shifts overlap if and only if:
```text
startA < endB && startB < endA
```

- If both conditions are true, the shifts overlap, and the assignment is rejected with a conflict error.
- Consecutive shifts (for example, Shift 1 from 09:00 to 13:00 and Shift 2 from 13:00 to 16:00) do not overlap because `13:00 < 13:00` is false. The second shift starts exactly when the first ends, which is permitted.

## Handled Rules & Edge Cases
- **Employee Management:** Add employees with unique Employee ID and Name.
- **Shift Creation:** Date, Start Time, and End Time validation (duration cannot be zero).
- **Conflict Prevention:** Blocks overlapping shift assignments with clear error messages.
- **Multiple Employees per Shift:** Multiple employees can work the same shift.
- **Multiple Shifts per Employee:** Allowed as long as the timings do not overlap.
- **Overnight Shifts:** Supported by automatically rolling the end timestamp to the next day when end time is earlier than or equal to start time.
- **Date Filter:** Allows filtering scheduled shifts by date.
- **Total Shifts Counter:** Displays total number of shifts assigned to each employee.

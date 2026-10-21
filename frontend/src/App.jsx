import React, { useState, useEffect } from 'react';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  
  
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');

  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');


  const [selectedEmpMap, setSelectedEmpMap] = useState({});

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  
  const fetchData = async () => {
    try {
      const empRes = await fetch('/api/employees');
      const empData = await empRes.json();
      if (empData.success) {
        setEmployees(empData.data || []);
      }

      const url = dateFilter ? `/api/shifts?date=${dateFilter}` : '/api/shifts';
      const shiftRes = await fetch(url);
      const shiftData = await shiftRes.json();
      if (shiftData.success) {
        setShifts(shiftData.data || []);
      }
    } catch {
      setErrorMsg('Failed to connect to backend server.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };


  const handleAddEmployee = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!empId.trim() || !empName.trim()) {
      setErrorMsg('Please enter both Employee ID and Name.');
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, name: empName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Error creating employee.');
        return;
      }

      setSuccessMsg(`Employee ${data.data.name} (${data.data.employeeId}) added.`);
      setEmpId('');
      setEmpName('');
      fetchData();
    } catch {
      setErrorMsg('Server error while adding employee.');
    }
  };


  const handleDeleteEmployee = async (id, name) => {
    clearMessages();
    if (!window.confirm(`Delete employee "${name}"?`)) return;

    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        fetchData();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Server error while deleting employee.');
    }
  };


  const handleCreateShift = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!shiftDate || !startTime || !endTime) {
      setErrorMsg('Please specify date, start time, and end time.');
      return;
    }

    if (startTime === endTime) {
      setErrorMsg('Shift duration cannot be 0 minutes.');
      return;
    }

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: shiftDate, startTime, endTime }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Error creating shift.');
        return;
      }

      setSuccessMsg(`Shift on ${data.data.date} (${data.data.startTime} - ${data.data.endTime}) created.`);
      fetchData();
    } catch {
      setErrorMsg('Server error while creating shift.');
    }
  };

  
  const handleDeleteShift = async (id) => {
    clearMessages();
    if (!window.confirm('Delete this shift?')) return;

    try {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Shift deleted.');
        fetchData();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Server error while deleting shift.');
    }
  };

  
  const handleAssign = async (shiftId) => {
    clearMessages();
    const employeeId = selectedEmpMap[shiftId];
    if (!employeeId) {
      setErrorMsg('Please select an employee from the dropdown first.');
      return;
    }

    try {
      const res = await fetch(`/api/shifts/${shiftId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      const data = await res.json();

      if (!res.ok) {
      
        setErrorMsg(data.message || 'Assignment failed.');
        return;
      }

      setSuccessMsg(data.message);
    
      setSelectedEmpMap((prev) => ({ ...prev, [shiftId]: '' }));
      fetchData();
    } catch {
      setErrorMsg('Server error while assigning employee.');
    }
  };

  
  const handleUnassign = async (shiftId, employeeId) => {
    clearMessages();
    try {
      const res = await fetch(`/api/shifts/${shiftId}/assign/${employeeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Employee removed from shift.');
        fetchData();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Server error while removing employee.');
    }
  };

  return (
    <div className="container">
    
      <header className="page-header">
        <div>
          <h1>Employee Shift Scheduling System</h1>
          <p className="subtext"> Problem Statement 2</p>
        </div>
      </header>

     
      {errorMsg && (
        <div className="alert alert-error">
          <strong>Error / Conflict:</strong> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <strong>Success:</strong> {successMsg}
        </div>
      )}

      
      <div className="sections-grid">
        
        <section className="section-box">
          <h2>1. Employee Management</h2>

         
          <form onSubmit={handleAddEmployee} className="simple-form">
            <div className="form-row">
              <div className="form-field">
                <label>Employee ID *</label>
                <input
                  type="text"
                  placeholder="e.g. EMP01"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Employee Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Name"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Employee
            </button>
          </form>

         
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Shifts Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-text">
                      No employees added yet.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td><strong>{emp.employeeId}</strong></td>
                      <td>{emp.name}</td>
                      <td>{emp.totalAssignedShifts || 0}</td>
                      <td>
                        <button
                          className="btn-link-danger"
                          onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

       
        <section className="section-box">
          <h2>2. Create Shift</h2>

          <form onSubmit={handleCreateShift} className="simple-form">
            <div className="form-field">
              <label>Date *</label>
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Start Time *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>End Time *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {endTime <= startTime && startTime && endTime && (
              <p className="note-text">
                Note: End time is earlier than start time. This will be scheduled as an overnight shift.
              </p>
            )}

            <button type="submit" className="btn btn-primary">
              Create Shift
            </button>
          </form>
        </section>
      </div>

     
      <section className="section-box" style={{ marginTop: '20px' }}>
        <div className="section-header-row">
          <h2>3. Scheduled Shifts & Employee Assignments</h2>

          <div className="filter-controls">
            <label>Filter by Date:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button className="btn btn-secondary btn-sm" onClick={() => setDateFilter('')}>
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Date</th>
                <th style={{ width: '140px' }}>Shift Time</th>
                <th>Assigned Employees</th>
                <th style={{ width: '280px' }}>Assign New Employee</th>
                <th style={{ width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-text">
                    No shifts scheduled{dateFilter ? ` for ${dateFilter}` : ''}.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift._id}>
                    <td>{shift.date}</td>
                    <td>
                      {shift.startTime} – {shift.endTime}
                      {shift.isOvernight && <span className="pill-overnight">Overnight</span>}
                    </td>
                    <td>
                      {shift.assignedEmployees && shift.assignedEmployees.length > 0 ? (
                        <div className="chip-list">
                          {shift.assignedEmployees.map((emp) => (
                            <span key={emp._id} className="emp-tag">
                              {emp.name} ({emp.employeeId})
                              <button
                                type="button"
                                onClick={() => handleUnassign(shift._id, emp._id)}
                                title="Remove from shift"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <div className="assign-inline">
                        <select
                          value={selectedEmpMap[shift._id] || ''}
                          onChange={(e) =>
                            setSelectedEmpMap({
                              ...selectedEmpMap,
                              [shift._id]: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Select Employee --</option>
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name} ({emp.employeeId})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAssign(shift._id)}
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-link-danger"
                        onClick={() => handleDeleteShift(shift._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

   
      <section className="section-box info-box" style={{ marginTop: '20px' }}>
        <h3>Shift-Conflict Detection Logic & Approach</h3>
        <p>
          <strong>Overlap Condition:</strong> Two shifts <code>[startA, endA]</code> and <code>[startB, endB]</code> overlap if and only if:
        </p>
        <pre className="">startA &lt; endB && startB &lt; endA</pre>
        <p>
          <strong>Consecutive Shifts (Problem Statement Example):</strong> If an employee works from <strong>09:00 AM to 1:00 PM</strong> (9 to 13), and another shift is <strong>1:00 PM to 4:00 PM</strong> (13 to 16):
        </p>
        <ul>
          <li>Condition evaluates: <code>9 &lt; 16 (true) && 13 &lt; 13 (false)</code>  <strong>No Conflict</strong>. The employee is allowed to work both shifts.</li>
          <li>If the second shift is <strong>12:00 PM to 3:00 PM</strong> (12 to 15): <code>9 &lt; 15 (true) && 12 &lt; 13 (true)</code> <strong>Conflict Detected</strong>. The assignment is rejected.</li>
        </ul>
        <p>
          <strong>Overnight Shifts:</strong> When End Time &le; Start Time, the end timestamp is evaluated on the next calendar day.
        </p>
      </section>
    </div>
  );
}

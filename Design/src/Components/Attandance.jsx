import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeSidebar from './Employee/EmployeeSidebar';
import EmployeeTopbar from './Employee/EmployeeTopbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0, 10));
  const [attendanceData, setAttendanceData] = useState({});
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get('http://localhost:8000/api/v1/employee/attendance')
      .then(response => {
        const fetchedEmployees = response.data;
        const initialAttendanceData = {};

        fetchedEmployees.forEach(employee => {
          initialAttendanceData[employee.EmployeeID] = 'absent';
        });

        setEmployees(fetchedEmployees);
        setAttendanceData(initialAttendanceData);
      })
      .catch(error => {
        toast.error('Failed to fetch employees');
      });
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const fetchAttendanceData = () => {
    axios.get(`http://localhost:8000/api/v1/employee/attendance/${selectedDate}`)
      .then(response => {
        setPresentCount(response.data.presentCount);
        setAbsentCount(response.data.absentCount);
      })
      .catch(error => {
        toast.error('Failed to fetch attendance data');
      });
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleAttendanceChange = (employeeId, status) => {
    setAttendanceData(prevAttendanceData => ({
      ...prevAttendanceData,
      [employeeId]: status
    }));
  };

  const markAttendance = () => {
    const attendanceSubmissionData = {
      date: selectedDate,
      attendanceData
    };

    axios.post('http://localhost:8000/api/v1/employee/markAttendance', attendanceSubmissionData)
      .then(response => {
        toast.success('Attendance marked successfully');

        fetchAttendanceData();
      })
      .catch(error => {
        toast.error('Failed to mark attendance');
      });
  };

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
    <EmployeeSidebar />
      <EmployeeTopbar />
      <div className="ml-[18%] pt-[60px] flex flex-col w-[100-18%] h-full p-4 bg-white mt-10">
      <h1 className="text-4xl border-l-[#7E3AF2] border-l-4 rounded h-fit pl-4 text-slate-700 mb-5">
        Attendance
      </h1>
      <div className="flex justify-end mt-6 mb-10">
        <input
          type="date"
          id="attendance-date"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg hover:shadow-md text-green-700 p-2 px-4 bg-green-300 rounded">
          Present: {presentCount}
        </div>
        <div className="text-lg hover:shadow-md text-red-700 p-2 bg-red-300 px-4 rounded">
          Absent: {absentCount}
        </div>
      </div>

      <div className="grid gap-6">
        {currentEmployees.map(employee => (
          <div key={employee.EmployeeID} className="mb-0 flex items-center p-4 bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-xl transition duration-300 ease-in-out">
            <img src={employee.ProfileImage} alt={`${employee.FirstName} ${employee.LastName}'s profile`} className="w-12 h-12 rounded-full mr-4 border border-gray-300"/>
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-800">{employee.FirstName} {employee.LastName}</p>
              <p className="text-sm text-gray-500">Employee ID: {employee.EmployeeID}</p>
            </div>
            <div>
              <input
                type="checkbox"
                id={`attendance-${employee.EmployeeID}`}
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={attendanceData[employee.EmployeeID] === 'present'}
                onChange={(e) => handleAttendanceChange(employee.EmployeeID, e.target.checked ? 'present' : 'absent')}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-center">
        {employees.length > employeesPerPage && (
          <ul className="flex list-none">
            {Array.from({ length: Math.ceil(employees.length / employeesPerPage) }, (_, index) => (
              <li key={index} className="cursor-pointer mx-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => paginate(index + 1)}>
                {index + 1}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={markAttendance} className="p-2 hover:shadow-md text-white bg-[#7E3AF2] rounded px-4 mt-6">
        Submit Attendance
      </button>

      <ToastContainer />
    </div>
    </>
  );
}

export default Attendance;

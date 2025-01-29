"use client";
import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaClock, FaSearch } from "react-icons/fa";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";
import { useSession } from "next-auth/react";


const AttendanceSheet = ({attendancedata=[]}) => {
  const { data: session, status } = useSession();


  const [attendanceData, setAttendanceData] = useState(attendancedata);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // useEffect(() => {
  //   if (
  //     status === "authenticated" &&
  //     session?.user?.activeSemester?.semester_id
  //   ) {
  //     fetchAttendanceData();
  //     // fetchTimetableData(classId);
  //   }
  // }, [status, session]);
  
  // useEffect(() => {
  //   fetchClassesnSemesters();
  //   // setAttendanceData(data1);
  //   setIsLoading(false);
  // }, []);

  const data1 = [
    {
      student_id: 1,
      name: "Student Name",
      attendance: [
        { date: "2024-08-01", status: "Present" },
        { date: "2024-08-02", status: "Absent" },
        { date: "2024-08-03", status: "Present" },
        { date: "2024-08-04", status: "Present" },
        { date: "2024-08-05", status: "Present" },
        { date: "2024-08-06", status: "Absent" },
        { date: "2024-08-07", status: "Present" },
        { date: "2024-08-08", status: "Present" },
        { date: "2024-08-09", status: "Late" },
        { date: "2024-08-10", status: "Present" },
        { date: "2024-08-11", status: "Present" },
        { date: "2024-08-12", status: "Absent" },
        { date: "2024-08-13", status: "Present" },
        { date: "2024-08-14", status: "Present" },
        // ... other dates within the specified range
      ],
    },
    // ... other students
  ];

  const fetchClassesnSemesters = async () => {
    setIsLoading(true);
    try {
      const [semesterdata, classdata] = await Promise.all([
        fetchData(`/api/semester/all`, "", false),
        fetchData(`/api/classes/all`, "", false),
      ]);
           setClasses(classdata?.classes);
           setSemesters(semesterdata)
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (selectedClass && selectedSemester) {

    
    setLoading(true);
    try {
      const response = await 
      fetchData(
        `/api/attendance/getattendancesheet/${selectedClass}/${selectedSemester}`,
        "",
        false
      );
      console.log("response", response);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch attendance data2");
      // }
      // const data = await response.json();
      console.log("AttendanceSheet response", response);
      setAttendanceData(response?.attendanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }}
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case "Present":
        return <FaCheck className="text-green-500" />;
      case "Absent":
        return <FaTimes className="text-red-500" />;
      case "Late":
        return <FaClock className="text-yellow-500" />;
      default:
        return "-";
    }
  };

  if (status === "loading" || isLoading)
    return (
      <div>
        <LoadingPage />
      </div>
    );
  if (error) return <div className="text-cyan-800">Error: {error}</div>;

  // Assuming the API returns the dates in the attendance data
  const dates =
    attendanceData?.length > 0
      ? attendanceData[0].attendance.map((a) => new Date(a.date))
      : [];

  // Filter out weekends
  const weekdayDates = dates.filter(
    (date) => date.getDay() !== 0 && date.getDay() !== 6
  );

  // Function to determine if a date is the start of a new week (Monday)
  const isStartOfWeek = (date) => date.getDay() === 1;

  // Function to get the week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // if (status === "loading") {
  //   return (
  //     <div className="text-cyan-700">
  //       <LoadingPage />
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white p-4 rounded shadow mb-6 text-cyan-600">
      <h2 className="text-xl font-semibold mb-4 text-cyan-700">
        Attendance Sheet
      </h2>


      {loading ? (
        <p>Loading attendance...</p>
      ) : attendanceData?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Students</th>
                {weekdayDates.map((date, index) => (
                  <th
                    key={date.toISOString()}
                    className={`py-2 px-4 border ${
                      isStartOfWeek(date) ? "border-l-4 border-l-cyan-500" : ""
                    }`}
                  >
                    <div>{date.toLocaleDateString()}</div>
                    <div className="text-xs">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    {isStartOfWeek(date) && (
                      <div className="text-xs font-semibold text-cyan-600">
                        Week {getWeekNumber(date)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((student) => (
                <tr key={student.student_id}>
                  <td className="py-2 px-4 border font-medium">
                    {student.name}
                  </td>
                  {weekdayDates.map((date, index) => {
                    const attendance = student.attendance.find(
                      (a) =>
                        new Date(a.date).toDateString() === date.toDateString()
                    );
                    return (
                      <td
                        key={date.toISOString()}
                        className={`py-2 px-4 border text-center
                        ${
                          isStartOfWeek(date)
                            ? "border-l-4 border-l-cyan-500"
                            : ""
                        }
                        ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                      >
                        {attendance
                          ? getAttendanceIcon(attendance.status)
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No attendance generated yet. Please select a class and semester.</p>
      )}
    </div>
  );
};

export default AttendanceSheet;

"use client";
import React, { useState, useEffect } from "react";
import { FaFileAlt, FaCalendarAlt, FaDownload, FaSearch, FaCross } from "react-icons/fa";
import { fetchData } from "../../../config/configFile";
import AttendanceSheet from "../attendancesheet/page";
import LoadingPage from "../../../components/generalLoadingpage";
import { useSession } from "next-auth/react";

const AttendanceReport = ({onClose}) => {
  const { data: session, status } = useSession();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [activeSemester, setActiveSemester] = useState();



  const headerNames = [
    "student",
    "present",
    "abscent",
    "late",
    "attendance rate",
  ];

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view attendance report"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }

    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      setActiveSemester(session?.user?.activeSemester?.semester_id);
      // setUserId(session?.user?.id);
    }
  }, [session, status]);

  useEffect(() => {
    setIsLoading(true);
    fetchClassesnSemesters();
    setIsLoading(false);
  }, []);

  const fetchClassesnSemesters = async () => {
    setIsLoading(true);
    try {
      const [semesterdata, classdata] = await Promise.all([
        fetchData(`/api/semester/all`, "", false),
        fetchData(`/api/classes/all`, "", false),
      ]);
      setClasses(classdata?.classes);
      setSemesters(semesterdata);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReport = async () => {
    console.log("runninf fetch report", selectedClass, selectedSemester);
    if (selectedClass && selectedSemester) {
      setLoading(true);
      try {
        const [attendancereport, attendanceSheet] = await Promise.all([
          fetchData(
            `/api/attendance/getattendancereport/${selectedClass}/${selectedSemester}`,
            "",
            false
          ),
          fetchData(
            `/api/attendance/getattendancesheet/${selectedClass}/${selectedSemester}`,
            "",
            false
          ),
        ]);
        console.log("reportdata", attendancereport);
        console.log("sheet data", attendanceSheet);
        setReport(attendancereport?.students);
        setAttendanceData(attendanceSheet?.attendanceData);
      } catch (error) {
        console.error("Failed to fetch attendance report:", error);
      }
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Implement report download logic here
    console.log("Downloading report...");
  };

  if (status === "loading") {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "view attendance report" to be on this page...!
      </div>
    );
  }

  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">Attendance Report</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-2 font-semibold">Select Class</label>
            <select
              className="w-full border-2 border-cyan-300 rounded-md p-3 bg-white"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Select a class</option>
              {classes?.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">semester/term</label>
            <select
              className="w-full border-2 border-cyan-300 rounded-md p-3 bg-white"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              required
            >
              <option value="">Select a semester</option>
              {semesters?.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {`${sem.semester_name} ${sem.start_date}`}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && selectedSemester && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={fetchReport}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
              >
                <FaSearch className="mr-2" />
                Generate Report
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p>Generating report...</p>
        ) : report ? (
          <div>
            <div className="overflow-x-auto tableWrap height-45vh">
              <table className="overflow-y-scroll ">
                <thead className="header-overlay">
                  <tr className="bg-cyan-700 text-white">
                    <th className="p-2 text-left">Student</th>
                    <th className="p-2 text-left">Present</th>
                    <th className="p-2 text-left">Absent</th>
                    <th className="p-2 text-left">Late</th>
                    <th className="p-2 text-left">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">
                        <div className="flex items-center">
                          <FaFileAlt className="text-cyan-500 mr-2" size={18} />
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-gray-600">
                              {student.studentId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{student.present}</td>
                      <td className="p-2">{student.absent}</td>
                      <td className="p-2">{student.late}</td>
                      <td className="p-2">{student.attendanceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AttendanceSheet attendancedata={attendanceData} />

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
              >
                {/* <Fa className="mr-2" /> */}
                Close
              </button>
            </div>
          </div>
        ) : (
          <p>No report generated yet. Please select a class and semester.</p>
        )}
      </div>
      {/* {attendanceData.length > 0 && (
        <AttendanceSheet attendancedata={attendanceData} />
      )} */}
    </div>
  );
};

export default AttendanceReport;

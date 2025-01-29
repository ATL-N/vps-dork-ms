"use client";
import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaUserGraduate,
  FaDownload,
  FaEnvelope,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SecondModal from "../../../components/modal";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";

const ReportCardPage = ({ class_id, semester_id, onClose }) => {
  const { data: session, status } = useSession();

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportPreview, setReportPreview] = useState(null);
  const [selectedClass, setSelectedClass] = useState(class_id);
  const [selectedSemester, setSelectedSemester] = useState(semester_id);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [classes, setClasses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [classesData, setClassesData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);

  // const classes = ["Class A", "Class B", "Class C"];
  // const semesters = ["Semester 1", "Semester 2", "Semester 3"];

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);
      // if(selectedClass & selectedSemester){

      //   fetchClassAcademicReports(class_id, activeSemester);
      // }
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    fetchallData();

    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["delete grading scheme"];
    const authorizedPermissions2 = ["view report card"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions2.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session]);

  useEffect(() => {
    if (class_id && semester_id) {
      fetchClassAcademicReports(class_id, semester_id);
    } else if (selectedClass && selectedSemester) {
      // // In a real application, you would fetch data from the API here
      // // For now, we'll use the dummy data
      // setStudents(dummyStudents);
      // setSelectedStudents([]);
      // setSelectAll(false);
      fetchClassAcademicReports(selectedClass, selectedSemester);
    }
  }, [selectedClass, selectedSemester]);

  useEffect(() => {
    if (selectedStudents.length === students.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedStudents]);

  const fetchClassAcademicReports = async (class_id, semester_id) => {
    setLoading(true);
    // setError(null);
    try {
      const data = await fetchData(
        `/api/grading/getreportcardbyclassandsem/${class_id}/${semester_id}`,
        "",
        false
      );
      // console.log("analytics", data);
      if (data && Object.keys(data).length > 0) {
        console.log("analytics222", data?.totalStudents);

        // setAnalytics(data?.gradeAnalytics);
        setStudents(data?.students);
        setTotalStudents(data?.totalStudents);
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        // setError("No data available for this semester.");
      }
    } catch (err) {
      // setError("Failed to fetch analytics data. Please try again later.");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchallData = async () => {
    setIsLoading(true);
    try {
      const [classes, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "class", false),
        fetchData("/api/semester/all", "semester", false),
      ]);
      setClassesData(classes?.classes);
      setSemesterData(semesterdata);
      console.log("semesterData", classes, semesterData);
      // setSelectedSemester(semesterdata[0].semester_id);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedStudents(students?.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      format: "a5",
      orientation: "landscape",
      unit: "mm",
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    reportPreview.forEach((report, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Header
      doc.setFontSize(14);
      doc.text("Delta Academy Prep School", pageWidth / 2, 8, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.text("P.O.BOX 20, KWANYAKU", pageWidth / 2, 13, { align: "center" });
      doc.setFontSize(12);
      doc.text("Student Report Card", pageWidth / 2, 18, { align: "center" });

      // Student Information (3 columns)
      doc.setFontSize(10);
      const columnWidth = pageWidth / 3;
      const startY = 24;
      const lineHeight = 5;

      // Column 1
      doc.text(`Name: ${report.name}`, 5, startY);
      doc.text(
        `Class: ${report?.historicalClassName}`,
        5,
        startY + 2 * lineHeight
      );
      doc.text(
        `Promoted To: ${report.promotedToClass}`,
        5,
        startY + lineHeight
      );


      // Column 2
      doc.text(`No. of Students: ${totalStudents}`, columnWidth + 5, startY);
      doc.text(
        `Overall Position: ${report.overallPosition}`,
        columnWidth + 5,
        startY + lineHeight
      );
      doc.text(
        `Total Marks: ${report.total}`,
        columnWidth + 5,
        startY + 2 * lineHeight
      );

      // Column 3
      doc.text(`Email: ${report.email}`, 2 * columnWidth + 5, startY);
      doc.text(
        `Average: ${report.average.toFixed(2)}`,
        2 * columnWidth + 5,
        startY + lineHeight
      );
      doc.text(
        `Attendance: ${report.attendance.studentAttendance}/${report.attendance.totalSemesterAttendance}`,
        2 * columnWidth + 5,
        startY + 2 * lineHeight
      );

      // Grades Table
      const tableStartY = startY + 3 * lineHeight;
      const tableColumn = [
        "Subject",
        "Class Score",
        "Exams Score",
        "Total Score",
        "Remark",
        "Position",
      ];
      const tableRows = Object.entries(report.grades).map(([subject, data]) => [
        subject,
        data.class_score,
        data.exams_score,
        data.grade,
        data.remark,
        data.position,
      ]);
      doc.autoTable({
        startY: tableStartY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [0, 150, 150], fontSize: 9 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 5, right: 5 },
        tableWidth: "auto",
      });

      const finalY = doc.previousAutoTable.finalY || 95;

      // Remarks
      doc.setFontSize(11);
      doc.text("Class Teacher's Remarks:", 5, finalY + 5);
      doc.setFontSize(10);
      doc.text(report.remarks.classTeacherRemark || " ", 5, finalY + 9, {
        maxWidth: pageWidth - 10,
      });

      doc.setFontSize(11);
      doc.text("Head Teacher's Remarks:", 5, finalY + 20);
      doc.setFontSize(10);
      doc.text(report.remarks.headTeacherRemark || " ", 5, finalY + 23, {
        maxWidth: pageWidth - 10,
      });

      // Footer
      doc.setFontSize(8);
      doc.text(
        "This is an official report card.",
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    });
    return doc;
  };

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleGenerateReports = () => {
    const reportData = students?.filter((student) =>
      selectedStudents.includes(student.id)
    );
    setReportPreview(reportData);
    setIsModalOpen(true);
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save("report_cards.pdf");
  };

  const handlePrint = () => {
    const doc = generatePDF();
    const landscapeOptions = { orientation: "landscape" };

    const pdfData = doc.output("datauristring", landscapeOptions);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print Report Cards</title>
      </head>
      <body>
        <embed width="100%" height="100%" src="${pdfData}" type="application/pdf" />
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const handleEmailReports = () => {
    console.log("Emailing reports for:", selectedStudents);
  };

  const ReportPreview = ({ report }) => (
    <div className="border rounded p-4 mb-4 bg-white shadow">
      <h3 className="text-xl font-bold mb-2">{report.name}</h3>
      <p>Student ID: {report.id}</p>
      <p>Email: {report.email}</p>
      <p className="mt-4">Total Marks: {report.total}</p>
      <p>Average: {report.average.toFixed(2)}</p>
      <p>Overall Position: {report.overallPosition}</p>
      <p>Class Name: {report.className}</p>
      <p>
        Attendance: {report.attendance.studentAttendance}/
        {report.attendance.totalSemesterAttendance}
      </p>

      <table className="w-full mt-4">
        <thead>
          <tr className="bg-cyan-600 text-white">
            <th className="p-2">Subject</th>
            <th className="p-2">Class Score</th>
            <th className="p-2">Exams Score</th>
            <th className="p-2">Total Score</th>
            <th className="p-2">Remark</th>
            <th className="p-2">Position</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(report.grades).map(
            ([
              subject,
              { class_score, exams_score, grade, remark, position },
            ]) => (
              <tr key={subject} className="border-b">
                <td className="p-2">{subject}</td>
                <td className="p-2">{class_score}</td>
                <td className="p-2">{exams_score}</td>
                <td className="p-2">{grade}</td>
                <td className="p-2">{remark}</td>
                <td className="p-2">{position}</td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="mt-4">
        <h4 className="font-bold">Class Teacher's Remark:</h4>
        <p>{report.remarks.classTeacherRemark}</p>
      </div>
      <div className="mt-2">
        <h4 className="font-bold">Head Teacher's Remark:</h4>
        <p>{report.remarks.headTeacherRemark}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (error) {
    return <div>error</div>;
  }

  if (!students) {
    return (
      <div>
        {" "}
        There is no students? Report data available for the class and current
        semester.
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised to be on this page...!
      </div>
    );
  }

  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">
        View Report Card Details
      </h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form className="mb-4 flex space-x-4">
          <div className="mb-4 flex space-x-4 w-full">
            {class_id ? (
              <div className="border-2 border-cyan-300 rounded-md p-2 w-full ">
                {classesData
                  ?.filter((cls) => cls.class_id === class_id)
                  .map((cls) => cls.class_name || "No class selected")}
              </div>
            ) : (
              <select
                className="border-2 border-cyan-300 rounded-md p-2 w-[50%]"
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="">Select Class</option>
                {classesData?.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            )}
            {semester_id ? (
              <div className="border-2 border-cyan-300 rounded-md p-2 w-full">
                {semesterData
                  ?.filter((sem) => sem.id === semester_id)
                  .map((sem) => sem.semester_name) || "No semester selected"}
              </div>
            ) : (
              <div className="flex-1 w-full">
                {/* <label htmlFor="semester-select" className="block mb-2">
                Select Semester:
              </label> */}
                <select
                  id="semester-select"
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a semester</option>
                  {semesterData.map((semester) => (
                    <option key={semester?.id} value={semester?.id}>
                      {semester.semester_name}({semester.start_date})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </form>

        {selectedClass && selectedSemester && (
          <>
            {loading ? (
              <divv>Loading...</divv>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="form-checkbox h-5 w-5 text-cyan-600"
                      />
                    </th>
                    <th>Name</th>
                    <th>Student Average</th>
                    <th>Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-cyan-600"
                          onChange={() => handleStudentSelection(student.id)}
                          checked={selectedStudents.includes(student.id)}
                        />
                      </td>
                      <td>{student.name}</td>
                      <td>{student.average.toFixed(2)}</td>
                      <td>{student.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        <div className="flex justify-between space-x-4 mt-4">
          <div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 h-full"
            >
              Close
            </button>
          </div>

          <div className="flex">
            <button
              onClick={handleGenerateReports}
              className={`px-4 py-2 mr-4 text-white rounded-md flex items-center ${
                selectedStudents.length === 0
                  ? "bg-gray-200 hover:bg-gray-200 focus:ring-gray"
                  : "bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              }`}
              disabled={selectedStudents.length === 0}
            >
              <FaFileAlt className="mr-2" />
              Generate Selected Report Cards
            </button>
            {/* <button
              onClick={handleEmailReports}
              className={`px-4 py-2 text-white rounded-md flex items-center ${
                selectedStudents.length === 0
                  ? "bg-gray-200 hover:bg-gray-200 focus:ring-gray"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              }`}
              disabled={selectedStudents.length === 0}
            >
              <FaEnvelope className="mr-2" />
              Email Selected Report Cards
            </button> */}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <SecondModal onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Report Preview
          </h3>
          <div className="mt-2 px-4 py-3 max-h-[70vh] overflow-y-auto">
            {reportPreview.map((report) => (
              <ReportPreview key={report.id} report={report} />
            ))}
          </div>
          <div className="flex justify-between space-x-4 mt-4">
            <div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Close
              </button>
            </div>

            <div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 mr-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print
              </button>
            </div>
          </div>
        </SecondModal>
      )}
    </div>
  );
};

export default ReportCardPage;

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
import { useRouter } from "next/navigation";

const ReportCardPage = ({ class_id, semester_id, onClose }) => {
  const router = useRouter();
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

  // Environment variables
  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME;
  const schoolAddress = process.env.NEXT_PUBLIC_SCHOOL_ADDRESS;
  const schoolMotto = process.env.NEXT_PUBLIC_SCHOOL_MOTTO;
  const institutionPhone = process.env.NEXT_PUBLIC_SCHOOL_PHONE;

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    fetchallData();

    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["delete grading scheme"];
    const authorizedPermissions2 = ["view report cards"];

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
    try {
      const data = await fetchData(
        `/api/grading/getreportcardbyclassandsem/${class_id}/${semester_id}`,
        "",
        false
      );
      if (data && Object.keys(data).length > 0) {
        setStudents(data?.students);
        setTotalStudents(data?.totalStudents);
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
      }
    } catch (err) {
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

const generatePDF = async () => {
  const doc = new jsPDF({
    format: "a5",
    orientation: "landscape",
    unit: "mm",
  });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Fetch the favicon data
  const response = await fetch("/favicon.ico");
  const blob = await response.blob();
  const reader = new FileReader();

  const faviconDataUrlPromise = new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const faviconDataUrl = await faviconDataUrlPromise;

  reportPreview.forEach((report, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // Add a decorative border
    doc.setDrawColor(0, 150, 150); // Teal color
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 7); // Border around the page

    // Header with background color
    doc.setFillColor(0, 150, 150); // Teal background
    doc.rect(0, 0, pageWidth, 22, "F"); // Fill the top header area
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255); // White text
    doc.text(schoolName, pageWidth / 2, 10, { align: "center" });
    doc.setFontSize(10);
    doc.text(institutionPhone, pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(schoolMotto, pageWidth / 2, 20, { align: "center" });

    // Add a circular white background behind the logo
    doc.setFillColor(255, 255, 255); // White background
    doc.circle(9, 11, 7.2, "F"); // Draw a white circle behind the logo (center at (9, 11), radius 5)

    // Logo (Using Favicon)
    doc.addImage(faviconDataUrl, "PNG", 4, 6, 10, 10);

    // Report Card Title
    doc.setFontSize(12);
    doc.setTextColor(14, 116, 144); // Black text
    doc.text("STUDENT REPORT CARD", pageWidth / 2, 26, { align: "center" });

    // Student Information (3 columns)
    doc.setFontSize(10);
    const columnWidth = pageWidth / 3;
    const startY = 31;
    const lineHeight = 5;

    // Column 1
    doc.setTextColor(0, 0, 0); // Black text
    doc.text(`Name: ${report.name}`, 10, startY);
    doc.text(
      `Class: ${report?.historicalClassName}`,
      10,
      startY + 2 * lineHeight
    );
    doc.text(`Promoted To: ${report.promotedToClass}`, 10, startY + lineHeight);

    // Column 2
    doc.text(`No. of Students: ${totalStudents}`, columnWidth + 15, startY);
    doc.text(
      `Overall Position: ${report.overallPosition}`,
      columnWidth + 15,
      startY + lineHeight
    );
    doc.text(
      `Total Marks: ${report.total}`,
      columnWidth + 15,
      startY + 2 * lineHeight
    );

    // Column 3
    doc.text(`Email: ${report.email}`, 2 * columnWidth + 15, startY);
    doc.text(
      `Average: ${report.average.toFixed(2)}`,
      2 * columnWidth + 15,
      startY + lineHeight
    );
    doc.text(
      `Attendance: ${report.attendance.studentAttendance} out of ${report.attendance.totalSemesterAttendance}`,
      2 * columnWidth + 15,
      startY + 2 * lineHeight
    );

    // Grades Table
    const tableStartY = startY + 1 * lineHeight + 7;
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
      theme: "striped", // Use a striped theme for better readability
      headStyles: {
        fillColor: [0, 150, 150],
        fontSize: 9,
        textColor: [255, 255, 255],
      }, // Teal header with white text
      bodyStyles: { fontSize: 10 },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
      styles: { cellPadding: 2, lineWidth: 0.1 },
    });

    const finalY = doc.previousAutoTable.finalY || 95;

    // Remarks Section
    const remarksStartY = finalY + 4;

    // Add a decorative line above the remarks
    doc.setDrawColor(0, 150, 150); // Teal color
    doc.setLineWidth(0.5);
    doc.line(10, remarksStartY, pageWidth - 10, remarksStartY); // Horizontal line

    // Class Teacher's Remarks
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont("helvetica", "bold"); // Use bold font for the title
    doc.text("Class Teacher's Remarks:", 10, remarksStartY + 5);
    doc.setFont("helvetica", "normal"); // Reset to normal font
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50); // Dark gray text for the remarks
    doc.text(
      report.remarks.classTeacherRemark || "No remarks provided.",
      10,
      remarksStartY + 10,
      {
        maxWidth: pageWidth - 20,
      }
    );

    // Head Teacher's Remarks
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont("helvetica", "bold"); // Use bold font for the title
    doc.text("Head Teacher's Remarks:", 10, remarksStartY + 20);
    doc.setFont("helvetica", "normal"); // Reset to normal font
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50); // Dark gray text for the remarks
    doc.text(
      report.remarks.headTeacherRemark || "No remarks provided.",
      10,
      remarksStartY + 25,
      {
        maxWidth: pageWidth - 20,
      }
    );

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100); // Gray text
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

  const handleDownload = async () => {
    const doc = await generatePDF();
    doc.save("report_cards.pdf");
  };

  const handlePrint = async () => {
    const doc = await generatePDF();
    const pdfData = doc.output("bloburl");
    const printWindow = window.open(pdfData, "_blank");

    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
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
        You are not authorised "view report cards" to be on this page...!
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
              <div>Loading...</div>
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
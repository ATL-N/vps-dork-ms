"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaFileAlt,
  FaUserGraduate,
  FaDownload,
  FaEnvelope,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";

const ClassPromotion = ({ class_id, semester_id, onClose }) => {
  const { data: session, status } = useSession();

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportPreview, setReportPreview] = useState(null);
  const [selectedClass, setSelectedClass] = useState(class_id);
  const [promotedClass, setPromotedClass] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(semester_id);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [classes, setClasses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classesData, setClassesData] = useState([]);
  const [classesData2, setClassesData2] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [loading, setLoading] = useState(true);

  // const classes = ["Class A", "Class B", "Class C"];
  // const semesters = ["Semester 1", "Semester 2", "Semester 3"];

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);
      setSelectedSemester(activeSemester);
      console.log("activeSemester", activeSemester);
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

    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["promote students"];

    if (
      session?.user?.role === "admin" ||
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      )
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (class_id && semester_id) {
      fetchClassAcademicReports(class_id, semester_id);
    } else if (selectedClass && selectedSemester) {
      fetchClassAcademicReports(selectedClass, selectedSemester);
    }
  }, [selectedClass, selectedSemester]);

  useEffect(() => {
    setSelectAll(selectedStudents?.length === students?.length);
  }, [selectedStudents, students]);

  const fetchClassAcademicReports = async (class_id, semester_id) => {
    setLoading(true);

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
      setLoading(false);
    } catch (err) {
      // setError("Failed to fetch analytics data. Please try again later.");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchallData = async () => {
    setIsLoading(true);
    try {
      const [classes, promotedclass, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "class", false),
        fetchData("/api/classes/getclasses", "class", false),
        fetchData("/api/semester/all", "semester", false),
      ]);
      setClassesData(classes?.classes);
      setClassesData2(promotedclass?.classes);
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

  const handlePromotedClassChange = (e) => {
    setPromotedClass(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("formData", selectedStudents, promotedClass);

    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsModalOpen(false);

    const toastId = toast.loading("Processing your request...");

    const studentsData = {
      selectedStudents: selectedStudents,
      promotedClass: promotedClass,
    };

    try {
      const url = "/api/students/promote"; // Adjust this to your actual API route
      const method = "PUT";

      toast.update(toastId, {
        render: "Promoting students...",
        type: "info",
        isLoading: true,
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentsData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process request");
      }

      console.log("Students promoted successfully:", result);

      toast.update(toastId, {
        render: result.message || "Students promoted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      // Optionally, you can update the local state or refetch the students list here
    } catch (error) {
      console.error("Error promoting students:", error);
      toast.update(toastId, {
        render: error.message || "An error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedStudents(students?.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
      console.log("students.length  11", students.length);
      // setSelectAll(selectedStudents?.length === students?.length);
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
      console.log("students.length  11", students.length);

      // setSelectAll(selectedStudents?.length === students?.length);
    }
  };

 
  if (status === "loading" || isLoading) {
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
        You are not authorised "promote students" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={"Promote selected Students"}
        message={
          "Are you sure you want to promote the selected students to the new class?"
        }
      />

      <div className="space-y-6 text-cyan-800">
        <h2 className="text-2xl font-bold text-cyan-700">Students Promotion</h2>

        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex space-x-4 w-full">
              {class_id ? (
                <div className="border-2 border-cyan-300 rounded-md p-2">
                  {classesData
                    ?.filter((cls) => cls.class_id === class_id)
                    .map((cls) => cls.class_name || "No class selected")}
                </div>
              ) : (
                <select
                  className="border-2 border-cyan-300 w-full rounded-md p-2"
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

              {class_id ? (
                <div className="border-2 border-cyan-300 rounded-md p-2">
                  {classesData
                    ?.filter((cls) => cls.class_id === class_id)
                    .map((cls) => cls.class_name || "No class selected")}
                </div>
              ) : (
                <select
                  className="border-2 border-cyan-300 w-full rounded-md p-2"
                  value={promotedClass}
                  onChange={handlePromotedClassChange}
                  required
                >
                  <option value="">Promoted to...</option>
                  {classesData2?.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* </form> */}

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
                              onChange={() =>
                                handleStudentSelection(student.id)
                              }
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
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Close
                </button>
              </div>

              <div className="flex">
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md flex items-center ${
                    selectedStudents.length === 0 && !promotedClass
                      ? "bg-gray-200 hover:bg-gray-200 focus:ring-gray"
                      : "bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  }`}
                  disabled={selectedStudents.length === 0 && !promotedClass}
                >
                  <FaEnvelope className="mr-2" />
                  Promote Selected Students
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ClassPromotion;

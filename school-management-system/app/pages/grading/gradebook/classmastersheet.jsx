"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";
import { fetchData } from "../../../config/configFile";
import GenerateClassMasterSheetPDF from "../classmastersheetpdf/classmasterssheetpdf";

const ClassMasterSheet = ({ onClose, class_id }) => {
  const { data: session, status } = useSession();

  const [studentsData, setStudentsData] = useState([]);
  const [originalStudentsData, setOriginalStudentsData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classAverage, setClassAverage] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState();
  const [selectedClass, setSelectedClass] = useState(class_id);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [isHeadTeacher, setIsHeadTeacher] = useState(true);
  const [semesterData, setSemesterData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user?.activeSemester;
      setSelectedSemester(activeSemester?.semester_id);
      // setSemesterData(activeSemester);
      if (class_id) {
        fetchClassData(class_id, activeSemester?.semester_id);
      }
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view masters sheet"];

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

    if (session?.user?.roles?.some((role) => authorizedRoles.includes(role))) {
      setIsHeadTeacher(true);
    } else {
      setIsHeadTeacher(false);
    }
  }, [session]);

  useEffect(() => {
    fetchallData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSemester) {
      fetchClassData(selectedClass, selectedSemester);
    }
  }, [selectedSemester, selectedClass]);

  const fetchallData = async () => {
    setIsLoading(true);
    try {
      const [classes, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "class", false),
        fetchData("/api/semester/all", "semester", false),
      ]);
      setClassesData(classes?.classes);
      setSemesterData(semesterdata);
      // setSelectedSemester(semesterdata[0].semester_id);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassData = async (class_id, semester_id) => {
    class_id = parseInt(class_id);
    semester_id = parseInt(semester_id);
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/grading/getgradesbyclassandsem/${class_id}/${semester_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setSubjects(data?.subjects);
      setStudentsData(data?.students);
      setClassAverage(data?.classAverage);
      setOriginalStudentsData(JSON.parse(JSON.stringify(data?.students))); // Deep copy
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (e) => {
    // setIsLoading(true);
    const class_id = e.target.value;
    setSelectedClass(class_id);
  };

  const handleSemesterChange = (e) => {
    // setIsLoading(true);
    const semester_id = e.target.value;
    setSelectedSemester(semester_id);
    console.log("semester_id", semester_id);
  };

  const calculateTotal = (grades) => {
    return Object.values(grades).reduce((sum, grade) => sum + grade, 0);
  };

  const calculatePositions = useCallback((students) => {
    const sortedStudents = [...students].sort(
      (a, b) => calculateTotal(b.grades) - calculateTotal(a.grades)
    );
    return sortedStudents.map((student, index) => ({
      ...student,
      position: index + 1,
    }));
  }, []);

  const checkForChanges = useCallback(() => {
    const hasChanges =
      JSON.stringify(studentsData) !== JSON.stringify(originalStudentsData);
    setHasChanges(hasChanges);
  }, [studentsData, originalStudentsData]);

  useEffect(() => {
    checkForChanges();
  }, [studentsData, checkForChanges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.info("No changes detected. Submission skipped.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/remarks/addclassremarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          students: studentsData,
          class_id: selectedClass,
          semester_id: selectedSemester,
          user_id: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save remarks");
      }

      const result = await response.json();
      toast.success(result.message);
      setOriginalStudentsData(JSON.parse(JSON.stringify(studentsData))); // Update original data
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error("Error saving remarks:", error);
      toast.error("Failed to save remarks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const doc = await GenerateClassMasterSheetPDF(
        studentsData,
        subjects,
        semesterData,
        classesData,
        selectedClass,
        selectedSemester,
        classAverage
      );

      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error generating PDF", error);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

   if (isLoading || status==='loading') {
     return <LoadingPage />;
   }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "view masters sheet" to be on this page...!
      </div>
    );
  }

 

  return (
    <div className="p-4 max-w-full mx-auto text-cyan-700">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        Class Masters sheet
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex space-x-4 w-full">
          {class_id ? (
            <div className="border-2 border-cyan-300 rounded-md p-2 w-full">
              {classesData
                ?.filter((cls) => cls.class_id === class_id)
                .map((cls) => cls.class_name || "No class selected")}
            </div>
          ) : (
            <select
              className="border-2 border-cyan-300 rounded-md p-2 w-full"
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

          <select
            className="border-2 border-cyan-300 rounded-md p-2 w-full"
            value={selectedSemester}
            onChange={handleSemesterChange}
            required
          >
            <option value="">Select semester/term</option>
            {semesterData?.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.semester_name}({semester.start_date})
              </option>
            ))}
          </select>
        </div>
        {selectedClass && selectedSemester && studentsData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto overflow-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    {subjects.map((subject) => (
                      <th key={subject} className="px-4 py-2 text-left">
                        {subject}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left ">Total</th>
                    <th className="px-4 py-2 text-left">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatePositions(studentsData).map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-2">{student.id}</td>
                      <td className="px-4 py-2">{student.name}</td>
                      {subjects.map((subject) => (
                        <td key={subject} className="px-4 py-2 text-center">
                          {student.grades[subject] || "-"}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-green-700">
                        {calculateTotal(student.grades)}
                      </td>
                      <td className="px-4 py-2 text-green-500">
                        {student.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>{" "}
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isLoading || !selectedClass || !selectedSemester}
              >
                Print PDF
              </button>
            </div>
          </>
        ) : (
          <div className="text-cyan-600"> Select a class to comtinue</div>
        )}
      </form>
    </div>
  );
};

export default ClassMasterSheet;

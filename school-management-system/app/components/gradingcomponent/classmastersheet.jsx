import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Loadingpage from "../Loadingpage";
import { fetchData } from "../../config/configFile";

const ClassMasterSheet = ({ onClose, onSave, userRole }) => {
  const { data: session, status } = useSession();

  const [studentsData, setStudentsData] = useState([]);
  const [originalStudentsData, setOriginalStudentsData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState();
  const [selectedClass, setSelectedClass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [isHeadTeacher, setIsHeadTeacher] = useState(true);
  const [semesterData, setSemesterData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = [
      "add remarks",
      "update remarks",
      "add student",
    ];

    if (
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

  const fetchallData = async () => {
    setIsLoading(true);
    try {
      const [classes, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "class", false),
        fetchData("/api/semester/all", "semester", false),
      ]);
      setClassesData(classes?.classes);
      setSemesterData(semesterdata[0]);
      setSelectedSemester(semesterdata[0].semester_id);
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
      setOriginalStudentsData(JSON.parse(JSON.stringify(data?.students))); // Deep copy
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setIsLoading(true);
    const class_id = e.target.value;
    setSelectedClass(class_id);
    if (class_id) {
      fetchClassData(class_id, selectedSemester);
    } else {
      setStudentsData([]);
      setOriginalStudentsData([]);
    }
    setIsLoading(false);
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

  const handleGradeChange = (studentId, subject, value) => {
    setStudentsData((prevData) =>
      prevData.map((student) =>
        student.id === studentId
          ? {
              ...student,
              grades: { ...student.grades, [subject]: parseInt(value) || 0 },
            }
          : student
      )
    );
    checkForChanges();
  };

  const handleRemarkChange = (studentId, field, value) => {
    setStudentsData((prevData) =>
      prevData.map((student) =>
        student.id === studentId ? { ...student, [field]: value } : student
      )
    );
    checkForChanges();
  };

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

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised to be on this page...!
      </div>
    );
  }

  if (isLoading) {
    return <Loadingpage />;
  }

  return (
    <div className="p-4 max-w-full mx-auto text-cyan-700">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        Class Remarks and Grades
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex space-x-4">
          <select
            className="border-2 border-cyan-300 rounded-md p-2"
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
          <div className="border-2 border-cyan-300 rounded-md p-2">
            {semesterData.semester_name || "No semester selected"}
          </div>
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
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Pos.</th>
                    <th className="px-4 py-2 text-left w-1/4">
                      Class Teacher's Remark
                    </th>
                    <th className="px-4 py-2 text-left w-1/4">
                      Head Teacher's Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calculatePositions(studentsData).map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-2">{student.id}</td>
                      <td className="px-4 py-2">{student.name}</td>
                      {subjects.map((subject) => (
                        <td key={subject} className="px-4 py-2 text-center">
                          {student.grades[subject] || ""}
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        {calculateTotal(student.grades)}
                      </td>
                      <td className="px-4 py-2">{student.position}</td>
                      <td className="px-4 py-2">
                        <textarea
                          value={student.teacherRemark}
                          onChange={(e) =>
                            handleRemarkChange(
                              student.id,
                              "teacherRemark",
                              e.target.value
                            )
                          }
                          className="w-full border rounded px-2 py-1 min-h-[80px] min-w-[170px] resize-vertical"
                          readOnly={!isHeadTeacher}
                        ></textarea>
                      </td>
                      <td className="px-4 py-2">
                        <textarea
                          value={student.headteacherRemark}
                          onChange={(e) =>
                            handleRemarkChange(
                              student.id,
                              "headteacherRemark",
                              e.target.value
                            )
                          }
                          className="w-full border rounded px-2 py-1 min-h-[80px] min-w-[170px] resize-vertical"
                          readOnly={isHeadTeacher}
                        ></textarea>
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
                Cancel
              </button>
              <button
                type="Print"
                className={`${
                  hasChanges
                    ? "bg-cyan-500 hover:bg-cyan-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                disabled={isLoading || !hasChanges}
              >
                {isLoading
                  ? "Saving..."
                  : hasChanges
                  ? "Save Changes"
                  : "No Changes"}
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

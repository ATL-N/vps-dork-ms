import React, { useEffect } from "react";
import {
  FaGraduationCap,
  FaClipboardList,
  FaUserEdit,
  FaSave,
  FaUndo,
} from "react-icons/fa";

const Addeditstudentgradepage = ({
  students,
  assignments,
  handleSubmit,
  handleGradeChange,
  handleClassChange,
  handleSubjectChange,
  grades,
  setGrades,
  calculateTotalGrade,
  selectedClass,
  selectedSubject,
  selectedSemester,
  classesData,
  subjectsData,
  semesterData,
  handleReset,
  gradesData,
}) => {
  const isUpdating = gradesData && Object.keys(gradesData).length > 0;

  useEffect(() => {
    if (isUpdating && gradesData.grades) {
      const populatedGrades = {};
      gradesData.grades.forEach((grade) => {
        populatedGrades[grade.student_id] = {
          1: grade.class_score.toString(),
          2: grade.exams_score.toString(),
        };
      });
      setGrades(populatedGrades);
    }
  }, [gradesData, isUpdating, setGrades]);

  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">
        {isUpdating ? "Enter Grades" : "Enter Grades"}
      </h2>
      <div className="bg-white p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex space-x-4 w-full">
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
            <select
              className="border-2 border-cyan-300 rounded-md p-2 w-full"
              value={selectedSubject}
              onChange={handleSubjectChange}
              required
            >
              <option value="">Select Subject</option>
              {subjectsData?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
            <div className="border-2 border-cyan-300 rounded-md p-2 w-full">
              {semesterData.semester_name || "No semester selected"}
            </div>
          </div>
          {selectedClass &&
          selectedSubject &&
          semesterData.semester_name &&
          students?.length > 0 ? (
            <>
              <div className="tableWrap">
                <table className={`overflow-y-scroll`}>
                  <thead className="header-overlay ">
                    <tr className="bg-cyan-700">
                      <th className="p-2 text-left bg-cyan-700">Student</th>
                      {assignments.map((assignment) => (
                        <th
                          key={assignment.id}
                          className="p-2 text-left bg-cyan-700"
                        >
                          {assignment.name} ({assignment.weight}%)
                        </th>
                      ))}
                      <th className="p-2 text-left bg-cyan-700">Total Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students?.map((student) => (
                      <tr key={student.student_id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center">
                            <FaUserEdit
                              className="text-cyan-500 mr-2"
                              size={18}
                            />
                            <div>
                              <p className="font-semibold">
                                {student.student_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        {assignments.map((assignment) => (
                          <td key={assignment.id} className="p-2">
                            <input
                              type="number"
                              min="0"
                              max={assignment.weight}
                              className="w-full border-2 border-cyan-300 rounded-md p-1"
                              onChange={(e) =>
                                handleGradeChange(
                                  student.student_id,
                                  assignment.id,
                                  e.target.value
                                )
                              }
                              value={
                                grades[student.student_id]?.[assignment.id] ||
                                ""
                              }
                            />
                          </td>
                        ))}
                        <td className="p-2 font-semibold">
                          {calculateTotalGrade(student.student_id) || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                  onClick={handleReset}
                >
                  <FaUndo className="mr-2" />
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
                >
                  <FaSave className="mr-2" />
                  {isUpdating ? "Save Grades" : "Save Grades"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-cyan-600">Select a class and a subject to continue</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Addeditstudentgradepage;

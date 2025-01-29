// components/add-edit-remark.js
import React, { useState, useEffect } from "react";

const AddEditRemark = ({ remark, onClose, onSave, userRole }) => {
  const [formData, setFormData] = useState({
    studentName: "",
    class: "",
    teacherRemark: "",
    headteacherRemark: "",
    grades: {},
  });

  useEffect(() => {
    if (remark) {
      setFormData(remark);
    } else {
      // Fetch and auto-populate grades
      fetchStudentGrades();
    }
  }, [remark]);

  const fetchStudentGrades = async () => {
    // This would be replaced with an actual API call in a real application
    const dummyGrades = {
      Mathematics: "A",
      Science: "B+",
      English: "A-",
      History: "B",
      Geography: "A",
      // Add more subjects as needed
    };

    setFormData((prev) => ({
      ...prev,
      grades: dummyGrades,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-cyan-700 h-[70vh] pb-16">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        {remark ? "Edit Remark" : "Add New Remark"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Student Name
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Class
            </label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              readOnly
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Grades
          </label>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.grades).map(([subject, grade]) => (
                  <tr key={subject} className="border-b">
                    <td className="px-4 py-2">{subject}</td>
                    <td className="px-4 py-2">{grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Teacher Remark
          </label>
          <textarea
            name="teacherRemark"
            value={formData.teacherRemark}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            readOnly={userRole !== "teacher"}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Headteacher Remark
          </label>
          <textarea
            name="headteacherRemark"
            value={formData.headteacherRemark}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            readOnly={userRole !== "headteacher"}
          ></textarea>
        </div>
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditRemark;

// components/view-remark-history.js
import React, { useState, useEffect } from "react";

const ViewRemarkHistory = ({ studentName, onClose }) => {
  const [remarkHistory, setRemarkHistory] = useState([]);

  useEffect(() => {
    fetchRemarkHistory();
  }, []);

  const fetchRemarkHistory = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        semester: "1",
        teacherRemark:
          "John has shown excellent progress across all subjects. His dedication and hard work are commendable.",
        headteacherRemark:
          "Outstanding performance. Keep up the good work, John!",
        date: "2024-07-15",
        grades: {
          Mathematics: "A",
          Science: "A-",
          English: "B+",
          History: "A",
        },
      },
      // ... more historical remarks
    ];
    setRemarkHistory(data);
  };

  return (
    <div className="p-4 text-cyan-700">
      <h2 className="text-2xl font-bold mb-4">
        Remark History for {studentName}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Semester</th>
              <th className="px-4 py-2 text-left">Teacher Remark</th>
              <th className="px-4 py-2 text-left">Headteacher Remark</th>
              <th className="px-4 py-2 text-left">Grades</th>
            </tr>
          </thead>
          <tbody>
            {remarkHistory.map((remark) => (
              <tr key={remark.id} className="border-b">
                <td className="px-4 py-2">{remark.date}</td>
                <td className="px-4 py-2">{remark.semester}</td>
                <td className="px-4 py-2">{remark.teacherRemark}</td>
                <td className="px-4 py-2">{remark.headteacherRemark}</td>
                <td className="px-4 py-2">
                  <ul>
                    {Object.entries(remark.grades).map(([subject, grade]) => (
                      <li key={subject}>
                        {subject}: {grade}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewRemarkHistory;

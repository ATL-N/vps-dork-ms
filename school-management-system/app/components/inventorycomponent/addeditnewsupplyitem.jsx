import React, { useState, useMemo } from "react";
import { FaBook, FaSave, FaUndo, FaCalendar } from "react-icons/fa";

// Dummy data
const classesData = [
  { class_id: 1, class_name: "Class 1A" },
  { class_id: 2, class_name: "Class 2B" },
  { class_id: 3, class_name: "Class 3C" },
];

const semestersData = [
  { semester_id: 1, semester_name: "First Semester" },
  { semester_id: 2, semester_name: "Second Semester" },
];

const studentsData = {
  1: [
    { student_id: 1, student_name: "John Doe" },
    { student_id: 2, student_name: "Jane Smith" },
    { student_id: 3, student_name: "Bob Johnson" },
  ],
  2: [
    { student_id: 4, student_name: "Alice Brown" },
    { student_id: 5, student_name: "Charlie Davis" },
  ],
  3: [
    { student_id: 6, student_name: "Eva Wilson" },
    { student_id: 7, student_name: "Frank Miller" },
    { student_id: 8, student_name: "Grace Taylor" },
  ],
};

const itemsData = [
  { item_id: 1, item_name: "Textbook" },
  { item_id: 2, item_name: "Notebook" },
  { item_id: 3, item_name: "Pen" },
];

const ClassSupplyManagement = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [supplies, setSupplies] = useState([]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    // Reset supplies when class changes
    setSupplies(
      studentsData[e.target.value].map((student) => ({
        student_id: student.student_id,
        student_name: student.student_name,
        supplies: itemsData.map((item) => ({
          item_id: item.item_id,
          quantity: 0,
        })),
      }))
    );
  };

  const handleSemesterChange = (e) => {
    setSelectedSemesterId(e.target.value);
  };

  const handleQuantityChange = (studentId, itemId, quantity) => {
    setSupplies(
      supplies.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              supplies: student.supplies.map((supply) =>
                supply.item_id === itemId ? { ...supply, quantity } : supply
              ),
            }
          : student
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting supplies:", supplies);
    // Here you would typically send this data to your backend
  };

  const resetForm = () => {
    setSelectedClassId("");
    setSelectedSemesterId("");
    setSupplies([]);
  };

  const totalSupplies = useMemo(() => {
    return supplies.reduce((total, student) => {
      student.supplies.forEach((supply) => {
        total[supply.item_id] = (total[supply.item_id] || 0) + supply.quantity;
      });
      return total;
    }, {});
  }, [supplies]);

  return (
    <div className="space-y-3 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">
        Class Supply Management
      </h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1 text-cyan-600">
          <label className="block text-sm font-medium text-cyan-700">
            Select Class
          </label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedClassId}
            onChange={handleClassChange}
          >
            <option value="">Select class</option>
            {classesData.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 text-cyan-600">
          <label className="block text-sm font-medium text-cyan-700">
            Select Semester
          </label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedSemesterId}
            onChange={handleSemesterChange}
          >
            <option value="">Select semester</option>
            {semestersData.map((semester) => (
              <option key={semester.semester_id} value={semester.semester_id}>
                {semester.semester_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClassId && selectedSemesterId ? (
        <div className="bg-white p-6 pt-0 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full overflow-scroll">
                <thead>
                  <tr className="bg-cyan-700 text-white">
                    <th className="p-2">Student Name</th>
                    {itemsData.map((item) => (
                      <th key={item.item_id} className="p-2">
                        {item.item_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="overflow-scroll">
                  {supplies.map((student) => (
                    <tr key={student.student_id} className="border-b">
                      <td className="p-2">{student.student_name}</td>
                      {student.supplies.map((supply) => (
                        <td key={supply.item_id} className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={supply.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                student.student_id,
                                supply.item_id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full border-2 border-cyan-300 rounded-md p-1"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-cyan-100">
                    <td className="p-2 font-bold">Total</td>
                    {itemsData.map((item) => (
                      <td key={item.item_id} className="p-2 font-bold">
                        {totalSupplies[item.item_id] || 0}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 flex justify-between">
              <div className="space-x-4 flex justify-around">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                  onClick={resetForm}
                >
                  <FaUndo className="mr-2" />
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Supplies
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-4">
          Please select a class and semester to manage supplies.
        </div>
      )}
    </div>
  );
};

export default ClassSupplyManagement;

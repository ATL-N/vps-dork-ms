import React, { useEffect, useState } from "react";
import { FaPrint, FaTrash } from "react-icons/fa";
import DeleteUser from '../../components/deleteuser'
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Modal from "../../components/modal/modal";



const DisplayTimetable = ({
  classesData,
  semesterData,
  selectedClassId,
  selectedSemesterId,
  timetable,
  periods,
  daysOfWeek,
  handleClassChange,
  handleSemesterChange,
  displayPrintBtn = true,
}) => {
    const { data: session, status } = useSession();

  const [selectedClass, setSelectedClass] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
const [showModal, setShowModal] = useState(false);
const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    setSelectedClass(
      classesData?.find((c) => c.class_id === parseInt(selectedClassId))
    );
  }, [selectedClassId, classesData]);

const handleDelete = async () => {
  // Show confirmation dialog
  const isConfirmed = window.confirm(
    `Are you sure you want to delete the timetable for ${selectedClass?.class_name}?`
  );

  // If user didn't confirm, exit the function
  if (!isConfirmed) {
    return;
  }

  const toastId = toast.loading("Processing your request...");

  try {
    setIsDeleting(true);
    const response = await fetch(
      `/api/timetable/deleteforclassandsem?classId=${selectedClassId}&semesterId=${selectedSemesterId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      toast.update(toastId, {
        render: "Failed to delete timetable.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      throw new Error("Failed to delete timetable");
    }

    // Success toast
    toast.update(toastId, {
      render: "Timetable deleted successfully...",
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });

    // You can handle post-deletion logic here
  } catch (error) {
    console.error("Error deleting timetable:", error);
    toast.update(toastId, {
      render: "An error occurred. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
  } finally {
    setIsDeleting(false);
  }
};
  const generatePDF = () => {
    const doc = new jsPDF({
      format: "a4",
      orientation: "landscape",
      unit: "mm",
    });

    doc.setFontSize(18);
    doc.text(`Timetable for ${selectedClass.class_name}`, 14, 15);

    const tableData = daysOfWeek.map((day) => {
      return [
        day,
        ...periods.map((period) => {
          const entry = timetable[day]?.[period.number];
          return entry ? `${entry.subjectName}\n${entry.teacherName}` : "-";
        }),
      ];
    });

    const tableHeaders = [
      "Day / Period",
      ...periods.map(
        (period) =>
          `Period ${period.number}\n${period.startTime} - ${period.endTime}`
      ),
    ];

    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      styles: { fontSize: 14, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 20 } },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index > 0) {
          const cellHeight = data.row.height;
          const cellWidth = data.column.width;
          const cellX = data.cell.x;
          const cellY = data.cell.y;

          doc.setDrawColor(0);
          doc.setLineWidth(0.1);
          doc.line(cellX, cellY, cellX + cellWidth, cellY);
          doc.line(
            cellX,
            cellY + cellHeight,
            cellX + cellWidth,
            cellY + cellHeight
          );
          doc.line(cellX, cellY, cellX, cellY + cellHeight);
          doc.line(
            cellX + cellWidth,
            cellY,
            cellX + cellWidth,
            cellY + cellHeight
          );
        }
      },
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(pdfUrl, "_blank");

    newWindow.onload = () => {
      newWindow.print();
    };
  };

  return (
    <div className="space-y-6 text-cyan-800">
      {displayPrintBtn && (
        <>
          <h2 className="text-2xl font-bold text-cyan-700">View Timetable</h2>
          <div className="w-full flex justify-stretch">
            <div className="w-full mb-4 mr-6">
              <label
                htmlFor="class-select"
                className="block text-sm font-medium text-cyan-700"
              >
                Select Class
              </label>
              <select
                id="class-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                value={selectedClassId}
                onChange={handleClassChange}
              >
                <option value="">Select a class</option>
                {classesData?.map((class_) => (
                  <option key={class_.class_id} value={class_.class_id}>
                    {class_.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full mb-4">
              <label
                htmlFor="semester-select"
                className="block text-sm font-medium text-cyan-700"
              >
                Select Term
              </label>
              <select
                id="semester-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                value={selectedSemesterId}
                onChange={handleSemesterChange}
              >
                <option value="">Select a term</option>
                {semesterData?.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {`${semester?.semester_name}(${semester?.start_date})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {selectedClassId && selectedSemesterId && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <colgroup>
                <col className="w-1/6" />
                {periods.map((period) => (
                  <col
                    key={period.number}
                    className={`w-${Math.floor(5 / periods.length)}/6`}
                  />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-cyan-700 text-white">
                  <th className="p-2 border border-cyan-600">Day / Period</th>
                  {periods.map((period) => (
                    <th
                      key={period.number}
                      className="p-2 border border-cyan-600"
                    >
                      <div className="flex items-center justify-center space-x-2 flex-col">
                        <span>Period {period.number}</span>
                        <span className="text-xs">
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day) => (
                  <tr key={day} className="border-b">
                    <td className="p-2 font-bold border border-cyan-200">
                      {day}
                    </td>
                    {periods.map((period) => {
                      const entry = timetable[day]?.[period.number];
                      return (
                        <td
                          key={`${day}-${period.number}`}
                          className="p-2 border border-cyan-200"
                        >
                          {entry ? (
                            <div className="flex flex-col space-y-1">
                              <span className="font-semibold">
                                {entry.subjectName}
                              </span>
                              <span className="text-sm">
                                {entry.teacherName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {entry.roomName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayPrintBtn && (
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center disabled:opacity-50"
              >
                <FaTrash className="mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default DisplayTimetable;

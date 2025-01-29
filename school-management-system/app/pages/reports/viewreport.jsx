// pages/dashboard/reports/viewreport.js
import React from "react";
import { FaFileAlt, FaCalendarAlt, FaTag } from "react-icons/fa";

const ViewReport = ({ report, onClose }) => {
  return (
    <div className="text-cyan-800">
      <h2 className="text-xl font-bold mb-4">{report.title}</h2>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaTag className="text-cyan-500 mr-2" />
          <p>
            <strong>Type:</strong> {report.type}
          </p>
        </div>
        <div className="flex items-center mb-2">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>Date Generated:</strong> {report.date}
          </p>
        </div>
        <div className="flex items-start mb-2">
          <FaFileAlt className="text-cyan-500 mr-2 mt-1" />
          <div>
            <p>
              <strong>Report Content:</strong>
            </p>
            <p>
              This is where the actual report content would be displayed. In a
              real application, this would likely be fetched from the server and
              could include tables, charts, or other data visualizations.
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewReport;

"use client";
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { fetchData } from "../../config/configFile";
import LoadingPage from "../../components/generalLoadingpage";

const MessageDetails = ({ id, onClose }) => {
  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleFetchData(id);
  }, [id]);

  const handleFetchData = async (sms_id) => {
    setIsLoading(true);
    try {
      const smsLog = await fetchData(
        `/api/messaging/fetchallmessages/${sms_id}`,
        "",
        false
      );
      setLog(smsLog);
    } catch (error) {
      console.error("Error fetching SMS log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!log) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full">
        <p className="text-red-500">Failed to load message details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <div className="flex justify-between items-center mb-6 border-b pb-2 border-gray-200">
        <h2 className="text-2xl font-semibold text-cyan-700">
          Message Details
        </h2>
        {/* <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button> */}
      </div>

      <div className="mb-4">
        <strong className="text-gray-700 flex items-center">
          <FaUsers className="mr-2 text-lg" /> Recipient Type:
        </strong>
        <span className="ml-2 text-gray-800">{log.recipient_type}</span>
      </div>
      <div className="mb-4">
        <strong className="text-gray-700 flex items-center">
          <FaEnvelope className="mr-2 text-lg" /> Message:
        </strong>
        <p className="ml-6 text-gray-800 whitespace-pre-line">
          {log.message_content}
        </p>
      </div>
      <div className="mb-6">
        <strong className="text-gray-700 flex items-center">
          <FaCalendarAlt className="mr-2 text-lg" /> Sent Timestamp:
        </strong>
        <span className="ml-2 text-gray-800">
          {new Date(log.send_timestamp).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-4 border-gray-200">
        <div>
          <strong className="text-gray-700">Total Attempted:</strong>
          <span className="ml-2 text-gray-800">{log.total_attempeted}</span>
        </div>
        <div>
          <strong className="text-gray-700">Total Invalid Numbers:</strong>
          <span className="ml-2 text-gray-800">
            {log.total_invalid_numbers}
          </span>
        </div>
        <div>
          <strong className="text-gray-700">Total Successful:</strong>
          <span className="ml-2 text-gray-800">{log.total_successful}</span>
        </div>
        <div>
          <strong className="text-gray-700">Total Failed:</strong>
          <span className="ml-2 text-gray-800">{log.total_failed}</span>
        </div>
        <div>
          <strong className="text-gray-700">Total SMS Used:</strong>
          <span className="ml-2 text-gray-800">{log.total_sms_used}</span>
        </div>
      </div>

      {/* Successful Recipients */}
      {log.successful_recipients && log.successful_recipients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-600 mb-2 flex items-center">
            <FaCheckCircle className="mr-2 text-lg" /> Successful Recipients
          </h3>
          <ul className="ml-4">
            {log.successful_recipients.map((recipient, index) => (
              <li key={index} className="text-gray-700">
                {recipient.name} -{" "}
                <span className="text-gray-500">{recipient.phone}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Failed Recipients */}
      {log.failed_recipients && log.failed_recipients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center">
            <FaTimesCircle className="mr-2 text-lg" /> Failed Recipients
          </h3>
          <ul className="ml-4">
            {log.failed_recipients.map((recipient, index) => (
              <li key={index} className="text-gray-700">
                {recipient.name} -{" "}
                <span className="text-gray-500">{recipient.phone}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invalid Recipients */}
      {log.invalid_recipients && log.invalid_recipients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-600 mb-2 flex items-center">
            <FaExclamationTriangle className="mr-2 text-lg" /> Invalid Numbers
          </h3>
          <ul className="ml-4">
            {log.invalid_recipients.map((recipient, index) => (
              <li key={index} className="text-gray-700">
                {recipient.name} -{" "}
                <span className="text-gray-500">{recipient.phone}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MessageDetails;

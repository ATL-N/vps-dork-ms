// pages/dashboard/messaging/sentmessageslog.js
import React from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import CustomTable from "../../components/listtableForm";
import { useSession } from "next-auth/react";

const SentMessagesLog = ({ messages, onViewDetails }) => {
  const { data: session, status } = useSession();

  // Dummy data for SMS logs
  const dummyMessages = [
    {
      id: 1,
      recipient_type: "Students",
      message_content: "Reminder: School fees are due next week.",
      total_attempeted: 50,
      total_invalid_numbers: 2,
      total_successful: 45,
      total_failed: 3,
      send_timestamp: "2024-03-15T08:30:00Z",
    },
    {
      id: 2,
      recipient_type: "Parents",
      message_content: "PTA meeting scheduled for this Saturday at 10:00 AM.",
      total_attempeted: 120,
      total_invalid_numbers: 5,
      total_successful: 110,
      total_failed: 5,
      send_timestamp: "2024-03-12T14:15:00Z",
    },
    {
      id: 3,
      recipient_type: "Staff",
      message_content:
        "Staff meeting tomorrow at 9:00 AM in the conference room.",
      total_attempeted: 30,
      total_invalid_numbers: 0,
      total_successful: 30,
      total_failed: 0,
      send_timestamp: "2024-03-10T16:45:00Z",
    },
    {
      id: 4,
      recipient_type: "Suppliers",
      message_content:
        "New order request: Please prepare the following items...",
      total_attempeted: 15,
      total_invalid_numbers: 1,
      total_successful: 13,
      total_failed: 1,
      send_timestamp: "2024-03-08T11:00:00Z",
    },
    {
      id: 5,
      recipient_type: "Students",
      message_content: "Congratulations to the winners of the science fair!",
      total_attempeted: 45,
      total_invalid_numbers: 3,
      total_successful: 40,
      total_failed: 2,
      send_timestamp: "2024-03-05T09:20:00Z",
    },
    {
      id: 6,
      recipient_type: "Parents",
      message_content:
        "Parent-teacher conferences will be held next week. Please sign up for a slot.",
      total_attempeted: 110,
      total_invalid_numbers: 2,
      total_successful: 105,
      total_failed: 3,
      send_timestamp: "2024-03-02T13:30:00Z",
    },
    {
      id: 7,
      recipient_type: "Staff",
      message_content: "Reminder: Professional development workshop on Friday.",
      total_attempeted: 25,
      total_invalid_numbers: 0,
      total_successful: 25,
      total_failed: 0,
      send_timestamp: "2024-02-28T10:00:00Z",
    },
    {
      id: 8,
      recipient_type: "Others",
      message_content: "Test message to other recipients.",
      total_attempeted: 5,
      total_invalid_numbers: 0,
      total_successful: 4,
      total_failed: 1,
      send_timestamp: "2024-02-26T15:55:00Z",
    },
  ];

  const headerNames = [
    "id",
    "Recipient Type",
    "Message",
    "Attempted",
    "Invalid",
    "Successful",
    "Failed",
    "Timestamp",
    // "Status",
  ];

  return (
    <div className="overflow-x-auto">
      <CustomTable
        data={dummyMessages}
        headerNames={headerNames}
        maxTableHeight="40vh"
        height="20vh"
        // handleDelete={handleDeleteClass}
        // handleEdit={handleEditClass}
        handleDetails={onViewDetails}
        // handleSearch={handleSearchInputChange}
        // searchTerm={searchQuery}
        searchPlaceholder="Search by class name, room, or level"
        displayLinkBtn={false}
        displayDelBtn={false}
        displaySearchBar={false}
        // displayActions={
        //   session?.user?.role === "admin" ||
        //   session?.user?.role === "head teacher"
        // }
        itemDetails="class id."
        // handleOpenLink={handleOpenLink}
        displayEditBtn={false}
      />

      {/* <table className="min-w-full divide-y divide-gray-200 ">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Recipient Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Message
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Attempted
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Invalid
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Successful
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Failed
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Timestamp
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Status
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">View Details</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dummyMessages.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap">{log.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.recipient_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.message_content.substring(0, 30)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.total_attempeted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.total_invalid_numbers}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.total_successful}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.total_failed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(log.send_timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.total_successful === log.total_attempeted ? (
                  <FaCheckCircle className="text-green-500" />
                ) : log.total_failed > 0 ? (
                  <FaTimesCircle className="text-red-500" />
                ) : (
                  <FaExclamationTriangle className="text-yellow-500" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewDetails(log)}
                  className="text-cyan-600 hover:text-cyan-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
};

export default SentMessagesLog;

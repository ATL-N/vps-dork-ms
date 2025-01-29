// pages/dashboard/messaging/inbox.js
import React from "react";
import { FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";

const Inbox = ({ messages, onViewMessage }) => {
  return (
    <div className="overflow-x-auto tableWrap height-45vh">
      <table className="w-full table-auto overflow-y-scroll">
        <thead className="header-overlay">
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Sender</th>
            <th className="px-4 py-2 text-left">Subject</th>
            <th className="px-4 py-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="text-cyan-600">
          {messages.map((message) => (
            <tr
              key={message.id}
              className="border-b cursor-pointer hover:bg-gray-50"
              onClick={() => onViewMessage(message)}
            >
              <td className="px-4 py-2">
                {message.read ? (
                  <FaEnvelopeOpen className="text-gray-400" />
                ) : (
                  <FaEnvelope className="text-cyan-600" />
                )}
              </td>
              <td className="px-4 py-2">{message.sender}</td>
              <td className="px-4 py-2">{message.subject}</td>
              <td className="px-4 py-2">
                {new Date(message.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inbox;

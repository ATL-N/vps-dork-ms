// pages/dashboard/messaging/viewmessage.js
import React from "react";
import { FaUser, FaEnvelope, FaClock, FaReply } from "react-icons/fa";

const ViewMessage = ({ message, onClose, onReply }) => {
  const handleReply = () => {
    onReply({
      recipient: message.sender,
      subject: `Re: ${message.subject}`,
      content: `\n\nOn ${new Date(message.date).toLocaleString()}, ${
        message.sender
      } wrote:\n${message.content}`,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">View Message</h2>
      <div className="mb-4">
        <p className="text-gray-700">
          <FaUser className="inline mr-2" /> <strong>From:</strong>{" "}
          {message.sender}
        </p>
      </div>
      <div className="mb-4">
        <p className="text-gray-700">
          <FaEnvelope className="inline mr-2" /> <strong>Subject:</strong>{" "}
          {message.subject}
        </p>
      </div>
      <div className="mb-4">
        <p className="text-gray-700">
          <FaClock className="inline mr-2" /> <strong>Date:</strong>{" "}
          {new Date(message.date).toLocaleString()}
        </p>
      </div>
      <div className="mb-6">
        <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          onClick={handleReply}
        >
          <FaReply className="mr-2" /> Reply
        </button>
        <button
          className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewMessage;

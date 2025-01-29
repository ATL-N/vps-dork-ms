// pages/dashboard/messaging/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaInbox,
  FaPaperPlane,
  FaBullhorn,
  FaEnvelopeOpenText,
  FaRegBell,
} from "react-icons/fa";
import StatCard from "../statcard";
import Modal from "../modal/modal";
import Inbox from "./inbox";
import ComposeMessage from "./composemessage";
import ViewMessage from "./viewmessage";
import BroadcastNotifications from "./broadcastnotifications";
import EmailTemplates from "./emailtemplates";

const MessagingCommunication = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        sender: "John Doe",
        subject: "Meeting Reminder",
        content: "Don't forget about the staff meeting tomorrow at 10 AM.",
        date: "2024-07-25T10:30:00Z",
        read: false,
      },
      {
        id: 2,
        sender: "Jane Smith",
        subject: "Student Performance Report",
        content:
          "Please find attached the student performance report for this semester.",
        date: "2024-07-24T14:15:00Z",
        read: true,
      },
      // Add more message data as needed
    ];
    setMessages(data);
  };

  const handleComposeMessage = () => {
    setModalContent(
      <ComposeMessage
        onClose={() => setShowModal(false)}
        onSend={(messageData) => {
          console.log("Sending message:", messageData);
          fetchMessages();
        }}
      />
    );
    setShowModal(true);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setModalContent(
      <ViewMessage
        message={message}
        onClose={() => setShowModal(false)}
        onReply={(replyData) => {
          console.log("Replying to message:", replyData);
          fetchMessages();
        }}
      />
    );
    setShowModal(true);
  };

  const handleBroadcastNotification = () => {
    setModalContent(
      <BroadcastNotifications
        onClose={() => setShowModal(false)}
        onBroadcast={(notificationData) => {
          console.log("Broadcasting notification:", notificationData);
          fetchMessages();
        }}
      />
    );
    setShowModal(true);
  };

  const handleEmailTemplates = () => {
    setModalContent(
      <EmailTemplates
        onClose={() => setShowModal(false)}
        onSave={(templateData) => {
          console.log("Saving email template:", templateData);
        }}
      />
    );
    setShowModal(true);
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Messaging & Communication
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaInbox />}
          title="Total Messages"
          value={messages.length}
        />
        <StatCard
          icon={<FaRegBell />}
          title="Unread Messages"
          value={messages.filter((m) => !m.read).length}
        />
        <StatCard
          icon={<FaPaperPlane />}
          title="Sent Messages"
          value={25} // Replace with actual data
        />
        <StatCard
          icon={<FaBullhorn />}
          title="Broadcasts"
          value={5} // Replace with actual data
        />
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">Inbox</h2>
          <div className="flex">
            <button
              onClick={handleComposeMessage}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
            >
              <FaPaperPlane className="mr-2" /> Compose Message
            </button>
            <button
              onClick={handleBroadcastNotification}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
            >
              <FaBullhorn className="mr-2" /> Broadcast Notification
            </button>
            <button
              onClick={handleEmailTemplates}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaEnvelopeOpenText className="mr-2" /> Email Templates
            </button>
          </div>
        </div>
        <Inbox messages={messages} onViewMessage={handleViewMessage} />
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default MessagingCommunication;

'use client'
import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaUserFriends,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

const NotificationDetailsPage = ({ notificationId }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchNotificationDetails();
  }, [notificationId]);

  const fetchNotificationDetails = async () => {
    // Implement fetch logic here
  };

  if (!notification) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600">
      <h2 className="text-3xl font-bold text-cyan-700 mb-8">
        {notification.title}
      </h2>

      <div className="space-y-4">
        <p className="text-lg">{notification.message}</p>

        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>Type: {notification.notificationType}</span>
        </div>

        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>Priority: {notification.priority}</span>
        </div>

        <div className="flex items-center">
          <FaClock className="mr-2" />
          <span>Sent at: {new Date(notification.sentAt).toLocaleString()}</span>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Recipients</h3>
          {/* Add a list or table of recipients here */}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsPage;

'use client'
import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";

const UserNotifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUserNotifications();
  }, [userId]);

  const fetchUserNotifications = async () => {
    // Implement fetch logic here
  };

  const handleMarkAsRead = async (notificationId) => {
    // Implement mark as read logic here
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold text-cyan-700 mb-4">
        Recent Notifications
      </h3>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="flex items-start">
              <FaBell className="mt-1 mr-2 text-cyan-600" />
              <div>
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs text-cyan-600 hover:text-cyan-700"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserNotifications;

import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";

const UserNotificationPreferences = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    generalNotifications: true,
    alertNotifications: true,
    reminderNotifications: true,
  });

  useEffect(() => {
    fetchUserPreferences();
  }, [userId]);

  const fetchUserPreferences = async () => {
    // Implement fetch logic here
  };

  const handleTogglePreference = async (preferenceName) => {
    // Implement toggle logic here
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600">
      <h2 className="text-3xl font-bold text-cyan-700 mb-8">
        Notification Preferences
      </h2>

      <div className="space-y-4">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="flex items-center">
              <FaBell className="mr-2" />
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleTogglePreference(key)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNotificationPreferences;

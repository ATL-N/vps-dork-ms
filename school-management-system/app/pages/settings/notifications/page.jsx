// pages/dashboard/settings/notifications.js
"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaBell } from "react-icons/fa";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
    attendanceAlerts: false,
    gradePostingAlerts: false,
    eventReminders: false,
    newsletterSubscription: false,
  });

  useEffect(() => {
    // Fetch current notification settings from API
    // Replace with actual API call
    const fetchedSettings = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      attendanceAlerts: true,
      gradePostingAlerts: true,
      eventReminders: false,
      newsletterSubscription: true,
    };
    setSettings(fetchedSettings);
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit updated notification settings to API
    console.log("Submitting notification settings:", settings);
    // Add API call here
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Notification Settings
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Notification Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="emailNotifications">Email Notifications</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="smsNotifications"
              name="smsNotifications"
              checked={settings.smsNotifications}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="smsNotifications">SMS Notifications</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pushNotifications"
              name="pushNotifications"
              checked={settings.pushNotifications}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="pushNotifications">Push Notifications</label>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Alert Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="attendanceAlerts"
              name="attendanceAlerts"
              checked={settings.attendanceAlerts}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="attendanceAlerts">Attendance Alerts</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="gradePostingAlerts"
              name="gradePostingAlerts"
              checked={settings.gradePostingAlerts}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="gradePostingAlerts">Grade Posting Alerts</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="eventReminders"
              name="eventReminders"
              checked={settings.eventReminders}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="eventReminders">Event Reminders</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="newsletterSubscription"
              name="newsletterSubscription"
              checked={settings.newsletterSubscription}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="newsletterSubscription">
              Newsletter Subscription
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
        >
          <FaSave className="mr-2" /> Save Notification Settings
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;

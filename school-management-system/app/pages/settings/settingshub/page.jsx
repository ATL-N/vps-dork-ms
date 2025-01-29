// pages/dashboard/settings/index.js
"use client";

import React, { useState } from "react";
import {
  FaCog,
  FaCalendarAlt,
  FaGraduationCap,
  FaBell,
  FaDatabase,
  FaLock,
} from "react-icons/fa";
import Link from "next/link";
import { useSession } from "next-auth/react";


const SettingsHub = () => {
      const { data: session, status } = useSession();
let settingsPages = [
  // {
  //   name: "General Settings",
  //   icon: <FaCog />,
  //   path: "/pages/settings/general",
  // },
  {
    name: "Academic Year Settings",
    icon: <FaCalendarAlt />,
    path: "/pages/semester",
  },
  {
    name: "Grading Scale Settings",
    icon: <FaGraduationCap />,
    path: "/pages/settings/gradingscale",
  },
  // {
  //   name: "Notification Settings",
  //   icon: <FaBell />,
  //   path: "/pages/settings/notifications",
  // },
  // {
  //   name: "System Backup and Restore",
  //   icon: <FaDatabase />,
  //   path: "/pages/settings/backuprestore",
  // },
  {
    name: "Change User Password",
    icon: <FaLock />,
    path: "/pages/users/changepassword",
  },
];;

if (
  session?.user?.role == "admin" ||
  session?.user?.role == "head teacher" ||
  session?.user?.roles?.some((role) => role === "admin")
) {
  settingsPages = [
    // {
    //   name: "General Settings",
    //   icon: <FaCog />,
    //   path: "/pages/settings/general",
    // },
    {
      name: "Academic Year Settings",
      icon: <FaCalendarAlt />,
      path: "/pages/semester",
    },
    {
      name: "Grading Scale Settings",
      icon: <FaGraduationCap />,
      path: "/pages/settings/gradingscale",
    },
    // {
    //   name: "Notification Settings",
    //   icon: <FaBell />,
    //   path: "/pages/settings/notifications",
    // },
    {
      name: "System Backup and Restore",
      icon: <FaDatabase />,
      path: "/pages/settings/backuprestore",
    },
    {
      name: "Change User Password",
      icon: <FaLock />,
      path: "/pages/users/changepassword",
    },
  ];
}
  

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsPages.map((page) => (
          <Link href={page.path} key={page.name}>
            <div className="bg-white p-6 rounded shadow hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4 text-cyan-700">{page.icon}</div>
                <h2 className="text-xl font-semibold text-cyan-700">
                  {page.name}
                </h2>
              </div>
              <p className="text-gray-600">Manage {page.name.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SettingsHub;

"use client";

import React, { useState } from "react";
import {
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaUserEdit,
  FaKey,
} from "react-icons/fa";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import HeaderName from './headerName'

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/authentication/login" });
  };

  return (
    <header className="bg-white shadow-md fixed top-0 right-0 left-16 h-16 flex items-center justify-between px-6 z-40">
      
      <HeaderName />

      <div className="flex items-center space-x-4">
        <Link href={`/pages/notification`}>
          <button className="text-gray-600 hover:text-cyan-500 relative">
            <FaBell className="text-2xl" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"></span>
          </button>
        </Link>
        <div className="relative">
          <button
            onMouseEnter={() => setIsProfileMenuOpen(true)}
            onMouseLeave={() => setIsProfileMenuOpen(false)}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-2 text-gray-600 hover:text-cyan-500 focus:outline-none capitalize"
          >
            <FaUserCircle className="text-3xl" />
            <span className="hidden md:inline">
              {session?.user?.name || "n/a"}
            </span>
          </button>
          {isProfileMenuOpen && (
            <div
              className="flex flex-col absolute right-0 pt-2 w-48 bg-gray-50 text-cyan-500 rounded-md shadow-lg py-1 z-50"
              onMouseEnter={() => setIsProfileMenuOpen(true)}
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <Link
                href="/pages/profile"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaUserEdit className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              <Link
                href="/pages/settings/settingshub"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaCog className="h-4 w-4" />
                <span>Settings</span>
              </Link>

              {/* /pages/users/changepassword */}
              <Link
                href="/pages/users/changepassword"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaKey className="h-4 w-4" />
                <span>Change Password</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
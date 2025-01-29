"use client";
// app/pages/users/changepassword

import React, { useState, useEffect } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";

const ChangePassword = () => {
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const user_id = session.user.id;
      setUserId(user_id);
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Changing password...");

    if (newPassword !== confirmNewPassword) {
      toast.update(toastId, {
        render: "New passwords do not match",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      setError("New passwords do not match");
      return;
    }
    setError(""); // Clear error if passwords match

    try {
      const response = await fetch("/api/auth/changepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.update(toastId, {
          render: data.error,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        throw new Error(data.message || "Something went wrong");
      }

      toast.update(toastId, {
        render: "Password changed successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Password change successful
      console.log("Password changed successfully");
      router.push("/"); // Redirect to dashboard or appropriate page
    } catch (error) {
      toast.update(toastId, {
        render: "Error changing password",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      setError(error.message);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-h-screen h-full flex items-center justify-center bg-gray-100 w-full overflow-auto">
        <div className="bg-white p-4 rounded shadow-md w-full max-w-md text-cyan-800 mb-7 ">
          <h1 className="text-3xl font-bold mb-6 text-cyan-700 text-center">
            Change Password
          </h1>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-cyan-600 mb-2"
              >
                Current Password
              </label>
              <div className="flex items-center border rounded">
                <FaLock className="text-gray-400 ml-2" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  className="w-full p-2 outline-none"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-cyan-600 mb-2">
                New Password
              </label>
              <div className="flex items-center border rounded">
                <FaLock className="text-gray-400 ml-2" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  className="w-full p-2 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmNewPassword"
                className="block text-cyan-600 mb-2"
              >
                Confirm New Password
              </label>
              <div className="flex items-center border rounded">
                <FaLock className="text-gray-400 ml-2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  className="w-full p-2 outline-none"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <button
              type="submit"
              disabled={
                !userId &&
                !currentPassword &&
                !newPassword &&
                !confirmNewPassword
              }
              className={`w-full text-white p-2 rounded flex items-center justify-center ${
                !userId &&
                !currentPassword &&
                !newPassword &&
                !confirmNewPassword
                  ? "bg-gray-400 hover:bg-gray-400"
                  : "bg-cyan-700 hover:bg-cyan-600"
              }`}
            >
              <FaLock className="mr-2" /> Change Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;

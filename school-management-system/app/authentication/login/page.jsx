"use client";

import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" || session) {
      router.push("/");
    }
    setIsLoading(false);
  }, [status, session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setDisableBtn(true);
    // console.log("user log in data", email, password);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(`Invalid email or password ${result.error}`);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setDisableBtn(false);
    }
  };

  // Show loading state until we know the session status
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen h-full flex items-center justify-center bg-gray-100 w-full">
        <div className="text-cyan-700">Loading...</div>
      </div>
    );
  }

  // Only render the form if we're not authenticated
  return (
    <div className="min-h-screen h-full flex items-center justify-center bg-gray-100 w-full">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-cyan-800">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700 text-center">
          Dork School Management System
        </h1>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-cyan-600 mb-2">
              username/email
            </label>
            <div className="flex items-center border rounded">
              <FaUser className="text-gray-400 ml-2" />
              <input
                type="text"
                id="email"
                className="w-full p-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-cyan-600 mb-2">
              Password
            </label>
            <div className="flex items-center border rounded">
              <FaLock className="text-gray-400 ml-2" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full p-2 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={disableBtn}
            className={`w-full text-white p-2 rounded flex items-center justify-center ${
              disableBtn
                ? "bg-gray-300 hover:bg-gray-300"
                : "bg-cyan-700 hover:bg-cyan-600"
            }`}
          >
            <FaSignInAlt className="mr-2" /> Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

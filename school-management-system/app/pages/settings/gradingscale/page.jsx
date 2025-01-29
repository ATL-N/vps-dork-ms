// pages/dashboard/settings/grading-scale.js
"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CustomTable from "../../../components/listtableForm";
import Addeditgradescheme from "../../grading/addgradescheme/addgradingscheme";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";
import { useSession } from "next-auth/react";
import Modal from "../../../components/modal/modal";
import DeleteUser from "../../../components/deleteuser";
import { toast } from "react-toastify";

const GradingScaleSettings = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(null);
  const [isDeleteAuthorised, setIsDeleteAuthorised] = useState(false);
  const [error, setError] = useState(null);
    const authorizedPermissions = ["add grading scheme", 'delete grading scheme'];

  const [gradingScales, setGradingScales] = useState([]);
  const [newGrade, setNewGrade] = useState({
    letter: "",
    minScore: "",
    maxScore: "",
  });

  const gradingSchemeHeaderNames = [
    "ID",
    "Grade Name",
    "Max Mark",
    "Min Mark",
    "Remark",
  ];

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);
      fetchAnalytics(activeSemester);
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["delete grading scheme"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin"
    ) {
      setIsDeleteAuthorised(true);
    } else {
      setIsDeleteAuthorised(false);
    }
  }, [session]);

  useEffect(() => {
    // Fetch grading scales from API
    // Replace with actual API call
    const fetchedScales = [
      { id: 1, letter: "A", minScore: 90, maxScore: 100 },
      { id: 2, letter: "B", minScore: 80, maxScore: 89 },
      { id: 3, letter: "C", minScore: 70, maxScore: 79 },
      { id: 4, letter: "D", minScore: 60, maxScore: 69 },
      { id: 5, letter: "F", minScore: 0, maxScore: 59 },
    ];
    // setGradingScales(fetchedScales);
  }, []);

  const fetchAnalytics = async (semester_id) => {
    // setIsLoading(true);
    setError(null);
    try {
      const data = await fetchData(
        `/api/grading/semesteranalytics/${semester_id}`,
        "",
        false
      );
      // console.log("analytics", data);
      if (data && Object.keys(data).length > 0) {
        // console.log("analytics222", data);

        setAnalytics(data?.gradeAnalytics);
        setGradingScales(data?.gradeAnalytics?.gradingScheme);
      } else {
        setError("No data available for this semester.");
      }
    } catch (err) {
      setError("Failed to fetch analytics data. Please try again later.");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGradingScheme = () => {
    setModalContent(
      <div>
        <Addeditgradescheme
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };
  const handleGradeEdit = (scheme_id) => {
    setModalContent(
      <div>
        <Addeditgradescheme
          id={scheme_id}
          onCancel={() => {
            setShowModal(false);
            fetchAnalytics(activeSem);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleDeleteScheme = async (scheme_id) => {
    if (!isDeleteAuthorised) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised 'delete grading scheme' to perform this action
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={scheme_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing...");

                const eventData = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/grading/deletegradingscheme/${scheme_id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(eventData),
                    }
                  );

                  if (!response.ok) {
                    // throw new Error(
                    //   id ? "Failed to delete event" : "Failed to add event"
                    // );

                    toast.update(toastId2, {
                      render: "Failed to delete scheme!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                  }

                  // Add API call to delete event
                  await fetchAnalytics(activeSem);
                  // toast.success("event deleted successfully...");
                  toast.update(toastId2, {
                    render: "Scheme deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setShowModal(false);
                  // alert("event deleted successfully!");
                } catch (error) {
                  console.error("Error deleting scheme:", error);
                  // toast.error("An error occurred. Please try again.");
                  toast.update(toastId2, {
                    render: "An error occurred. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                  });

                  // alert("An error occurred. Please try again.");
                }
              }}
            />
          </div>
        );
      } catch (error) {
        console.log(error);
      } finally {
        setShowModal(true);
        setIsLoading(false);
      }
    }
  };

  const handleNewGradeChange = (e) => {
    const { name, value } = e.target;
    setNewGrade((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGrade = () => {
    // Add new grade to API
    const newId = gradingScales.length + 1;
    setGradingScales((prev) => [
      ...prev,
      {
        id: newId,
        ...newGrade,
        minScore: Number(newGrade.minScore),
        maxScore: Number(newGrade.maxScore),
      },
    ]);
    setNewGrade({ letter: "", minScore: "", maxScore: "" });
  };

  const handleDeleteGrade = (id) => {
    // Delete grade from API
    setGradingScales((prev) => prev.filter((grade) => grade.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit updated grading scales to API
    // console.log("Submitting grading scales:", gradingScales);
    // Add API call here
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Grading Scale Settings
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Current Grading Scale
          </h2>
          {(session?.user?.role === "admin" ||
            session?.user?.role === "head teacher") && (
            <button
              onClick={handleAddGradingScheme}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Grading Scheme
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <CustomTable
              data={gradingScales}
              headerNames={gradingSchemeHeaderNames}
              maxTableHeight="40vh"
              height="20vh"
              handleDelete={handleDeleteScheme}
              handleEdit={handleGradeEdit}
              searchTerm={""}
              displayActions={
                session?.user?.permissions?.some((permission) =>
                  authorizedPermissions.includes(permission)
                ) || session?.user?.role === "admin"
              }
              displayEvaluationBtn={false}
              displaySearchBar={false}
              displayDetailsBtn={false}
              displayEditBtn={
                session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "add grading scheme"
                )
              }
              displayDelBtn={
                session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "delete grading scheme"
                )
              }
              editTitle="Edit schemme  "
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-cyan-700">
              Grading Scale Visualization
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={gradingScales}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="minMark" fill="#8884d8" name="Min Score" />
                <Bar dataKey="maxMark" fill="#82ca9d" name="Max Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </form>
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            fetchAnalytics(activeSem);
          }}
        >
          {modalContent}
        </Modal>
      )}
    </div>
  );
};

export default GradingScaleSettings;

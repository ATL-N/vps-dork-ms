// pages/dashboard/classes/index.js
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaCalendarAlt,
  FaUserFriends,
} from "react-icons/fa";
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
import DeleteUser from "../../components/deleteuser";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import ClassDetailsPage1 from "./details/classdetails";
import CustomTable from "../../components/listtableForm";
import Addnewclass from "./add/addclass";
import { useSession } from "next-auth/react";
import { fetchData } from "../../config/configFile";
import LoadingPage from "../../components/generalLoadingpage";
import { useRouter } from "next/navigation";

const ClassManagement = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [classesData, setClassesData] = useState([]);
  const [classStats, setClassStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(false);
  const authorizedPermissions2 = ["add class"];

  function extractEvaluationData(data) {
    return data?.map((item) => {
      return {
        id: item.class_id,
        class_name: item.class_name,
        room_number: item.room_name,
        class_level: item.class_level,
        student_count: item.student_count,
        capacity: item.capacity,
      };
    });
  }

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view classes"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session]);

  const headerNames = [
    "id",
    "Class Name",
    "Room Name",
    "Level",
    "No. of Pupils",
    "Capacity",
  ];

  useEffect(() => {
    fetchClasses();
    // fetchTeachers();
  }, []);

  const fetchClasses = async (searchQuery1 = "") => {
    try {
      setIsLoading(true);
      setError(null);

      let url = "/api/classes/all";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      setClassesData(data);

      return;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchClasses(e.target.value);
  };

  const handleAddClass = async () => {
    try {
      const [staffData] = await Promise.all([fetchData("/api/staff/all", "")]);

      setModalContent(
        <div>
          <Addnewclass
            staffData={staffData}
            onCancel={() => {
              setShowModal(false);
            }}
          />
        </div>
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      setShowModal(true);
    }
  };

  const handleEditClass = async (classId) => {
    try {
      const [classdata, staffdata] = await Promise.all([
        fetchData(`/api/classes/getclassbyId/${classId}`, "", false),
        fetchData("/api/staff/all", "", true),
        // fetchClassById(classId),
        // fetchTeachers(),
      ]);

      setModalContent(
        <Addnewclass
          id={classId}
          classData={classdata}
          staffData={staffdata}
          setShowModal={setShowModal}
          onCancel={() => {
            setShowModal(false);
            fetchClasses();
          }}
        />
      );
    } catch (err) {
      console.log("Error fetching teacher data:", error);
    } finally {
      setShowModal(true);
    }
  };

  const handleClassDetails = async (classId) => {
    try {
      const classdata = await fetchData(
        `/api/classes/getclassbyId/${classId}`,
        "",
        false
      );
      const staffdata = await fetchData(
        `/api/staff/staffdetails/${classdata?.staff_id}`,
        "",
        true
      );
      // const staffdata = await fetchTeacherById(classdata?.staff_id);

      setModalContent(
        <ClassDetailsPage1
          classId={classId}
          classData={classdata}
          staffData={staffdata}
          setShowModal={setShowModal}
          showBtns={false}
        />
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      setShowModal(true);
    }
  };

  const handleDeleteClass = async (class_id) => {
    if (
      !(session?.user?.role === "admin" ||
      session?.user?.permissions?.some(
        (permission) => permission === "delete class"
      ))
    ) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised "delete class" to perform this action
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={class_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing your request...");

                const classData = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/classes/deleteClass/${class_id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(classData),
                    }
                  );

                  const result = await response.json();

                  if (!response.ok) {
                    // throw new Error(
                    //   id ? "Failed to delete class" : "Failed to add class"
                    // );

                    toast.update(toastId2, {
                      render: result?.error || "Failed to delete class!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }

                  // Add API call to delete class
                  await fetchClasses();
                  // toast.success("class deleted successfully...");
                  toast.update(toastId2, {
                    render: "class deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setShowModal(false);
                  // alert("class deleted successfully!");
                } catch (error) {
                  console.error("Error deleting class:", error);
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

  const handleOpenLink = (classId) => {
    console.log("class id", classId);

    setModalContent(
      <div>
        <LoadingPage />
      </div>
    );
    setShowModal(true);

    router.push(`/pages/classes/details/${classId}`);

    setShowModal(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "view classes" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Class Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaChalkboardTeacher />}
            title="No. of Classes"
            value={classesData?.overall_statistics?.total_classes || 0}
          />
          <StatCard
            icon={<FaUserFriends />}
            title="Total Students"
            value={classesData?.overall_statistics?.total_students || 0}
          />
          <StatCard
            icon={<FaChalkboardTeacher />}
            title="Subjects"
            value={classesData?.overall_statistics?.total_subjects || 0}
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="Overall Average Score"
            value={`${
              classesData?.overall_statistics?.overall_avg_score?.toFixed(2) ||
              0
            }%`}
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">Class List</h2>
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some((permission) =>
                authorizedPermissions2.includes(permission)
              ) ||
              session?.user?.role === "head teacher") && (
              <div className="flex">
                <button
                  onClick={handleAddClass}
                  className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
                >
                  <FaPlus className="mr-2" /> Create New Class
                </button>
              </div>
            )}
          </div>
          {/* {classesData?.classes?.length > 0 ? ( */}
          <div className="overflow-x-auto tableWrap">
            <CustomTable
              data={extractEvaluationData(classesData?.classes)}
              headerNames={headerNames}
              maxTableHeight="40vh"
              height="20vh"
              handleDelete={handleDeleteClass}
              handleEdit={handleEditClass}
              handleDetails={handleClassDetails}
              handleSearch={handleSearchInputChange}
              searchTerm={searchQuery}
              searchPlaceholder="Search by class name, room, or level"
              displayLinkBtn={
                // session?.user?.role === "admin" ||
                // session?.user?.role === "head teacher" ||
                // session?.user?.role === "teaching staff" ||
                // session?.user?.role === "student"
                true
              }
              displayDelBtn={
                session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "delete class"
                )
              }
              displaySearchBar={false}
              // displayActions={
              //   session?.user?.role === "admin" ||
              //   session?.user?.role === "head teacher"
              // }
              itemDetails="class id."
              handleOpenLink={handleOpenLink}
              displayEditBtn={
                session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "add class"
                )
              }
            />
          </div>
          {/* ) 
          : (
            <LoadingPage />
          )
          } */}
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Subjects by class
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classesData?.classes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="unique_subjects" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Class average score
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classesData?.classes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Class average Attendance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classesData?.classes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance_percentage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default ClassManagement;

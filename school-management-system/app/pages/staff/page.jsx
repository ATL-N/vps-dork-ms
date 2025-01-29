// pages/dashboard/teachers/index.js
"use client";

import React, { useState, useEffect } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

import {
  FaUserTie,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaCalendarAlt,
  FaChartLine,
  FaClipboardList,
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
import TeacherProfilePage from "../../components/staffcomponent/teacherprofile";
import CustomTable from "../../components/listtableForm";
import Addnewstaff from "./addnewstaff/addstaff";
import TeacherEvaluation from "./evaluation/staffevaluation";
import Loadingpage from "../../components/Loadingpage";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const TeacherManagement = () => {
  const { data: session, status } = useSession();

  // const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [staff, setStaff] = useState([]);
  const [teacherStats, setTeacherStats] = useState([]);
  const [error, setError] = useState("");
  const [staffData, setStaffData] = useState([]);
  const [staffEvalData, setStaffEvalData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view staff"];

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

  // let staffData;

  const headerNames = [
    "id",
    "Name",
    "Gender",
    "Phone",
    "Email",
    "Role",
    // "Staff ID",
  ];

  useEffect(() => {
    // toast.success("loading teachers");
    fetchTeachers();
    // fetchTeacherStats();
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchTeachers(searchQuery);
  };

  const fetchTeachers = async (searchQuery1 = "") => {
    // const toastId = toast.loading("Fetching staff...");

    try {
      setIsLoading(true);
      setError(null);

      let url = "/api/staff/staffdetails";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }

      const data = await response.json();
      // console.log('data', data?.staff)
      function extractData(data) {
        return data.map((staff) => ({
          id: staff.id,
          name: staff.name,
          gender: staff.gender,
          phone_number: staff.phone_number,
          email: staff.email,
          role: staff.role,
        }));
      }

      setStaff(extractData(data?.staff));
      setStaffData(data);

      if (searchQuery1.trim() !== "" && data.length === 0) {
        console.log("No staff found matching your search.");
        // toast.update(toastId, {
        //   render: "No staff found matching your search.",
        //   type: "info",
        //   isLoading: false,
        //   autoClose: 3000,
        // });
      } else {
        console.log("");
        // toast.update(toastId, {
        //   render: `Successfully fetched ${data.length} teacher(s)`,
        //   type: "success",
        //   isLoading: false,
        //   autoClose: 3000,
        // });
      }

      return data;
    } catch (err) {
      // setError(err.message);
      // // toast.update(toastId, {
      // //   render: `Error: ${err.message}`,
      // //   type: "error",
      // //   isLoading: false,
      // //   autoClose: 3000,
      // // });
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeacher = () => {
    setModalContent(<Addnewstaff setShowModal={setShowModal} />);
    setShowModal(true);
  };

  const handleEditTeacher = async (teacher_id) => {
    // setIsLoading(true);
    try {
      const [staffdata] = await Promise.all([
        fetchData(`/api/staff/staffdetails/${teacher_id}`, "", true),
      ]);
      setModalContent(
        <div>
          <Addnewstaff
            id={teacher_id}
            staffData={staffdata}
            onCancel={() => {
              setShowModal(false);
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
  };

  const handleTeacherEvaluation = async (teacher_id) => {
    // setIsLoading(true);
    try {
      const [staffdata, pastEvaluation] = await Promise.all([
        fetchData(`/api/staff/staffdetails/${teacher_id}`, "", false),
        fetchData(`/api/staff/evaluation/${teacher_id}`, "", true),
      ]);

      if (pastEvaluation === null) {
        // setStaffData(data);
        setModalContent(
          <TeacherEvaluation
            staff_id={teacher_id}
            onCancel={() => setShowModal(false)}
            staffData={staffdata}
          />
        );
      } else {
        setModalContent(
          <TeacherEvaluation
            staff_id={teacher_id}
            onCancel={() => setShowModal(false)}
            staffData={staffdata}
            pastEvaluation={pastEvaluation}
          />
        );
      }
      setShowModal(true);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const handleTeacherProfile = async (teacher_id) => {
    // setIsLoading(true);
    let imagePreview;
    try {
      const [staffdata] = await Promise.all([
        fetchData(`/api/staff/staffdetails/${teacher_id}`, "", true),
      ]);
      console.log("done loading staffdata", staffdata, staffdata?.photo);

      setModalContent(
        <TeacherProfilePage
          staff_id={teacher_id}
          onClose={() => setShowModal(false)}
          staffData={staffdata}
          imagePreview={imagePreview}
        />
      );

      setShowModal(true);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const handleDeleteStaff = async (staff_id) => {
    if (
      !(
        session?.user?.role === "admin" ||
        session?.user?.permissions?.some(
          (permission) => permission === "delete staff"
        )
      )
    ) {
      return (
        <div className="flex items-center">
          You are not authorised "delete staff" to be on this page
        </div>
      );
    }
    try {
      // console.log("handleDeletestaff", staff_id);
      setIsLoading(true);
      setModalContent(
        <div>
          <DeleteUser
            userData={staff_id}
            onClose={() => setShowModal(false)}
            onDelete={async () => {
              const toastId2 = toast.loading("Processing your request...");

              try {
                const response = await fetch(
                  `/api/staff/deleteStaff/${staff_id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    // body: JSON.stringify(staffData),
                  }
                );

                if (!response.ok) {
                  // throw new Error(
                  //   id ? "Failed to delete staff" : "Failed to add staff"
                  // );

                  toast.update(toastId2, {
                    render: "Failed to delete staff!!.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                  });
                }

                // Add API call to delete staff
                console.log("Deleting staff...", staff_id);
                await fetchTeachers();
                // toast.success("Staff deleted successfully...");
                toast.update(toastId2, {
                  render: "Staff deleted successfully...",
                  type: "success",
                  isLoading: false,
                  autoClose: 2000,
                });
                setShowModal(false);
                // alert("staff deleted successfully!");
              } catch (error) {
                console.error("Error deleting staff:", error);
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
  };

  if (status === "loading" || isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "view staff" to be on this page
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Staff Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaUserTie />}
            title="Total Teachers"
            value={staffData?.staff?.length}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Total Male"
            value={staffData?.stats?.male_count}
          />
          <StatCard
            icon={<FaUserTie />}
            title="Total Female"
            value={staffData?.stats?.female_count}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Total salaries"
            value={`GHC ${staffData?.stats?.total_salary || 0}`}
          />
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Teacher List
            </h2>
            <div className="flex">
              {(session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "add staff"
                )) && (
                <button
                  onClick={handleAddTeacher}
                  className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
                >
                  <FaPlus className="mr-2" /> Add New Teacher
                </button>
              )}
            </div>
          </div>

          {/* the table details */}
          <div className="overflow-x-auto tableWrap ">
            {staffData?.staff ? (
              <CustomTable
                data={staff}
                headerNames={headerNames}
                maxTableHeight="40vh"
                height="20vh"
                handleDelete={handleDeleteStaff}
                handleEdit={handleEditTeacher}
                handleDetails={handleTeacherProfile}
                handleSearch={handleSearchInputChange}
                handleEvaluation={handleTeacherEvaluation}
                displayEvaluationBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "evaluate staff"
                  )
                }
                searchTerm={searchQuery}
                searchPlaceholder="type here to search by name, email, role or employee id  "
                displayActions={
                  session?.user?.role === "admin" ||
                  session?.user?.role === "head teacher"
                }
                displayEditBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "add staff"
                  )
                }
                displayDelBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "delete staff"
                  )
                }
              />
            ) : (
              <Loadingpage />
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Teachers by Department
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staffData?.stats?.departmentBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="staff_count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => {setShowModal(false); fetchTeachers();}}>{modalContent}</Modal>
      )}
    </>
  );
};

export default TeacherManagement;

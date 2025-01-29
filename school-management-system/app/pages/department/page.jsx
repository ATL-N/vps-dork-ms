"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaUserTie,
  FaUsers,
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
import DepartmentDetailsPage from "./details/details";
import CustomTable from "../../components/listtableForm";
import AddNewDepartment from "./add/adddepartment";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const DepartmentManagement = () => {
    const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
const [isAuthorised, setIsAuthorised] = useState(true);
const [activeSemester, setActiveSemester] = useState();

  function extractDepartmentData(data) {
    return data.map((item) => {
      return {
        id: item.department_id,
        department_name: item.department_name,
        head_of_department: item.head_of_department,
        number_of_staff: item.number_of_staff,
      };
    });
  }

  const headerNames = [
    "id",
    "Department Name",
    "Head of Department",
    "Number of Staff",
  ];

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["view departments"];

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

  if (
    status === "authenticated" &&
    session?.user?.activeSemester?.semester_id
  ) {
    setActiveSemester(session?.user?.activeSemester?.semester_id);
    // setUserId(session?.user?.id);
  }
}, [session, status]);

  useEffect(() => {
    fetchDepartments();
    fetchDepartmentStats();
  }, []);

  const fetchDepartments = async (searchQuery1 = "") => {
    const toastId = toast.loading("Fetching departments...");

    try {
      setIsLoading(true);
      setError(null);

      let url = "/api/departments/addDepartmentAPI";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await response.json();
      setDepartments(data);

      if (searchQuery1.trim() !== "" && data.length === 0) {
        setError("No departments found matching your search.");
        toast.update(toastId, {
          render: "No departments found matching your search.",
          type: "info",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: `Successfully fetched ${data.length} department(s)`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      return data;
    } catch (err) {
      setError(err.message);
      toast.update(toastId, {
        render: `Error: ${err.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const response = await fetch("/api/department-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch department statistics");
      }
      const data = await response.json();
      setDepartmentStats(data);
    } catch (err) {
      console.error("Error fetching department statistics:", err);
      toast.error("Failed to fetch department statistics");
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchDepartments(e.target.value);
  };

  const handleAddDepartment = () => {
    setModalContent(
      <AddNewDepartment
        setShowModal={setShowModal}
        onCancel={() => {
          setShowModal(false);
          fetchDepartments();
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditDepartment = async (departmentId) => {
    try {
      const departmentData = await fetchDepartmentById(departmentId);
      setModalContent(
        <AddNewDepartment
          id={departmentId}
          departmentData={departmentData}
          setShowModal={setShowModal}
          onCancel={() => {
            setShowModal(false);
            fetchDepartments();
          }}
        />
      );
    } catch (err) {
      console.log("Error fetching department data:", error);
    } finally {
      setShowModal(true);
    }
  };

  const handleDepartmentDetails = async (departmentId) => {
    try {
      const departmentData = await fetchDepartmentById(departmentId);
      setModalContent(
        <DepartmentDetailsPage
          departmentId={departmentId}
          departmentData={departmentData}
          setShowModal={setShowModal}
          showBtns={false}
        />
      );
    } catch (err) {
      console.log("Error fetching department data:", err);
    } finally {
      setShowModal(true);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      const data = await fetchDepartmentById(departmentId);
      setModalContent(
        <DeleteUser
          userData={data.department_name}
          onClose={() => setShowModal(false)}
          onDelete={async () => {
            try {
              const response = await fetch(
                `/api/departments/delete/${departmentId}`,
                {
                  method: "PUT",
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Failed to delete department");
              }

              toast.success(data.message || "Department deleted successfully");
              fetchDepartments();
              fetchDepartmentStats();
              setShowModal(false);
            } catch (err) {
              console.error("Error deleting department:", err);
              toast.error(err.message || "Failed to delete department");
            }
          }}
        />
      );
    } catch (err) {
      console.log("Error fetching department data:", error);
    } finally {
      setShowModal(true);
    }
  };

  if (isLoading)
    return (
      <div>
        <LoadingPage />
      </div>
    );

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised to be on this page...!
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

      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Department Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<FaBuilding />}
            title="Total Departments"
            value={departments.length}
          />
          <StatCard
            icon={<FaUserTie />}
            title="Total HODs"
            value={departments.filter((d) => d.head_of_department).length}
          />
          <StatCard
            icon={<FaUsers />}
            title="Total Staff"
            value={departments.reduce((sum, d) => sum + d.number_of_staff, 0)}
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Department List
            </h2>
            <div className="flex">
              <button
                onClick={handleAddDepartment}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
              >
                <FaPlus className="mr-2" /> Create New Department
              </button>
            </div>
          </div>
          <div className="overflow-x-auto tableWrap">
            <CustomTable
              data={extractDepartmentData(departments)}
              headerNames={headerNames}
              maxTableHeight="40vh"
              height="20vh"
              handleDelete={handleDeleteDepartment}
              handleEdit={handleEditDepartment}
              handleDetails={handleDepartmentDetails}
              handleSearch={handleSearchInputChange}
              searchTerm={searchQuery}
              searchPlaceholder="Search by department name or HOD"
              displayLinkBtn={false}
              itemDetails="department id."
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Staff Distribution by Department
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="number_of_staff" fill="#8884d8" />
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

export default DepartmentManagement;

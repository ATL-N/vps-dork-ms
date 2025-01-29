"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import CustomTable from "../../../components/listtableForm";

const TeachersListPage = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(10);

  const headerNames = [
    "id",
    "Name",
    "Gender",
    "Phone",
    "Subject",
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const data = await response.json();
      setTeachers(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        const response = await fetch(`/api/staff/${teacherId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete teacher");
        }
        fetchTeachers(); // Refresh the list after deletion
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEditClick = (id) => {
    // Handle edit logic for teacher with id
    console.log(`Edit teacher ${id}`);
  };

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.first_name} ${teacher.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 relative min-w-[30vw] w-[80vw] h-[80vh] rounded-md bg-white shadow-md overflow-hidden">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold text-cyan-700">Staff List</h1>
        <Link href="/pages/teachers/addnewteacher" passHref>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaPlus className="mr-2" /> Add Staff
          </button>
        </Link>
      </div>

      <CustomTable
        data={teachers}
        headerNames={headerNames}
        handleDeleteStudent={handleDeleteTeacher}
        maxTableHeight="40vh"
        height="20vh"
        handleDelete={handleDeleteTeacher}
        handleEdit={handleEditClick}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
      />
    </div>
  );
};

export default TeachersListPage;

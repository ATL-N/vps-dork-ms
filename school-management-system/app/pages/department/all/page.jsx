"use client";
// pages/departments/index.js

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
// import CustomTable from "@/app/components/tableForm";
import CustomTable from "../../../components/listtableForm";

const StudentListPage = () => {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);

  const departmentData = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone: "+9876543210",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 3,
      first_name: "Alice",
      last_name: "Johnson",
      email: "alice.johnson@example.com",
      phone: "+1112223333",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 4,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 5,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 3,
      first_name: "Alice",
      last_name: "Johnson",
      email: "alice.johnson@example.com",
      phone: "+1112223333",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 4,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 3,
      first_name: "Alice",
      last_name: "Johnson",
      email: "alice.johnson@example.com",
      phone: "+1112223333",
      image_details: "img", // Replace with actual image URL
    },
    {
      id: 4,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      image_details: "img", // Replace with actual image URL
    },
  ];

  const headerNames = [
    "id",
    "first_name",
    "last_name",
    "email",
    "phone",
    "image_details",
  ];

  const filteredStudentdata = departmentData.map((student) => ({
    name: `${student.first_name} ${student.last_name}`,
    email: student.email,
    tel: student.phone,
  }));

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDepartments(departmentData);
      setIsLoading(false);
    }, 1000); // Simulate loading time
  }, []);

  //   useEffect(() => {
  //     fetchStudents();
  //   }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDepartments(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`/api/departments/${studentId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete student");
        }
        fetchStudents(); // Refresh the list after deletion
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
    // Handle edit logic for student with id
    console.log(`Edit student ${id}`);
  };

  // Filter departments based on search term
  const filteredStudents = departments.filter((student) =>
    `${student.first_name} ${student.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 relative min-w-[30vw] w-[80vw] h-[80vh] rounded-md bg-white  shadow-md overflow-hidden">
      <div className="flex justify-between items-center my-6 ">
        <h1 className="text-3xl font-bold text-cyan-700">Student List</h1>
        <Link href="/pages/departments/addnewstudent" passHref>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaPlus className="mr-2" /> Add Student
          </button>
        </Link>
      </div>

      {/* <div className="p-4   overflow-hidden h-[60vh] "> */}
      <CustomTable
        data={departmentData}
        headerNames={headerNames}
        handleDeleteStudent={handleDeleteStudent}
        maxTableHeight="40vh"
        height="20vh"
        handleDelete={handleDeleteStudent}
        handleEdit={handleEditClick}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
      />
      {/* </div> */}
    </div>
  );
};

export default StudentListPage;

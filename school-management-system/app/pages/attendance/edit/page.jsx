"use client";
import React, { useState, useEffect } from "react";
import {
  FaUserCheck,
  FaCalendarAlt,
  FaSave,
  FaUndo,
  FaSearch,
} from "react-icons/fa";

import AttendanceForm from "../../../components/attendancecomponent/attendanceform";

const dummyStudents = [
  { id: "student1", name: "John Doe", studentId: "S001", classId: "class1" },
  {
    id: "student2",
    name: "Jane Smith",
    studentId: "S002",
    classId: "class1",
  },
  {
    id: "student3",
    name: "Bob Johnson",
    studentId: "S003",
    classId: "class1",
  },
  {
    id: "student4",
    name: "Alice Brown",
    studentId: "S004",
    classId: "class2",
  },
  {
    id: "student5",
    name: "Charlie Davis",
    studentId: "S005",
    classId: "class2",
  },
  {
    id: "student6",
    name: "Eva Wilson",
    studentId: "S006",
    classId: "class3",
  },
];

const sampleInitialAttendance = {
  student1: "present",
  student2: "absent",
  student3: "late",
  student4: "present",
  student5: "present",
  student6: "absent",
};

  const dummyGetAttendance = async (classId, date) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      student1: "present",
      student2: "absent",
      student3: "late",
    };
  };

  const dummyUpdateAttendance = async (classId, date, attendance) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updating attendance:", { classId, date, attendance });
    return true;
  };


const EditAttendance = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
    const today = new Date().toISOString().slice(0, 10); 


  const fetchAttendance = async () => {
    if (selectedClass && selectedDate) {
      setLoading(true);
      try {
        const data = await getAttendance(selectedClass, selectedDate);
        setAttendance(data);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      }
      setLoading(false);
    }
  };



    const dummyClasses = [
      { id: "class1", name: "Class 1A" },
      { id: "class2", name: "Class 2B" },
      { id: "class3", name: "Class 3C" },
    ];

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, selectedDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

const handleUpdateAttendance = (updatedAttendance) => {
  console.log("Updating attendance:", updatedAttendance);
  // Here you would typically make an API call to update the attendance
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAttendance(selectedClass, selectedDate, attendance);
      alert("Attendance updated successfully!");
    } catch (error) {
      console.error("Failed to update attendance:", error);
      alert("Failed to update attendance. Please try again.");
    }
  };

  const handleReset = () => {
    fetchAttendance();
  };

  return (
    <AttendanceForm
      students={dummyStudents}
      classes={dummyClasses}
      initialAttendance={sampleInitialAttendance}
      onSubmit={handleUpdateAttendance}
      mode="edit"
      selectedclass={"class1"}
      selecteddate={today}
      onSearch={fetchAttendance}
    />
  );
};

export default EditAttendance;

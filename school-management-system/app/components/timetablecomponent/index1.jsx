// pages/timetable/index.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { SelectField } from "../inputFieldSelectField";
import TimetableManager from "../../pages/timetable/addtimetable/addtimetable";
import TimetableViewer from "../../pages/timetable/viewclassTimetable/viewtimtable";
import { fetchData } from "../../config/configFile";
import Modal from "../../components/modal/modal";

const TimetableIndex = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleAddTimetable = async () => {
    // setIsLoading(true);

    try {
      const [classData, staffData, subjectsData, semesterData] =
        await Promise.all([
          fetchData("/api/classes/all", "classes", false),
          fetchData("/api/staff/all", "staff details", false),
          fetchData("/api/subjects/allsubjects", "subject details", false),
          fetchData("/api/semester/all", "semester", true),
        ]);

      setModalContent(
        <div>
          <TimetableManager
            staffData={staffData}
            classesData={classData?.classes}
            subjectsData={subjectsData}
            semesterData={semesterData}
            onCancel={() => {
              setShowModal(false);
            }}
          />
        </div>
      );
    } catch (err) {
      console.log("Error fetching data:", err);
    } finally {
      setShowModal(true);
      // setIsLoading(false);
    }
  };

  const handleViewClassTimetable = async () => {
    try {
      const [classData, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "timetable", false),
        fetchData("/api/semester/all", "semester", true),
      ]);

      setModalContent(
        <div>
          <TimetableViewer
            classesData={classData?.classes}
            semesterData={semesterdata}
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

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-700 mb-8 text-center">
          Timetable Management
        </h1>

        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleAddTimetable}
              className="flex items-center justify-center p-6 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Timetable Entry
            </button>
            <button
              onClick={handleViewClassTimetable}
              className="flex items-center justify-center p-6 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FaCalendarAlt className="mr-2" />
              View All Timetables
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default TimetableIndex;

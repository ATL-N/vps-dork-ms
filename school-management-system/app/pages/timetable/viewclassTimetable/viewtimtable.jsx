"use client";
import React, { useState, useEffect } from "react";
import DisplayTimetable from "../../../components/timetablecomponent/ClassTimetableView"; // Adjust the import path as needed
import { fetchData } from "../../../config/configFile";
import { toast } from "react-toastify";

// Assuming fetchData is imported or defined in this file
// import { fetchData } from "./utils"; // Adjust the import path as needed

const TimetableViewer = ({
  classesData,
  semesterData,
  classId,
  semesterId,
  displayPrintBtn=true,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classId || "");
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    semesterId || ""
  );
  const [timetable, setTimetable] = useState({});
  const [periods, setPeriods] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId && semesterId) {
      
      fetchTimetableData(classId, semesterId);
    }
  }, []);

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    if (classId && selectedSemesterId) {
      await fetchTimetableData(classId, selectedSemesterId);
    } else {
      // Reset timetable data when no class is selected
      setTimetable({});
      setPeriods([]);
      setDaysOfWeek([]);
    }
  };

  const handleSemesterChange = async (e) => {
    const semester_id = e.target.value;
    setSelectedSemesterId(semester_id);
    if (selectedClassId && semester_id) {
      await fetchTimetableData(selectedClassId, semester_id);
    } else {
      // Reset timetable data when no class is selected
      setTimetable({});
      setPeriods([]);
      setDaysOfWeek([]);
    }
  };

  const fetchTimetableData = async (classId, semester_id) => {
    setLoading(true);
    const url = `/api/timetable/getclasstimetable/${classId}/${semester_id}`;
    const data = await fetchData(url, "timetable", false);

    if (data) {
      setTimetable(data.timetable);
      setPeriods(data.periods);
      setDaysOfWeek(data.daysOfWeek);
      setLoading(false);
    } else {
      setError("Failed to load timetable. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <DisplayTimetable
        classesData={classesData}
        semesterData={semesterData}
        selectedClassId={selectedClassId}
        selectedSemesterId={selectedSemesterId}
        timetable={timetable}
        periods={periods}
        daysOfWeek={daysOfWeek}
        handleClassChange={handleClassChange}
        handleSemesterChange={handleSemesterChange}
        displayPrintBtn={displayPrintBtn}
      />
    </div>
  );
};

export default TimetableViewer;

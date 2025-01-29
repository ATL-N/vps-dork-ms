"use client";
import React, { useState, useEffect } from "react";
import AttendanceForm from "../../../components/attendancecomponent/attendanceform";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";

const TakeAttendance = ({ id, attendanceData, class_id }) => {
  const { data: session, status } = useSession();

  const isWeekend = () => {
    const now = new Date();
    return now.getDay() === 0 || now.getDay() === 6;
  };

  const isBeforeNoon = () => {
    const now = new Date();
    return now.getHours() <= 12 && now.getHours() >= 7;
  };

  const isAttendanceAllowedState = () => {
    return !isWeekend() && isBeforeNoon();
  };

  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState("");
  const [activeSemester, setActiveSemester] = useState();
  const [userId, setUserId] = useState();
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [isAttendanceAllowed, setIsAttendanceAllowed] = useState(
    isAttendanceAllowedState
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(null);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["take attendance"];

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
      setUserId(session?.user?.id);
    }
  }, [session, status]);

  useEffect(() => {
    if (class_id) {
      setSelectedClass(class_id);
    }
    fetchClass();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedClass && date) {
      fetchExistingAttendance();
    }
  }, [selectedClass, date]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsAttendanceAllowed(isAttendanceAllowedState);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (id && attendanceData) {
      setSelectedClass(attendanceData.class_id);
      setDate(attendanceData.attendance_date);
      const initialAttendance = {};
      attendanceData.attendance.forEach((record) => {
        initialAttendance[record.student_id] = record.status;
      });
      setAttendance(initialAttendance);
      setOriginalData(initialAttendance);
    }
  }, [id, attendanceData]);

  const fetchExistingAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/attendance/getattendanceforclassanddate?class_id=${selectedClass}&attendance_date=${date}`
      );

      if (response.status === 404) {
        setExistingAttendance(null);
        setAttendance({});
        setOriginalData({});
        toast.info(
          "No existing attendance found for this date. You can proceed with taking attendance."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setExistingAttendance(data);

      const attendanceObject = {};
      data.attendance.forEach((record) => {
        attendanceObject[record.student_id] = record.status;
      });

      setAttendance(attendanceObject);
      setOriginalData(attendanceObject);

      toast.info(
        "Existing attendance found for this date. You can review and update if needed."
      );
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Error checking existing attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClass = async (searchQuery1 = "") => {
    try {
      setIsLoading(true);

      let url = "/api/classes/all";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();
      setClasses(data?.classes);

      if (searchQuery1.trim() !== "" && data.length === 0) {
        toast.info("No classes found matching your search.");
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (searchQuery1 = "") => {
    try {
      setIsLoading(true);

      let url = "/api/students/getstudents";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data);

      if (searchQuery1.trim() !== "" && data.length === 0) {
        toast.info("No students found matching your search.");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.keys(attendance).some(
      (studentId) => attendance[studentId] !== originalData[studentId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAttendanceAllowed && !id && !existingAttendance) {
      toast.error("Attendance can only be taken on weekdays before 12:00 PM.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      return;
    }

    const toastId = toast.loading(
      existingAttendance ? "Updating attendance..." : "Submitting attendance..."
    );
    setLoading(true);

    try {
      const response = await fetch("/api/attendance/takeattendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: selectedClass,
          attendance_date: date,
          attendance: Object.entries(attendance).map(([studentId, status]) => ({
            student_id: studentId,
            status,
          })),
          semester_id: activeSemester,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit attendance");
      }

      const result = await response.json();
      toast.update(toastId, {
        render: result.message,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setAttendance({});
        setSelectedClass("");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.update(toastId, {
        render: "Failed to submit attendance. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleReset = () => {
    setAttendance(id ? originalData : {});
    if (!id) {
      setSelectedClass("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  };

  if (isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "take attendance" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={existingAttendance ? "Update Attendance?" : "Submit Attendance?"}
        message={
          existingAttendance
            ? "Attendance has already been taken for this date. Are you sure you want to update it?"
            : "Are you sure you want to submit this attendance?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      {students && classes ? (
        <AttendanceForm
          students={students}
          classes={classes}
          onSubmit={handleSubmit}
          mode={existingAttendance ? "edit" : "take"}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedDate={date}
          setSelectedDate={setDate}
          attendance={attendance}
          handleAttendanceChange={handleAttendanceChange}
          handleReset={handleReset}
          isAttendanceAllowed={isAttendanceAllowed}
          loading={loading}
        />
      ) : (
        <div>No student and or class data in the database</div>
      )}
    </>
  );
};

export default TakeAttendance;

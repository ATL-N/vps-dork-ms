"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import EnterTimetable from "../../../components/timetablecomponent/AddTimetableEntryForm";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";

const TimetableManager = ({ id, classesData, subjectsData, semesterData, staffData }) => {
  const { data: session, status } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [timetable, setTimetable] = useState({});
  const [periods, setPeriods] = useState([
    { number: 1, startTime: "08:00", endTime: "09:00" },
  ]);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);


  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Assume these are fetched from an API or passed as props
  const [roomsData, setRooms] = useState([]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add timetable"];

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
  }, [session, status]);

    useEffect(() => {
      if (selectedClassId && selectedSemesterId) {
        fetchTimetableData(selectedClassId, selectedSemesterId);
      }
    }, [selectedClassId, selectedSemesterId]);

  const fetchTimetableData = async (classId, semester_id) => {
    setLoading(true);
    const url = `/api/timetable/getclasstimetable/${classId}/${semester_id}`;
    const data = await fetchData(url, "timetable", false);

    if (data?.periods?.length > 0) {
      console.log('data')
      setTimetable(data.timetable);
      setPeriods(data.periods);
      // // setDaysOfWeek(data.daysOfWeek);
      setLoading(false);
    } else {
      setError("Failed to load timetable. Please try again.");
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setTimetable({});
  };

  const handleTimetableChange = (day, period, field, value) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day]?.[period],
          [field]: value,
        },
      },
    }));
  };

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...periods];
    newPeriods[index][field] = value;
    setPeriods(newPeriods);
  };

  const addPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    setPeriods([
      ...periods,
      {
        number: lastPeriod.number + 1,
        startTime: lastPeriod.endTime,
        endTime: "",
      },
    ]);
  };

  const removePeriod = (index) => {
    if (periods.length > 1) {
      const newPeriods = periods.filter((_, i) => i !== index);
      setPeriods(newPeriods);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting timetable form data:", timetable, periods);

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  // const hasChanges = () => {
  //   return (
  //     Object.keys(formData).some((key) => {
  //       // Skip comparison for image_upload as it's handled separately
  //       if (key === "image_upload") return false;
  //       return formData[key] !== originalData[key];
  //     }) || imageUpload !== null
  //   );
  // };

  const handleConfirm = async (e) => {
    setIsModalOpen(false); // Close the modal
    const toastId = toast.loading("Adding timetable...");

    // if (id && !hasChanges()) {
    //   console.log("running hasChanges");
    //   setIsInfoModalOpen(true);
    //   toast.dismiss(toastId);
    //   return;
    // }

    try {
      const url = id ? `/api/classes/update/${id}` : "/api/timetable/add";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: selectedClassId,
          semesterId: selectedSemesterId,
          timetable: timetable,
          periods: periods,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error ||
          (id ? "Failed to update timetable" : "Failed to add timetable");
        throw new Error(errorMessage);
      }

      // Show success message
      toast.update(toastId, {
        render:
          result.message ||
          (id
            ? "timetable updated successfully"
            : "timetable added successfully"),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      // alert(result.message || "Timetable added successfully");

      // Reset the form or update the UI as needed
      if (!id) {
        resetTimetable();
      }
    } catch (error) {
      console.error("Error adding timetable:", error);
      toast.update(toastId, {
        render:
          error.message ||
          (id ? "Error updating timetable" : "Error adding timetable"),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      // alert(error.message || "Error adding timetable");
    }
  };

  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     // Here you would typically send the data to your backend
  //     console.log("Submitting timetable:", {
  //       selectedClassId,
  //       timetable,
  //       periods,
  //     });
  //   };

  const resetTimetable = () => {
    setTimetable({});
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemesterId(semesterId);
    setTimetable({});
  };

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add timetable" to be on this page
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        event_title={id ? "Update timetable?" : "Add New timetable?"}
        message={
          id
            ? `Are you sure you want to update timetable ?`
            : "Are you sure you want to add this new timetable?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        event_title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

{!loading ? 
      <EnterTimetable
        classesData={classesData}
        semesterData={semesterData}
        subjectsData={subjectsData}
        staffData={staffData}
        roomsData={roomsData}
        selectedClassId={selectedClassId}
        selectedSemesterId={selectedSemesterId}
        timetable={timetable}
        periods={periods}
        daysOfWeek={daysOfWeek}
        handleClassChange={handleClassChange}
        handleTimetableChange={handleTimetableChange}
        handlePeriodChange={handlePeriodChange}
        addPeriod={addPeriod}
        removePeriod={removePeriod}
        handleSubmit={handleSubmit}
        resetTimetable={resetTimetable}
        handleSemesterChange={handleSemesterChange}
      /> : <div>Loading...</div>
}
    </>
  );
};

export default TimetableManager;

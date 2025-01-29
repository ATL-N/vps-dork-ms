"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import UserHealthRecordAndIncidentForm from "../../../components/healthcomponent/addedithealthIncidentpage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { useSession } from "next-auth/react";
import { fetchData, submitData } from "../../../config/configFile";

const AddEditUserHealthIncident = ({
  id,
  healthincidentData,
  usersData,
  onCancel,
}) => {
  const { data: session, status } = useSession();

  const initialState = {
    incident_date: null,
    incident_description: null,
    treatmentprovided: null,
  };

  const [user_id, setUser_id] = useState("");
  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [healthRecordData, setHealthRecordData] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add health incident",];

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
    console.log("id", id);
    if (id && healthincidentData) {
      const initialFormData = {
        semester_id: id,
        incident_date: healthincidentData.incident_date,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, healthincidentData]);

  const handleChange = (e) => {
    // console.log("formData", formData);
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleUserChange = (e) => {
    const user_id = e.target.value;
    setUser_id(user_id);
  };

  const fetchUserHealthData = async () => {
    setIsLoading(true);
    console.log("selected user", user_id);
    try {
      const data = await fetchData(`/api/health/viewhealthdetails/${user_id}`);
      setHealthRecordData(data);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast.error(
        "Failed to fetch invoice data or there is no data for the user selected"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchUserHealthData();
    }
  }, [user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting health incident form data:", formData);

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  const hasChanges = () => {
    return (
      Object.keys(formData).some((key) => {
        // Skip comparison for image_upload as it's handled separately
        if (key === "image_upload") return false;
        return formData[key] !== originalData[key];
      }) || imageUpload !== null
    );
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsLoading(true);

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      // toast.dismiss(toastId);
      return;
    }
    submitData({
      apiUrl: `/api/health/addhealthincident/${user_id}`,
      data: { ...formData },
      successMessage: "Health incident added successfully",
      errorMessage: "Failed to add health incident",
      onSuccess: (result) => {
        // Reset the form
        console.log('running the onsuccess something')
        setFormData(initialState);
        // Any additional actions on success
      },
      onError: (error) => {
        // Any additional actions on error
      },
    });
    setIsLoading(false);
  };

  

  if (isLoading || status==='loading') {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add health incident" to be on this page
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update health incident?" : "Add New health incident"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details ?`
            : "Are you sure you want to add this new health incident?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <h2 className="text-2xl font-bold text-cyan-700">Add health incident</h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label
            htmlFor="user-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Select User
          </label>
          <select
            id="user-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={user_id}
            onChange={handleUserChange}
          >
            <option value="">Select a user</option>
            {usersData?.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.user_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Other student information */}
      {healthRecordData || user_id ? (
        <UserHealthRecordAndIncidentForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          id={id}
          onCancel={onCancel}
          healthRecord={healthRecordData}
        />
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Select a user to add health incident
        </div>
      )}
    </>
  );
};

export default AddEditUserHealthIncident;

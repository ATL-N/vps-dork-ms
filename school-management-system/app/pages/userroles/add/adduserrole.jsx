"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import AddEditRolePage from "../../../components/rolecomponent/addeditrolepage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { useSession } from "next-auth/react";

const AddUserRole = ({ id, roledata, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    role_name: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
const [isAuthorised, setIsAuthorised] = useState(true);
const [activeSemester, setActiveSemester] = useState();

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["add role"];

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
    console.log("id", id);
    if (id && roledata) {
      const initialFormData = {
        role_id: id,
        role_name: roledata.role_name,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, roledata]);

  const handleChange = (e) => {
    console.log("formData", formData);
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting role form data:", formData);

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

  const handleConfirm = async () => {
    setIsModalOpen(false);
    const toastId = toast.loading("Adding role...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const roledata = {
      role_name: formData.role_name,
    };

    try {
      const url = id ? `/api/classes/update/${id}` : "/api/roles/addrole";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roledata),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error || (id ? "Failed to update role" : "Failed to add role");

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id ? "role updated successfully:" : "role added successfully:",
        result
      );

      toast.update(toastId, {
        render: id ? "role updated successfully" : "role added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(id ? "Error updating role:" : "Error adding role:", error);
      toast.update(toastId, {
        render: id ? "Error updating role" : "Error adding role",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

 

if(isLoading || status=='loading'){
  return (<Loadingpage />)
}

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "add role" to be on this page...!
      </div>
    );
  }


  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update role?" : "Add New role"}
        message={
          id
            ? `Are you sure you want to update ${formData.role_name}'s details ?`
            : "Are you sure you want to add this new role?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddEditRolePage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default AddUserRole;

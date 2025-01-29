"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import AddEditPermissionPage from "../../../components/permissioncomponent/addeditpermissionpage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { useSession } from "next-auth/react";

const AddPermission = ({ id, permissiondata, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    permission_name: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(true);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["send notification", "update notification"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin"
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  useEffect(() => {
    console.log("id", id);
    if (id && permissiondata) {
      const initialFormData = {
        permission_id: id,
        permission_name: permissiondata.permission_name,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, permissiondata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting permission form data:", formData);

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
    const toastId = toast.loading("Adding permission...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const permissiondata = {
      permission_name: formData.permission_name,
    };

    try {
      const url = id
        ? `/api/classes/update/${id}`
        : "/api/permission/addpermission";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(permissiondata),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update permission" : "Failed to add permission");

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id
          ? "permission updated successfully:"
          : "permission added successfully:",
        result
      );

      toast.update(toastId, {
        render: id
          ? "permission updated successfully"
          : "permission added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(
        id ? "Error updating permission:" : "Error adding permission:",
        error
      );
      toast.update(toastId, {
        render: id ? "Error updating permission" : "Error adding permission",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // if (session?.user?.role != "admin" ) {
  //   return (
  //     <div className="flex items-center">
  //       you are not authorised to perform this action
  //     </div>
  //   );
  // }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-600">
        You are not authorised to be on this page
      </div>
    );
  }

  if (isLoading) {
    return <Loadingpage />;
  }

  return (
    <>
      {/* <Loadingpage
          dataName={formData.permission_name}
          id={id}
          isLoading={isLoading}
        /> */}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update permission" : "Add New Permission"}
        message={
          id
            ? `Are you sure you want to update ${formData.permission_name}'s details ?`
            : "Are you sure you want to add this new Permission?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddEditPermissionPage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default AddPermission;

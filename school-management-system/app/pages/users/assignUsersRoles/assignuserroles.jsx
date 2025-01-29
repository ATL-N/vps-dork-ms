"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";
import UserRoleForm from "../../../components/users/userRoles";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";

const AssignUserRoles = ({ onCancel, id, usersData = [], rolesData = [] }) => {
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    selectedUser: null,
    selectedRoles: [],
  });

  const [isAuthorised, setIsAuthorised] = useState(true);
  const [activeSemester, setActiveSemester] = useState();

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["assign roles"];

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
    console.log("usersData", usersData);
    setIsLoading(false);
  }, []);

  const handleUserChange = async (user) => {
    console.log("user", user);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/rolesandpermissions/userrole/${user}`);
      const data = await response.json();
      console.log("data", data);
      const roles = data.roles.map((r) => r.role_id);
      setFormData({
        selectedUser: user,
        selectedRoles: roles,
      });
      setOriginalPermissions(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    if (!formData.selectedUser) return false;

    const currentPermissions = new Set(formData.selectedRoles);
    const originalPermissionsSet = new Set(originalPermissions);

    if (currentPermissions.size !== originalPermissionsSet.size) return true;

    for (let permission of currentPermissions) {
      if (!originalPermissionsSet.has(permission)) return true;
    }

    return false;
  };

  const handleRoleChange = (role_id) => {
    setFormData((prevData) => ({
      ...prevData,
      selectedRoles: prevData.selectedRoles.includes(role_id)
        ? prevData.selectedRoles.filter((id) => id !== role_id)
        : [...prevData.selectedRoles, role_id],
    }));
    console.log("formData", formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedUser) {
      setIsInfoModalOpen(true);
      return;
    }

    if (!hasChanges()) {
      setIsInfoModalOpen(true);
      // alert("No changes detected. Skipping update.");
      return;
    }

    setIsModalOpen(true); // Open the modal instead of using window.confirm

    // console.log("Submitting user form data:", formData);
  };

  const handleConfirm = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const toastId = toast.loading("Updating user roles...");

    try {
      const response = await fetch("/api/rolesandpermissions/userrole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: formData.selectedUser,
          roles: formData.selectedRoles,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Failed to update user roles";

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      const succesMessage = result.message || "user roles updated successfully";
      toast.update(toastId, {
        render: succesMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Optionally, refresh the roles for the current user
      handleUserChange(formData.selectedUser);
    } catch (error) {
      console.error("Error updating roles:", error);
    } finally {
      setIsModalOpen(false);
      setIsLoading(false);
    }
  };


  if (isLoading || status==='loading') {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "assign roles" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update user?" : "Add New user roles"}
        message={
          id
            ? `Are you sure you want to update ${formData.role_name}'s details ?`
            : "Are you sure you want to add this new user roles?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Alert"}
        message={
          "Please select a user before submitting. Or no role changes detected"
        }
      />
      <UserRoleForm
        formData={formData}
        handleRoleChange={handleRoleChange}
        handleUserChange={handleUserChange}
        handleSubmit={handleSubmit}
        onCancel={onCancel}
        rolesData={rolesData}
        usersData={usersData}
      />
    </>
  );
};

export default AssignUserRoles;

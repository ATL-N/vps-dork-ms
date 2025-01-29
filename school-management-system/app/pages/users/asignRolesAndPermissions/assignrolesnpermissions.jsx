"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import RolePermissionForm from "../../../components/users/rolepermissions";
import Loadingpage from "../../../components/Loadingpage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";

const EditRolesAndPermissions = ({
  onCancel,
  id,
  rolesData = [],
  permissionsData = [],
}) => {
  const { data: session, status } = useSession();

  // useEffect(() => {
  //   console.log("rolesData", rolesData);
  // }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    selectedRole: null,
    selectedPermissions: [],
  });

    const [isAuthorised, setIsAuthorised] = useState(true);
    const [activeSemester, setActiveSemester] = useState();

    useEffect(() => {
      const authorizedRoles = ["admin"];
      const authorizedPermissions = ["assign permissions"];

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


  const handleRoleChange = async (role) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/rolesandpermissions/${role.role_id}`);
      const data = await response.json();
      const permissions = data.permissions.map((p) => p.permission_id);
      setFormData({
        selectedRole: role,
        selectedPermissions: permissions,
      });
      setOriginalPermissions(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }finally{
      setIsLoading(false)
    }
  };

  const hasChanges = () => {
    if (!formData.selectedRole) return false;

    const currentPermissions = new Set(formData.selectedPermissions);
    const originalPermissionsSet = new Set(originalPermissions);

    if (currentPermissions.size !== originalPermissionsSet.size) return true;

    for (let permission of currentPermissions) {
      if (!originalPermissionsSet.has(permission)) return true;
    }

    return false;
  };

  const handlePermissionChange = (permissionId) => {
    setFormData((prevData) => ({
      ...prevData,
      selectedPermissions: prevData.selectedPermissions.includes(permissionId)
        ? prevData.selectedPermissions.filter((id) => id !== permissionId)
        : [...prevData.selectedPermissions, permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedRole) {
      setIsInfoModalOpen(true);
      return;
    }

    if (!hasChanges()) {
      setIsInfoModalOpen(true);
      // alert("No changes detected. Skipping update.");
      return;
    }

    setIsModalOpen(true); // Open the modal instead of using window.confirm

    // console.log("Submitting role form data:", formData);
  };

  const handleConfirm = async (e) => {
    setIsModalOpen(false);
    setIsLoading(true);
    const toastId = toast.loading("Updating role permissions...");

    try {
      const response = await fetch(
        "/api/rolesandpermissions/addroleandpermission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role_id: formData.selectedRole.role_id,
            permissions: formData.selectedPermissions,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error || "Failed to update role permissions";

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      const succesMessage =
        result.message || "Role Permissions updated successfully";
      toast.update(toastId, {
        render: succesMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Optionally, refresh the permissions for the current role
      handleRoleChange(formData.selectedRole);
    } catch (error) {
      console.error("Error updating permissions:", error);
    } finally {
      setIsModalOpen(false);
      setIsLoading(false);
    }
  };

  if (isLoading || status === "loading") {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "assign permissions" to be on this page...!
      </div>
    );
  }

  return (
    <>
      {/* <Loadingpage
        dataName={"formData.role_name"}
        id={id}
        isLoading={isLoading}
      /> */}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update role?" : "Add New role permissions"}
        message={
          id
            ? `Are you sure you want to update ${formData.role_name}'s details ?`
            : "Are you sure you want to add this new role permissions?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Alert"}
        message={
          "Please select a role before submitting. Or no changes detected"
        }
      />
      <RolePermissionForm
        formData={formData}
        handlePermissionChange={handlePermissionChange}
        handleRoleChange={handleRoleChange}
        handleSubmit={handleSubmit}
        onCancel={onCancel}
        permissionsData={permissionsData}
        rolesData={rolesData}
      />
    </>
  );
};

export default EditRolesAndPermissions;

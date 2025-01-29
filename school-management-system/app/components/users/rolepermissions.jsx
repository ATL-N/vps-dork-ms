
// app/components/RolePermissionForm.js
import React from "react";
import { FaUserShield, FaCheck, FaTimes } from "react-icons/fa";

const RolePermissionForm = ({
  rolesData,
  permissionsData,
  formData,
  handleRoleChange,
  handlePermissionChange,
  onCancel,
  handleSubmit,
}) => {
  
  return (
    <div className="bg-white p-6 rounded-lg text-cyan-500">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        User Roles and Permissions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Roles</h3>
          <ul className="space-y-2">
            {rolesData.map((role) => (
              <li
                key={role.id}
                className={`cursor-pointer p-2 rounded ${
                  formData.selectedRole &&
                  formData.selectedRole.role_id === role.role_id
                    ? "bg-cyan-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleRoleChange(role)}
                title={`role data for ${role.role_name}`}
              >
                <FaUserShield className="inline mr-2" />
                {role.role_name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Permissions</h3>
          {formData.selectedRole ? (
            <ul className="space-y-2">
              {permissionsData.map((permission) => (
                <li
                  key={permission.permission_id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                >
                  <span>{permission.permission_name}</span>
                  <button
                    onClick={() =>
                      handlePermissionChange(permission.permission_id)
                    }
                    className={`p-1 rounded ${
                      formData.selectedPermissions.includes(
                        permission.permission_id
                      )
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {formData.selectedPermissions.includes(
                      permission.permission_id
                    ) ? (
                      <FaCheck />
                    ) : (
                      <FaTimes />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Select a role to view and edit permissions
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          onClick={onCancel}
        >
          Close
        </button>
        <button
          className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleSubmit}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default RolePermissionForm;

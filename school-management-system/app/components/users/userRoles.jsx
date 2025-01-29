// app/components/userRoleForm.js
import React from "react";
import { FaUserShield, FaCheck, FaTimes } from "react-icons/fa";

const UserRoleForm = ({
  usersData,
  rolesData,
  formData,
  handleUserChange,
  handleRoleChange,
  onCancel,
  handleSubmit,
}) => {
    console.log('rolesData', rolesData)
  return (
    <div className="bg-white p-6 rounded-lg text-cyan-500">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        User Roles and Permissions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Roles</h3>
          <select
            className="w-full p-2 border rounded mb-4"
            value={formData.selectedUser ? formData.selectedUser : ""}
            onChange={(e) => handleUserChange(e.target.value)}
          >
            <option value="">Select a user</option>
            {usersData.map((user) => (
              <option key={user?.user_id} value={user?.user_id}>
                {user?.user_name}-({user?.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Permissions</h3>
          {formData.selectedUser ? (
            <ul className="space-y-2">
              {rolesData.map((role) => (
                <li
                  key={role.role_id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                >
                  <span>{role.role_name}</span>
                  <button
                    onClick={() => handleRoleChange(role.role_id)}
                    className={`p-1 rounded ${
                      formData.selectedRoles.includes(role.role_id)
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {formData.selectedRoles.includes(role.role_id) ? (
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

export default UserRoleForm;

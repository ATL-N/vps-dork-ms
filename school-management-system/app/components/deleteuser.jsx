// components/DeleteUser.js
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const DeleteUser = ({ userData, onClose, onDelete,  }) => {
  const handleDelete = async () => {
    try {
      // Replace this with your actual API call
    //   await deleteStudent(userData.id);
      onDelete(); // Refresh the userData list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error deleting:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div className="p-6 text-cyan-600 ">
      <h2 className="text-2xl font-bold mb-4 text-red-600 flex items-center">
        <FaExclamationTriangle className="mr-2" /> Delete Item
      </h2>
      <p className="mb-4">
        Are you sure you want to delete the item with ID 
      <strong> {userData}
         <h1 className="font-bold">This action cannot be undone.</h1>
        </strong>
      </p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2 hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteUser;

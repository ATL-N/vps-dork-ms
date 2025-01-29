import React from 'react'
import {
  FaUser,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Studentparentrelationship from '../studentparentrelationship';


const Addeditparent = ({
  formData,
  handleChange,
  parentIndex,
  isDetails=false,
}) => {
  const prefix = `parent${parentIndex + 1}`; // Dynamically create field names

  return (
    <div>
      <h3 className="text-xl font-semibold text-cyan-600 mb-4 mt-8">
        {`Parent ${parentIndex + 1} Information`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`${prefix}_other_names`}
          >
            {`Parent ${parentIndex + 1} Other Names`}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              name={`${prefix}_other_names`}
              id={`${prefix}_other_names`}
              // required
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Parent First Name"
              value={formData[`${prefix}_other_names`]}
              onChange={handleChange}
              readOnly={isDetails}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`${prefix}_last_name`}
          >
            {`Parent ${parentIndex + 1} Last Name`}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              name={`${prefix}_last_name`}
              id={`${prefix}_last_name`}
              // required
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Parent Last Name"
              value={formData[`${prefix}_last_name`]}
              onChange={handleChange}
              readOnly={isDetails}
            />
          </div>
        </div>

        <Studentparentrelationship
          formData={formData}
          handleChange={handleChange}
          parentIndex={parentIndex}
          isDetails={isDetails}
        />

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`${prefix}_phone`}
          >
            {`Parent ${parentIndex + 1} Phone`}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              type="tel"
              name={`${prefix}_phone`}
              id={`${prefix}_phone`}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="+1234567890"
              value={formData[`${prefix}_phone`]}
              onChange={handleChange}
              readOnly={isDetails}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`${prefix}_email`}
          >
            {`Parent ${parentIndex + 1} Email`}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              name={`${prefix}_email`}
              id={`${prefix}_email`}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="parent@example.com"
              value={formData[`${prefix}_email`]}
              onChange={handleChange}
              readOnly={isDetails}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor={`${prefix}_address`}
          >
            {`Parent ${parentIndex + 1} Address`}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <textarea
              name={`${prefix}_address`}
              id={`${prefix}_address`}
              rows="3"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Parent's address (it can be the same as the student's)"
              value={formData[`${prefix}_address`]}
              onChange={handleChange}
              readOnly={isDetails}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addeditparent
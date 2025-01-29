import React, { useState } from "react";
import {
  FaUserMd,
  FaAllergies,
  FaTint,
  FaSyringe,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaNotesMedical,
} from "react-icons/fa";
import { InputField, TextAreaField } from "../inputFieldSelectField";


const UserHealthRecordAndIncidentForm = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
  healthRecord,
}) => {
  const [incidentData, setIncidentData] = useState({
    incident_date: "",
    incident_description: "",
    treatmentprovided: "",
  });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setIncidentData((prevData) => ({ ...prevData, [name]: value }));
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onIncidentSubmit(incidentData);
  //   // Reset form after submission
  //   setIncidentData({
  //     incident_date: "",
  //     incident_description: "",
  //     treatmentprovided: "",
  //   });
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const title = id
    ? `Edit  Student Health Incident Report`
    : "Add Student Health Incident Report";

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-cyan-700 text-white p-4">
        <h2 className="text-lg font-bold flex items-center">
          <FaUserMd className="mr-2" /> {title}
        </h2>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">Health Record</h3>
        {healthRecord ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-2 flex items-center">
                <FaUserMd className="mr-2 text-cyan-700" /> Medical Conditions:
              </p>
              <p>{healthRecord.medical_conditions || "None reported"}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-2 flex items-center">
                <FaAllergies className="mr-2 text-cyan-700" /> Allergies:
              </p>
              <p>{healthRecord.allergies || "None reported"}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-2 flex items-center">
                <FaTint className="mr-2 text-cyan-700" /> Blood Group:
              </p>
              <p>{healthRecord.blood_group || "Not specified"}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-2 flex items-center">
                <FaSyringe className="mr-2 text-cyan-700" /> Vaccination Status:
              </p>
              <p>{healthRecord.vaccination_status || "Not specified"}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-2 flex items-center">
                <FaCalendarAlt className="mr-2 text-cyan-700" /> Last Physical
                Exam:
              </p>
              <p>
                {healthRecord.last_physical_exam_date
                  ? formatDate(healthRecord.last_physical_exam_date)
                  : "Not available"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            No health details found for the selected user
          </div>
        )}
        <hr className="my-8" />

        <h3 className="text-xl font-bold mb-4">Report Health Incident</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              type="date"
              label="Incident Date"
              name="incident_date"
              icon={<FaCalendarAlt />}
              value={formData?.incident_date}
              onChange={handleChange}
              isRequired={true}
            />
          </div>

          <div>
            <TextAreaField
              label="Incident Description"
              name="incident_description"
              icon={<FaExclamationTriangle className="text-gray-400" />}
              placeholder="Describe the incident for the health emergency happening"
              onChange={handleChange}
              value={formData.incident_description}
            />
          </div>

          <div>
            <TextAreaField
              label="Treatment Provided"
              name="treatmentprovided"
              icon={<FaNotesMedical className="text-gray-400" />}
              placeholder="Describe the treatment given to the person"
              onChange={handleChange}
              value={formData.treatmentprovided}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              {id ? "Update Incident" : "Add Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserHealthRecordAndIncidentForm;

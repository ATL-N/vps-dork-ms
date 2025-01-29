// components/StudentHealthRecordPage.js
"use client";

import React from "react";
import {
  FaHeartbeat,
  FaSyringe,
  FaAllergies,
  FaNotesMedical,
  FaCalendarAlt,
} from "react-icons/fa";

const HealthRecordPage = ({ healthData }) => {
  console.log('healthData', healthData)
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* <h3 className="text-2xl font-bold text-cyan-700 mb-6">
        Student Health Record
      </h3> */}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        {/* <div className="px-4 py-5 sm:px-6">
          <h3 className="text-xl font-semibold text-cyan-600">
            {student.first_name} {student.last_name}'s Health Information
          </h3>
        </div> */}
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaHeartbeat className="mr-2 text-cyan-500" /> Medical
                Conditions
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {healthData?.medical_conditions || "None reported"}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaAllergies className="mr-2 text-cyan-500" /> Allergies
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {healthData?.allergies || "None reported"}
              </dd>
            </div>
            {/* <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaSyringe className="mr-2 text-cyan-500" /> Medications
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {healthData?.medications.join(", ") || "None reported"}
              </dd>
            </div> */}
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-cyan-600">
            Health Incidents
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {healthData?.healthIncidents?.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Action Taken
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {healthData?.incidents.map((incident, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaCalendarAlt className="inline mr-2 text-cyan-500" />
                      {incident.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaNotesMedical className="inline mr-2 text-cyan-500" />
                      {incident.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incident.actionTaken}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-4 text-sm text-gray-500">
              No health incidents reported.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthRecordPage;

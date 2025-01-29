"use client";
import React from "react";
import { useRouter,  } from "next/navigation";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaFileAlt,
} from "react-icons/fa";



const ClassDetailsPage1 = ({ showBtns = true, classData, staffData }) => {

  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">
        Class Details({classData?.class_name})
      </h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <FaChalkboardTeacher className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Class Teacher</h4>
                <p>
                  {staffData?.first_name} {staffData?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FaChalkboardTeacher className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Class Teacher ID</h4>
                <p>SID/{staffData?.staff_id}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Schedule</h4>
                <p>"Mon-Fri 7:30 AM - 3:30 PM"</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Room name/number:</h4>
                <p> {classData?.room_name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <FaUsers className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Class capacity</h4>
                <p>{classData?.capacity}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <FaUsers className="text-cyan-500 mr-3" size={24} />
            <div>
              <h4 className="font-semibold">Class Level</h4>
              <p>{classData?.class_level}</p>
            </div>
          </div>
        </div>
      </div>

      {showBtns && (
        <div className="flex space-x-4">
          {/* <Link href={`/classes/${id}/schedule`}> */}
          <Link
            href={`/pages/classes/schedule`}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            View Schedule
          </Link>
          {/* <Link href={`/classes/${id}/roster`}> */}
          <Link
            href={`/pages/classes/roster`}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            View Roster
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClassDetailsPage1;

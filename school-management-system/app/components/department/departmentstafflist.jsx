import React from 'react';
import { FaUserTie } from 'react-icons/fa';

const DepartmentStaffList = ({ staff }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h3 className="text-2xl font-semibold text-cyan-700 mb-4">Department Staff</h3>
      <ul className="space-y-4">
        {staff.map((member) => (
          <li key={member.id} className="flex items-center">
            <FaUserTie className="text-cyan-600 mr-3" />
            <div>
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-gray-600">{member.position}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepartmentStaffList;
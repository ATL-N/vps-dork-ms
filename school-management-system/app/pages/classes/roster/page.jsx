'use client'
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

const dummyClassData = {
  id: "CS101",
  name: "Introduction to Computer Science",
};

const dummyRoster = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "123-456-7890",
  },
  { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "234-567-8901" },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    phone: "345-678-9012",
  },
  {
    id: 4,
    name: "Diana Ross",
    email: "diana@example.com",
    phone: "456-789-0123",
  },
  {
    id: 5,
    name: "Ethan Hunt",
    email: "ethan@example.com",
    phone: "567-890-1234",
  },
];

const ClassRosterPage = () => {
  const router = useRouter();
  const { id } = router?.query || 1;

  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">Class Roster</h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-cyan-600 mb-4">
          {dummyClassData.name} Roster
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dummyRoster.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUser className="text-cyan-500 mr-3" size={20} />
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaEnvelope className="text-cyan-500 mr-2" size={16} />
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaPhone className="text-cyan-500 mr-2" size={16} />
                      <div className="text-sm text-gray-500">
                        {student.phone}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link
        className="inline-block px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        // href={`/classes/${id}`}
        href={`/pages/classes/details`}
      >
        Back to Class Details
      </Link>
    </div>
  );
};

export default ClassRosterPage;

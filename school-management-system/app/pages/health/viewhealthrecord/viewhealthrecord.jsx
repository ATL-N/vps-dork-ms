"use client";

import React, { useState, useEffect } from "react";
import UserHealthRecordpage from "../../../components/healthcomponent/viewhealthrecordpage";
import Loadingpage from "../../../components/Loadingpage";
import { fetchData } from "../../../config/configFile";
import { useSession } from "next-auth/react";

const ViewUserHealthRecord = ({ usersData, onCancel }) => {
  const { data: session, status } = useSession();

  const [user_id, setUser_id] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [healthRecordData, setHealthRecordData] = useState(null);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view health record"];

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
  }, [session, status]);

  const handleUserChange = (e) => {
    const user_id = e.target.value;
    setUser_id(user_id);
  };

  const fetchUserHealthData = async () => {
    setIsLoading(true);
    console.log("selected user", user_id);
    try {
      const data = await fetchData(`/api/health/viewhealthdetails/${user_id}`);
      setHealthRecordData(data);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast.error(
        "Failed to fetch invoice data or there is no data for the user selected"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchUserHealthData();
    }
  }, [user_id]);

   if (isLoading || status==='loading') {
     return <Loadingpage />;
   }

  if (!isAuthorised) {
    return (
      <div className="flex items-center justify-center h-full">
        You are not authorised "view health record" to view this page...!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-700">View Health details</h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label
            htmlFor="user-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Select User
          </label>
          <select
            id="user-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={user_id}
            onChange={handleUserChange}
          >
            <option value="">Select a user</option>
            {usersData?.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.user_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Other student information */}
      {healthRecordData ? (
        <UserHealthRecordpage healthRecord={healthRecordData} />
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Select a user to view the health details
        </div>
      )}
    </div>
  );
};

export default ViewUserHealthRecord;

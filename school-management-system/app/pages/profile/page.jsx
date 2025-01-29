"use client";
//  /pages/profile
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherProfilePage from "../../components/staffcomponent/teacherprofile";
import Studentprofilepage from "../students/studentprofile/studentprofile";
// import TeacherDashboard from "./teacherdashboard/page";
import Navigation from "../../components/Navigation";
import LoadingPage from "../../components/generalLoadingpage";
import { fetchData } from "../../config/configFile";

const Maindashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  // console.log('user session data:',session )

  const [activeSem, setActiveSem] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(true);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher", "student", "Student", 'teaching staff'];
    const authorizedPermissions = ["view students"];

    if (authorizedRoles.includes(session?.user?.role)) {
      if (
        session?.user?.role === "student" ||
        session?.user?.role === "Student"
      ) {
        console.log("running the student and Student function");

        fetchStudentData(session?.user?.id);
      } else if (
        session?.user?.role === "admin" ||
        session?.user?.role === "teaching staff"
      ) {
        console.log("running the staff and admin function");

        fetchStaffData(session?.user?.id);
      }

      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const user_id = session?.user?.id;
      setActiveSem(user_id);
      console.log("user session data234:", session);

      // fetchAnalytics(class_id, activeSemester);
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      // setIsLoading(false);
    }
  }, [status, session]);

  const fetchStudentData = async (user_id) => {
    console.log("running fetchStudentData...");
    setIsLoading(true);
    const [studentdata] = await Promise.all([
      fetchData(
        `/api/students/extendedstudentuserdetails/${user_id}`,
        "",
        false
      ),
    ]);
    setStudentData(studentdata);
    setIsLoading(false);
  };

  const fetchStaffData = async (user_id) => {
    setIsLoading(true);
    const [staffdata] = await Promise.all([
      fetchData(`/api/staff/staffuserdetails/${user_id}`, "", false),
    ]);
    setStaffData(staffdata);
    setIsLoading(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }
  if(!isAuthorised){
    return <div>You are not authorised to be on this page. Contact the administrator for more details</div>
  }

  return (
    <div className="mb-4">
      {/* <Navigation /> */}

      {(session?.user?.role === "teaching staff" ||
        session?.user?.role === "admin") && (
        <TeacherProfilePage staffData={staffData} />
      )}
      {session?.user?.role === "student" && (
        <Studentprofilepage studentData={studentData} displayBtns={false} />
      )}
      {/* {session?.user?.role === "student" && <Studentdashboard />} */}
      {/* {session?.user?.role === "teaching staff" && <TeacherDashboard />} */}
    </div>
  );
};

export default Maindashboard;

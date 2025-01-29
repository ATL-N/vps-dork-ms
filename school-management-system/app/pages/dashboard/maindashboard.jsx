"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./admindashboard/page";
import ParentDashboard from "./parentdashboard/parentdashboard";
import Studentdashboard from "./studentdashboard/page";
import TeacherDashboard from "./teacherdashboard/page";
import LoadingPage from "../../components/generalLoadingpage";

const Maindashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  // console.log("user session data:", session);

  if (status === "loading") {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  // useEffect(() => {
  //   // Wait for the session to load before rendering the component
  //   if (status === "loading") {
  //     return;
  //   }
  // }, [status, router]);

  // if (status === "loading") {
  //   return <div>Loading...</div>;
  // }

  // if (!session) {
  //    router.push("/authentication/login");
  //   // console.log("running the !session");
  //   // return <div className="flex">Unauthorized</div>;
  // }

  if (
    session?.user?.roles?.includes("admin") ||
    session?.user?.roles?.includes("head teacher") ||
    session?.user?.role === "admin" ||
    session?.user?.role === "head teacher"
  ) {
    return (
      <div className="flex-1 ml-0 md:ml-16 mt-16 mb-1 p-6 pb-0 bg-gray-100">
        <AdminDashboard />
      </div>
    );
  } else if (
    session?.user?.role === "teaching staff" ||
    session?.user?.roles?.includes("teaching staff")
  ) {
    return (
      <div className="flex-1 ml-0 md:ml-16 mt-16 mb-1 p-6 pb-0 bg-gray-100">
        <TeacherDashboard />{" "}
      </div>
    );
  } else if (
    session?.user?.role === "student" ||
    session?.user?.roles?.includes("student")
  ) {
    return (
      <div className="flex-1 ml-0 md:ml-16 mt-16 mb-1 p-6 pb-0 bg-gray-100">
        <Studentdashboard />;
      </div>
    );
  } else if (
    session?.user?.roles?.includes("parent") ||
    session?.user?.role === "parent"
  ) {
    return (
      <div className="flex-1 ml-0 md:ml-16 mt-16 mb-1 p-6 pb-0 bg-gray-100">
        <ParentDashboard user_id={session?.user?.id} />
      </div>
    );
  }

  return (
    // <>
    <div className="flex-1 ml-0 md:ml-16 mt-16 mb-1 p-6 pb-0 bg-gray-100">
      Only parents, teaching staff, and students has access to this page.
      Contact the admin for more details.
      {/* <Navigation /> */}
      {/* {session?.user?.roles?.includes("admin") && <AdminDashboard />} */}
      {/* {session?.user?.roles?.includes("parent") ||
        (session?.user?.role === "parent" && (
          <ParentDashboard user_id={session?.user?.id} />
        ))} */}
      {/* {session?.user?.role === "student" ||
        (session?.user?.roles?.includes("student") && <Studentdashboard />)} */}
      {/* {session?.user?.role === "teaching staff" ||
        (session?.user?.roles?.includes("teaching staff") && (
          <TeacherDashboard />
        ))} */}
    </div>
  );
};

export default Maindashboard;

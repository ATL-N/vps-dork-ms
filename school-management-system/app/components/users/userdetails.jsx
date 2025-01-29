import React from "react";
import ProfilePage from "../../components/profilepage";
// import { transformStudentData, Geticon } from "../../components/configfiles"; 


const UserDetails = () => {
  const studentData = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    image_details: "img", // Replace with actual image URL
  };

  const desiredOrder = ["id number", "name", "email", "phone", "image_details"];

  // const transformedData = transformStudentData(
  //   studentData,
  //   keyMap,
  //   desiredOrder
  // );
  // console.log(transformedData);


  return (
    <div>
      <div className="px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-cyan-700 text-center uppercase">
          User Profile
        </h2>
      </div>
      {/* <div className="container mx-auto px-2 p-2 relative min-w-[30vw] w-[90vw] max-h-[80vh] h-[70vh] rounded-md bg-gray-50   shadow-md overflow-hidden"></div> */}
      <ProfilePage
        student={studentData}
        maxTableHeight="70vh"
        height="70vh"
        pageTitle={"User Info"}
      />
    </div>
  );
};

export default UserDetails;

// 0552517905 0205956650

"use client";
import React, { useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage, database } from "../../config/firebase";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaVenusMars,
  FaMapMarkerAlt,
  FaIdCard,
  FaCertificate,
  FaStar,
  FaBook,
  FaClock,
} from "react-icons/fa";
import Image from "next/image";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CustomTable from "../../components/listtableForm";
import Teacherscheculepage from "../../pages/staff/schedule/staffschedule";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const TeacherProfilePage = ({ staffData }) => {
  const { data: session, status } = useSession();

  let evaluationData;

  const [imagePreview, setImagePreview] = useState("");
  const [activeSem, setActiveSem] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);

  const headerNames = [
    // "eval id",
    "Evaluation Date",
    "Teaching Effectiveness",
    "Class Management",
    "Student Engagement",
    "Professionalism",
    "Overall ratings",
    "Years of experience",
    "Comment",
  ];

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);

      // fetchAnalytics(class_id, activeSemester);
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      // setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["view students"];

    if (session?.user?.roles?.some((role) => authorizedRoles.includes(role))) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session]);

  useEffect(() => {
    if (staffData?.photo) {
      console.log("running fetchImage in if statement", staffData.photo);
      fetchImage(staffData.photo);
    }
  }, []);

  function extractEvaluationData(data) {
    return data.map((item) => {
      return {
        // evaluation_id: item.evaluation_id,
        evaluation_date: item.evaluation_date,
        teaching_effectiveness: item.teaching_effectiveness,
        classroom_management: item.classroom_management,
        student_engagement: item.student_engagement,
        professionalism: item.professionalism,
        overall_rating: item.overall_rating,
        years_of_experience: item.years_of_experience,
        comments: item.comments,
      };
    });
  }

  const fetchImage = async (image_upload) => {
    console.log("running fetchImage");
    if (image_upload) {
      console.log("running fetchImage988888");

      // const toastId2 = toast.loading("Fetching image...");

      try {
        // Fetch image URL from Firebase storage
        const imageRef = ref(storage, image_upload);
        const imageUrl = await getDownloadURL(imageRef);
        console.log("imageUrl", imageUrl);

        // toast.update(toastId2, {
        //   render: "Image fetched successfully",
        //   type: "success",
        //   isLoading: false,
        //   autoClose: 3000,
        // });

        setImagePreview(imageUrl);

        return imageUrl;
      } catch (error) {
        console.error("Error fetching image from Firebase:", error);

        // toast.update(toastId2, {
        //   render: `Error fetching image: ${error.message}`,
        //   type: "error",
        //   isLoading: false,
        //   autoClose: 3000,
        // });

        throw error; // Re-throw the error so it can be handled by the caller if needed
      }
    } else {
      // If no image_upload is provided, show an info toast
      // toast.info("No image to fetch", {
      //   autoClose: 3000,
      // });
      return null;
    }
  };

  // Example usage:

  if (staffData?.evaluations) {
    evaluationData = extractEvaluationData(staffData?.evaluations);
  }

  // staffData = staffData
  console.log("imagepreview in in teacherprofilepage", imagePreview);
  const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center mb-4">
      {icon}
      <span className="font-semibold mr-2 text-cyan-700">{label}:</span>
      <span>{value}</span>
    </div>
  );

  const SectionTitle = ({ title }) => (
    <h3 className="text-xl font-semibold text-cyan-600 mb-4">{title}</h3>
  );

  const performanceData = [
    {
      skill: "Teaching Effectiveness",
      value: staffData?.teaching_effectiveness,
    },
    { skill: "Classroom Management", value: staffData?.classroom_management },
    { skill: "Student Engagement", value: staffData?.student_engagement },
    { skill: "Professionalism", value: staffData?.professionalism },
  ];

  if (status === "loading") {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6">Staff Profile</h2>

      {/* Personal Information */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <SectionTitle title="Personal Information" />
        <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
          <div className="w-48 h-48 rounded-lg relative overflow-hidden mb-4 md:mb-0 md:mr-6">
            {/* <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4"> */}
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Teacher preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaUser size={48} />
              </div>
            )}
            {/* </div> */}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-cyan-600 mb-2">
              {staffData?.first_name} {staffData?.last_name}
            </h3>
            <p className="text-gray-600 mb-2">{staffData?.role}</p>
            <p className="text-gray-600">{staffData?.subject_specialization}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={<FaEnvelope className="text-cyan-500 mr-2" />}
            label="Email"
            value={staffData?.email}
          />
          <InfoItem
            icon={<FaPhone className="text-cyan-500 mr-2" />}
            label="Phone"
            value={staffData?.phone}
          />
          <InfoItem
            icon={<FaCalendarAlt className="text-cyan-500 mr-2" />}
            label="Date of Birth"
            value={staffData?.date_of_birth}
          />
          <InfoItem
            icon={<FaVenusMars className="text-cyan-500 mr-2" />}
            label="Gender"
            value={staffData?.gender}
          />
          <InfoItem
            icon={<FaMapMarkerAlt className="text-cyan-500 mr-2" />}
            label="Address"
            value={staffData?.address}
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <SectionTitle title="Professional Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={<FaIdCard className="text-cyan-500 mr-2" />}
            label="Employee ID"
            value={`SID/${staffData?.staff_id}`}
          />
          <InfoItem
            icon={<FaCalendarAlt className="text-cyan-500 mr-2" />}
            label="Hire Date"
            value={staffData?.date_of_joining}
          />
          <InfoItem
            icon={<FaGraduationCap className="text-cyan-500 mr-2" />}
            label="Qualification"
            value={staffData?.qualification}
          />
          <InfoItem
            icon={<FaChalkboardTeacher className="text-cyan-500 mr-2" />}
            label="Account Number"
            value={staffData?.account_number}
          />
          <InfoItem
            icon={<FaMoneyBillWave className="text-cyan-500 mr-2" />}
            label="Salary"
            value={`GHC ${staffData?.salary}`}
          />
          <InfoItem
            icon={<FaClock className="text-cyan-500 mr-2" />}
            label="Years of Experience"
            value={staffData?.years_of_experience}
          />
        </div>
      </div>

      {/* Certifications */}
      {/* <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <SectionTitle title="Certifications" />
        {staffData?.certifications.map((cert, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <InfoItem
              icon={<FaCertificate className="text-cyan-500 mr-2" />}
              label={cert.name}
              value={`Issued: ${cert.issue_date} | Expires: ${cert.expiry_date}`}
            />
          </div>
        ))}
      </div> */}

      {staffData?.evaluation_id && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <SectionTitle title="Recent Evaluation" />
          <div className="mb-4">
            <InfoItem
              icon={<FaStar className="text-cyan-500 mr-2" />}
              label="Recent Overall Rating"
              value={staffData?.overall_rating}
            />
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#0e7490"
                  fill="#0e7490"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Courses Taught */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <SectionTitle title="Recent Evaluations" />
        {staffData?.evaluations.length > 0 ? (
          <div className="overflow-x-auto tableWrap ">
            <CustomTable
              data={evaluationData}
              headerNames={headerNames}
              height="20vh"
              displayActions={false}
              displaySearchBar={false}
            />
          </div>
        ) : (
          <div>
            <p>
              No past evaluation(s) available.{" "}
              <b>All evaluations is displayed here</b>
            </p>
          </div>
        )}
      </div>

      {/* Additional Information or Achievements */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <SectionTitle title="Additional Information" />
        <Teacherscheculepage showStaffDet={false} staffData={staffData} />
        <p className="text-gray-700">{staffData?.additional_info}</p>
      </div>
    </div>
  );
};

export default TeacherProfilePage;

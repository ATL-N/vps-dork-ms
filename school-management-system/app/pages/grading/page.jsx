"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  FaChartBar,
  FaUserGraduate,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaFileAlt,
  FaPlus,
  FaBookOpen,
  FaPlusCircle,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { FaBookOpenReader, FaFileCirclePlus } from "react-icons/fa6";

import { fetchData } from "../../config/configFile";
import LoadingPage from "../../components/generalLoadingpage";
import CustomTable from "../../components/listtableForm";
import Addeditgradescheme from "./addgradescheme/addgradingscheme";
import Modal from "../../components/modal/modal";
import DeleteUser from "../../components/deleteuser";
import ClassMasterSheet from "./gradebook/classmastersheet";
import Addgrades from "./add/addgrade";
import ClassRemarksTable from "../../components/studentremarkscomponent/classremarkstable";
import ReportCardPage from "./reportcard/reportcard";
import ClassGradeAnalyticsPage from "./analytics/classanalytics";
import ClassPromotion from "./promotion/classpromotion";

const GradeAnalyticsPage = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isDeleteAuthorised, setIsDeleteAuthorised] = useState(false);
  const authorizedRoles = ["admin"];
  const [activeSemester, setActiveSemester] = useState();

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);
      fetchAnalytics(activeSemester);
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedPermissions = ["delete grading scheme"];
    const authorizedPermissions2 = ["view examinations"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      )
    ) {
      setIsDeleteAuthorised(true);
    } else {
      setIsDeleteAuthorised(false);
    }

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions2.includes(permission)
      ) ||
      session?.user?.roles?.some((role) => authorizedRoles.includes(role)) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  const headerNames = ["ID", "Class name", "Class Average"];

  const gradingSchemeHeaderNames = [
    "ID",
    "Grade Name",
    "Max Mark",
    "Min Mark",
    "Remark",
  ];

  const fetchAnalytics = async (semester_id) => {
    // setIsLoading(true);
    setError(null);
    try {
      const data = await fetchData(
        `/api/grading/semesteranalytics/${semester_id}`,
        "",
        false
      );
      // console.log("analytics", data);
      if (data && Object.keys(data).length > 0) {
        // console.log("analytics222", data);

        setAnalytics(data?.gradeAnalytics);
      } else {
        setError("No data available for this semester.");
      }
    } catch (err) {
      setError("Failed to fetch analytics data. Please try again later.");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeEdit = (scheme_id) => {
    setModalContent(
      <div>
        <Addeditgradescheme
          id={scheme_id}
          onCancel={() => {
            setShowModal(false);
            fetchAnalytics(activeSem);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleAddGradingScheme = () => {
    setModalContent(
      <div>
        <Addeditgradescheme
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleTakeExamsMarks = () => {
    setModalContent(
      <Addgrades
        onClose={() => {
          setShowModal(false);
          // fetchClassData();
          // fetchTimetableData(classId);
          // fetchAttendanceSheet(classId, activeSemester);
        }}
        // classId={classId}
        onSubmit={() => {
          setShowModal(false);
          fetchAttendanceData();
        }}
      />
    );
    setShowModal(true);
  };

  const handleViewClassGradebook = (class_id = "") => {
    console.log("class_id", class_id);
    setModalContent(
      <div>
        <ClassMasterSheet
          class_id={class_id}
          onClose={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleViewAllGradebook = () => {
    setModalContent(
      <div>
        <ClassMasterSheet
          onClose={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleStudentPromotion = () => {
    setModalContent(
      <div>
        <ClassPromotion
          onClose={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleDeleteScheme = async (scheme_id) => {
    if (!isDeleteAuthorised) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised to perform this action
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={scheme_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing...");

                const eventData = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/grading/deletegradingscheme/${scheme_id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(eventData),
                    }
                  );

                  if (!response.ok) {
                    // throw new Error(
                    //   id ? "Failed to delete event" : "Failed to add event"
                    // );

                    toast.update(toastId2, {
                      render: "Failed to delete event!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                  }

                  // Add API call to delete event
                  await fetchAnalytics(activeSem);
                  // toast.success("event deleted successfully...");
                  toast.update(toastId2, {
                    render: "Event deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setShowModal(false);
                  // alert("event deleted successfully!");
                } catch (error) {
                  console.error("Error deleting event:", error);
                  // toast.error("An error occurred. Please try again.");
                  toast.update(toastId2, {
                    render: "An error occurred. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                  });

                  // alert("An error occurred. Please try again.");
                }
              }}
            />
          </div>
        );
      } catch (error) {
        console.log(error);
      } finally {
        setShowModal(true);
        setIsLoading(false);
      }
    }
  };

  const handleAddEditClassRemarks = (classId) => {
    setModalContent(
      <ClassRemarksTable
        class_id={classId}
        onClose={() => setShowModal(false)}
        // onSave={handleSaveClassRemarks}
        // userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const handleViewClassReport = (classId) => {
    setModalContent(
      <ReportCardPage
        class_id={classId}
        semester_id={activeSem}
        onClose={() => setShowModal(false)}
        // onSave={handleSaveClassRemarks}
        // userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const handleViewSchoolReport = () => {
    setModalContent(
      <ReportCardPage
        onClose={() => setShowModal(false)}
        // onSave={handleSaveClassRemarks}
        // userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const handleViewClassAnalytics = (classId) => {
    setModalContent(
      <ClassGradeAnalyticsPage
        class_id={classId}
        onClose={() => setShowModal(false)}
      />
    );
    setShowModal(true);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthorised) {
    return <div>You are not authorised 'view examinations' to be on this page...!</div>;
  }
  if (error) {
    return (
      <div>error</div>
      // <Alert variant="destructive">
      //   <AlertTitle>Error</AlertTitle>
      //   <AlertDescription>{error}</AlertDescription>
      // </Alert>
    );
  }

  if (!analytics) {
    return (
      <div> There is no analytics data available for the current semester.</div>

      // <Alert>
      //   <AlertTitle>No Data</AlertTitle>
      //   <AlertDescription>
      //     There is no analytics data available for the current semester.
      //   </AlertDescription>
      // </Alert>
    );
  }

  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700">Grade Analytics</h2>

      {/* Class Averages */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
          <div className="space-y-2 bg-gray-100 rounded-md p-1 ">
            <h3 className="font-semibold text-lg flex items-center">
              <FaChartBar className="text-cyan-500 mr-2" size={20} />
              School Average
            </h3>
            <p className="text-3xl font-bold text-cyan-600">
              {analytics?.schoolAverage?.toFixed(2) ?? "N/A"}%
            </p>
          </div>
          <div className="space-y-2 bg-gray-100 rounded-md p-1">
            <h3 className="font-semibold text-lg flex items-center">
              <FaPercentage className="text-cyan-500 mr-2" size={20} />
              Highest Grade
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.highestGrade?.toFixed(2) ?? "N/A"}%
            </p>
          </div>
          <div className="space-y-2 bg-gray-100 rounded-md p-1">
            <h3 className="font-semibold text-lg flex items-center">
              <FaPercentage className="text-cyan-500 mr-2" size={20} />
              Lowest Grade
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {analytics?.lowestGrade?.toFixed(2) ?? "N/A"}%
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Subject Averages</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics?.subjectAverages || {}).map(
            ([subject, average]) => (
              <div
                key={subject}
                className="text-cyan-700 p-4 rounded-lg bg-gray-100 flex flex-col text-center shadow-lg"
              >
                <h4 className="font-semibold">{subject}</h4>
                <p className="text-2xl font-bold">
                  {average?.toFixed(2) ?? "N/A"}%
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "record assessment"
              )) && (
              <button
                onClick={handleTakeExamsMarks}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaPlusCircle className="mx-auto mb-2 text-2xl" /> Record
                Assessment
              </button>
            )}

            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "promote students"
              )) && (
              <button
                onClick={handleStudentPromotion}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaUserGraduate className="mx-auto mb-2 text-2xl" /> Student
                Promotion
              </button>
            )}
            {/* <button
              onClick={handleViewInvoice}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileAlt className="mx-auto mb-2 text-2xl" /> View Invoice
            </button> */}

            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "view masters sheet"
              )) && (
              <button
                onClick={handleViewAllGradebook}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> School Masters
                sheets
              </button>
            )}

            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "view report cards"
              )) && (
              <button
                onClick={handleViewSchoolReport}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> School Report
                Cards
              </button>
            )}
            {/* <Link
              href={"/pages/studentremarks/details"}
              about="Click to open remarks page"
              className="p-4 bg-green-200 rounded-lg text-center hover:bg-green-300 transition duration-300"
            >
              <button
              // onClick={handleAddExpense}
              >
                <FaBookOpen className="mx-auto text-2xl" />
                Remarks
              </button>
            </Link> */}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Class Averages
            </h2>
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "record assessment"
              )) && (
              <button
                onClick={handleTakeExamsMarks}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Record assessment
              </button>
            )}
          </div>
          {/* {recentExpenses?.length > 0 ? ( */}
          <CustomTable
            data={analytics?.classesTableData}
            headerNames={headerNames}
            maxTableHeight="40vh"
            height="20vh"
            // handleDelete={fetchRecentPayments}
            handleEdit={handleViewClassGradebook}
            handleDetails={handleAddEditClassRemarks}
            handleEvaluation={handleViewClassReport}
            handleOpenLink={handleViewClassAnalytics}
            searchTerm={""}
            // handleSearch={fetchRecentPayments}
            displayActions={true}
            displayDelBtn={false}
            displayEvaluationBtn={
              session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "view report cards"
              )
            }
            displaySearchBar={false}
            displayDetailsBtn={
              session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add remarks"
              )
            }
            displayLinkBtn={true}
            displayEditBtn={
              session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "view masters sheet"
              )
            }
            editTitle="View Masters sheet for class with id "
            evalTitle="View Report card details for class "
            linkBtnTitle="View Grade analytics for class "
            detailsTitle="View or Add Remarks for class "
            detailsIcon={<FaFileCirclePlus />}
            editIcon={<FaBookOpen />}
            extendedDetailsIcon={<FaChartBar color="blue" />}
          />
          {/* ) : (
            <LoadingPage />
          )} */}
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Grading Scheme
            </h2>
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add grading scheme"
              )) && (
              <button
                onClick={handleAddGradingScheme}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Grading Scheme
              </button>
            )}
          </div>
          {/* {recentExpenses?.length > 0 ? ( */}
          <CustomTable
            data={analytics?.gradingScheme}
            headerNames={gradingSchemeHeaderNames}
            maxTableHeight="40vh"
            height="20vh"
            handleDelete={handleDeleteScheme}
            handleEdit={handleGradeEdit}
            searchTerm={""}
            // handleSearch={fetchRecentPayments}
            displayActions={false}
            displayEvaluationBtn={false}
            displaySearchBar={false}
            displayDetailsBtn={false}
            editTitle="Edit schemme  "
          />
          {/* ) : (
            <LoadingPage />
          )} */}
        </div>
      </div>

      {/* School Performance Over Time */}
      {analytics?.schoolPerformanceOverTime &&
        analytics?.schoolPerformanceOverTime.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              School Performance Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.schoolPerformanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageGrade"
                    stroke="#0099CC"
                    name="Average Grade"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      {/* Grade Distribution Chart */}
      {analytics?.gradeDistribution &&
        analytics?.gradeDistribution.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Grade Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#0099CC"
                    name="Number of Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      {/* High and Low Performing Classes */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Class Performance Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center">
              <FaArrowUp className="text-green-500 mr-2" /> Top Performing
              Classes
            </h4>
            <ul className="space-y-2">
              {analytics.topPerformingClasses?.map((classInfo) => (
                <li key={classInfo.id} className="bg-green-100 p-2 rounded">
                  {classInfo.name} ({classInfo.level}):{" "}
                  {classInfo.averageGrade?.toFixed(2) ?? "N/A"}%
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center">
              <FaArrowDown className="text-red-500 mr-2" /> Low Performing
              Classes
            </h4>
            <ul className="space-y-2">
              {analytics.lowPerformingClasses?.map((classInfo) => (
                <li key={classInfo.id} className="bg-red-100 p-2 rounded">
                  {classInfo.name} ({classInfo.level}):{" "}
                  {classInfo.averageGrade?.toFixed(2) ?? "N/A"}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Grade Breakdown</h3>

        {analytics?.gradeDistribution?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-cyan-600">
                <th className="p-2 text-left">Grade</th>
                <th className="p-2 text-left">Number of Students</th>
                <th className="p-2 text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.gradeDistribution.map((item) => (
                <tr key={item.grade} className="border-b">
                  <td className="p-2 font-semibold">{item.grade}</td>
                  <td className="p-2">{item?.count}</td>
                  <td className="p-2">
                    {(
                      (item.count /
                        analytics?.gradeDistribution?.reduce(
                          (sum, i) => sum + i.count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data found. The grade breakdown would be displayed here</div>
        )}
      </div>

      {/* Subject Performance Comparison */}
      {analytics.subjectPerformance &&
        analytics.subjectPerformance.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Subject Performance Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-cyan-600 text-white">
                    <th className="px-4 py-2">Subject</th>
                    <th className="px-4 py-2">School Average</th>
                    <th className="px-4 py-2">Top Score</th>
                    <th className="px-4 py-2">Lowest Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.subjectPerformance.map((subject, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="border px-4 py-2">{subject.subject}</td>
                      <td className="border px-4 py-2">
                        {subject.schoolAverage?.toFixed(2) ?? "N/A"}%
                      </td>
                      <td className="border px-4 py-2">
                        {subject.topScore?.toFixed(2) ?? "N/A"}%
                      </td>
                      <td className="border px-4 py-2">
                        {subject.lowScore?.toFixed(2) ?? "N/A"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            fetchAnalytics(activeSem);
          }}
        >
          {modalContent}
        </Modal>
      )}
    </div>
  );
};

export default GradeAnalyticsPage;

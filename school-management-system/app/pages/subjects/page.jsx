// pages/dashboard/subjects/index.js
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBook,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaGraduationCap,
  FaChalkboardTeacher,
} from "react-icons/fa";
import DeleteUser from "../../components/deleteuser";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import CustomTable from "../../components/listtableForm";
import AddnewSubject from "./add/addsubject";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const SubjectManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isDelSubAuthorised, setIsDelSubAuthorised] = useState(false);
  const authorizedRoles = ["admin"];

  useEffect(() => {
    const authorizedPermissions = ["view subjects"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin"
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }

    const authorizedDelSubPermissions = ["delete subject"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedDelSubPermissions.includes(permission)
      ) || session?.user?.role === "admin"
    ) {
      setIsDelSubAuthorised(true);
    } else {
      setIsDelSubAuthorised(false);
    }
  }, [session, status]);

  const headerNames = ["id", "Subject Name"];

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    fetchSubjects();
    // fetchSubjectStats();
  }, []);

  const fetchSubjects = async (searchQuery1 = "") => {
    // const toastId = toast.loading("Fetching subjects...");

    try {
      setIsLoading(true);
      // setError(null);
      const data = await fetchData("/api/subjects/allsubjects", "", false);

      setSubjects(data);
      // return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSubjects(e.target.value);
  };

  const handleAddSubject = async () => {
    try {
      setModalContent(
        <AddnewSubject
          setShowModal={setShowModal}
          onCancel={() => {
            setShowModal(false);
            fetchSubjects();
          }}
        />
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      setShowModal(true);
    }
  };

  const handleEditSubject = async (subject_id) => {
    console.log("subject_id2", subject_id);
    setIsLoading(true);
    try {
      const [subjectdata] = await Promise.all([
        fetchData(`/api/subjects/subjectdetails/${subject_id}`, "", true),
      ]);
      setModalContent(
        <div>
          <AddnewSubject
            id={subject_id}
            subjectdata={subjectdata}
            onCancel={() => {
              setShowModal(false);
              fetchSubjects();
            }}
          />
        </div>
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setShowModal(true);
    }
  };

  const handleDeleteSubject = async (subject_id) => {
    if (!isDelSubAuthorised) {
      setModalContent(
        <div className="flex items-center">
          You are not authorised "delete subject" to be on this page
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={subject_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing your request...");

                const subjectdata = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/subjects/deleteSubject/${subject_id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(subjectdata),
                    }
                  );

                  if (!response.ok) {
                    // throw new Error(
                    //   id ? "Failed to delete subject" : "Failed to add subject"
                    // );

                    toast.update(toastId2, {
                      render: "Failed to delete subject!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                  }

                  // Add API call to delete subject
                  await fetchSubjects();
                  // toast.success("subject deleted successfully...");
                  toast.update(toastId2, {
                    render: "subject deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  // alert("subject deleted successfully!");
                } catch (error) {
                  console.error("Error deleting subject:", error);
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

  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "view subjects" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Subject Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
          <StatCard
            icon={<FaBook />}
            title="Total Subjects"
            value={subjects.length}
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Subject List
            </h2>
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add subject"
              )) && (
              <button
                onClick={handleAddSubject}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Subject
              </button>
            )}
          </div>
          <div className="overflow-x-auto tableWrap">
            {subjects.length > 0 ? (
              <CustomTable
                data={subjects}
                headerNames={headerNames}
                maxTableHeight="40vh"
                height="20vh"
                handleDelete={handleDeleteSubject}
                handleEdit={handleEditSubject}
                displaySearchBar={false}
                displayDetailsBtn={false}
                displayEditBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "add subject"
                  )
                }
                displayDelBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "delete subject"
                  )
                }
                itemDetails="subject id."
                displaybtnlink="/pages/subjects/details/"
                displayActions={authorizedRoles.includes(session?.user?.role)}
              />
            ) : (
              <div>
                <div>
                  No subjects found in the system. Add a subject to see it here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default SubjectManagement;

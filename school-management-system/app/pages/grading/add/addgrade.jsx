"use client";
import React, { useState, useEffect } from "react";
import Addeditstudentgradepage from "../../../components/gradingcomponent/addeditstudentgradepage";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";
import { fetchData } from "../../../config/configFile";

const dummyAssignments = [
  { id: 1, name: "Class Score", weight: 50 },
  { id: 2, name: "Exams Score", weight: 50 },
];

const Addgrades = ({ id, classId }) => {
  const { data: session, status } = useSession();

  const [grades, setGrades] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSemester, setSelectedSemester] = useState();
  const [classesData, setClassesData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeSem, setActiveSem] = useState(null);
  const [gradesData, setGradesData] = useState(null);


 useEffect(() => {
   if (
     status === "authenticated" &&
     session?.user?.activeSemester?.semester_id
   ) {
     const activeSemester = session.user.activeSemester.semester_id;
     setActiveSem(activeSemester);
     setSelectedSemester(activeSemester)
    //  fetchAnalytics(activeSemester);
   } else if (status === "unauthenticated") {
     setIsLoading(false);
   }
 }, [status, session]);

  useEffect(() => {
    fetchallData();
    if (classId) {
      setSelectedClass(classId);
      fetchStudentsByClass(classId);
    }
  }, []);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["record assessment"];

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
  }, [session]);

  useEffect(() => {
          console.log("running selectedclass 11222", selectedClass, selectedSemester, selectedSubject);

    if (selectedClass && selectedSemester && selectedSubject ) {
      fetchclassgradesdata(selectedClass, selectedSemester, selectedSubject)
      console.log('running selectedclass grades', grades)
    
    }
  }, [selectedClass, selectedSemester, selectedSubject]);

  const fetchallData = async () => {
    // const toastId = toast.loading("Fetching fees...");
    setIsLoading(true);
    try {
      const [classes, subjects, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "class", false),
        fetchData("/api/subjects/allsubjects", "subjects", false),
        // fetchData("/api/students/getstudents", "students"),
        fetchData("/api/semester/all", "semester", false),
      ]);
      setClassesData(classes);
      setSubjectsData(subjects);
      // setStudents(studentsdata);
      setSemesterData(semesterdata[0]);
      // setSelectedSemester(semesterdata[0].semester_id);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentsByClass = async (class_id) => {
    try {
      const data = await fetchData(
        `/api/students/getstudentsbyclass/${class_id}`, '', false
      );
      // if (!response.ok) {
      //   throw new Error("Failed to fetch students");
      // }
      // const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

   const fetchclassgradesdata = async (class_id, semester_id, subject_id) => {
     try {
       const data = await fetchData(
         `/api/grading/fetchstudentsgrade/${class_id}/${semester_id}/${subject_id}`,
         "",
         false
       );
       // if (!response.ok) {
       //   throw new Error("Failed to fetch students");
       // }
       // const data = await response.json();
       console.log("gradesData", data?.grades);
       setGradesData(data);

       setSelectedClass(data?.class_id);
       setSelectedSubject(data?.subject_id);
      //  setSelectedSemester(data?.semester_id);
       setGrades(data?.grades);
       setOriginalData(data?.grades);

     } catch (error) {
       console.error("Error fetching students:", error);
       // Handle error (e.g., show an error message to the user)
     }
   };

  const handleClassChange = (e) => {
    setStudents([]);
    const class_id = e.target.value;
    setSelectedClass(class_id);
    if (class_id) {
      fetchStudentsByClass(class_id);
    } else {
      setStudents([]); // Clear students if no class is selected
    }
  };

   const handleSubjectChange = (e) => {
     setStudents([]);
     const subject_id = e.target.value;
     setSelectedSubject(subject_id);
    //  console.log('subject_id', subject_id)

     if (selectedClass) {
       fetchStudentsByClass(selectedClass);
     } else {
       setStudents([]); // Clear students if no class is selected
     }
   };

  const handleSubmit = (e) => {
    e.preventDefault();
        // console.log(
        //   "selectedSubject",
        //   selectedSubject,
        //   "selectedSemester",
        //   semesterData?.id
        // );

    setIsModalOpen(true);
  };

  const hasChanges = () => {
    return JSON.stringify(grades) !== JSON.stringify(originalData);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      return;
    }

    const toastId = toast.loading(
      id ? "Updating grades..." : "Submitting grades..."
    );
    setIsLoading(true);

    try {
      const url = id
        ? `/api/update-grades/${id}`
        : "/api/grading/addstudentgrades";
      const method = id ? "PUT" : "POST";

      const gradesData = Object.entries(grades).map(
        ([studentId, studentGrades]) => ({
          student_id: parseInt(studentId),
          class_score: parseFloat(studentGrades[1] || 0),
          exams_score: parseFloat(studentGrades[2] || 0),
          total_score:
            parseFloat(studentGrades[1] || 0) +
            parseFloat(studentGrades[2] || 0),
        })
      );

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: parseInt(selectedClass),
          subject_id: parseInt(selectedSubject),
          semester_id: parseInt(semesterData?.id),
          user_id: session.user.id,
          grades: gradesData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit grades");
      }

      const result = await response.json();
      toast.update(toastId, {
        render: result.message,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setGrades({});
        setSelectedClass("");
        setSelectedSubject("");
        setSelectedSemester(activeSem);
      }
      setStudents([]);
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast.update(toastId, {
        render: "Failed to submit grades. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (studentId, assignmentId, grade) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [studentId]: {
        ...prevGrades[studentId],
        [assignmentId]: grade,
      },
    }));
  };

  const calculateTotalGrade = (studentId) => {
    if (!grades[studentId]) return "00";
    const classScore = parseFloat(grades[studentId][1] || 0);
    const examsScore = parseFloat(grades[studentId][2] || 0);
    return (classScore + examsScore).toFixed(2);
  };

  const handleReset = () => {
    setGrades({});
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedSemester(activeSem);
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
        You are not authorised "record assessment" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update Grades?" : "Submit Grades?"}
        message={
          id
            ? "Are you sure you want to update the grades?"
            : "Are you sure you want to submit these grades?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      {/* {students && classesData && subjectsData && selectedSemester? ( */}
      <Addeditstudentgradepage
        assignments={dummyAssignments}
        students={students}
        handleSubmit={handleSubmit}
        handleGradeChange={handleGradeChange}
        handleClassChange={handleClassChange}
        handleSubjectChange={handleSubjectChange}
        grades={grades}
        calculateTotalGrade={calculateTotalGrade}
        setSelectedClass={setSelectedClass}
        setSelectedSubject={setSelectedSubject}
        setSelectedSemester={setSelectedSemester}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        selectedSemester={selectedSemester}
        classesData={classesData?.classes}
        subjectsData={subjectsData}
        semesterData={semesterData}
        handleReset={handleReset}
        gradesData={gradesData}
        setGrades={setGrades}
      />
      {/* // ) : (
      //   <Loadingpage />
      // )} */}
    </>
  );
};

export default Addgrades;

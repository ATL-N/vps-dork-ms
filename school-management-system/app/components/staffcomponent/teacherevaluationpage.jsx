import React, { useState, useMemo } from "react";
import CustomTable from "../../components/listtableForm";

import {
  FaUser,
  FaChalkboardTeacher,
  FaStar,
  FaComments,
  FaChartBar,
  FaGraduationCap,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const TeacherPerformanceEvaluationPage = ({
  formData,
  setFormData,
  teacherData,
  pastEvaluations,
  onSubmit,
  onCancel,
  handleChange,
}) => {
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


  // console.log("pastEvaluations", teacherData);
  // const [formData, setFormData] = useState({
  //   teacher_id: teacherData.id,
  //   evaluation_date: new Date().toISOString().split("T")[0],
  //   overall_rating: "",
  //   teaching_effectiveness: "",
  //   classroom_management: "",
  //   student_engagement: "",
  //   professionalism: "",
  //   comments: "",
  //   years_of_experience: '',
  // });

  // Calculate average ratings from past evaluations
  
  const averageRatings = useMemo(() => {
    let sum
    if (pastEvaluations){
    sum = pastEvaluations?.reduce(
      (acc, evaluation) => {
        acc.teaching_effectiveness += parseFloat(
          evaluation.teaching_effectiveness
        );
        acc.classroom_management += parseFloat(evaluation.classroom_management);
        acc.student_engagement += parseFloat(evaluation.student_engagement);
        acc.professionalism += parseFloat(evaluation.professionalism);
        return acc;
      },
      {
        teaching_effectiveness: 0,
        classroom_management: 0,
        student_engagement: 0,
        professionalism: 0,
      }
    );

    Object.keys(sum).forEach((key) => {
      sum[key] = (sum[key] / pastEvaluations.length).toFixed(2);
    });

    return sum;
  }else{
    sum = 0
    return sum
  }
}, [pastEvaluations]);

  const getRadarData = (averageRatings, currentRatings) => {
    return [
      {
        skill: "Teaching Effectiveness",
        average: parseFloat(averageRatings.teaching_effectiveness),
        current: parseFloat(currentRatings.teaching_effectiveness),
      },
      {
        skill: "Classroom Management",
        average: parseFloat(averageRatings.classroom_management),
        current: parseFloat(currentRatings.classroom_management),
      },
      {
        skill: "Student Engagement",
        average: parseFloat(averageRatings.student_engagement),
        current: parseFloat(currentRatings.student_engagement),
      },
      {
        skill: "Professionalism",
        average: parseFloat(averageRatings.professionalism),
        current: parseFloat(currentRatings.professionalism),
      },
    ];
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onSubmit(formData);
  // };

  const RadarChartComponent = ({ data }) => (
    <div className="w-full p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar
            name="Average Ratings"
            dataKey="average"
            stroke="#0e7490"
            fill="#0e7490"
            fillOpacity={0.2}
          />
          <Radar
            name="Current Evaluation"
            dataKey="current"
            stroke="#ea580c"
            fill="#ea580c"
            fillOpacity={0.2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6">
        Teacher Performance Evaluation
      </h2>

      {/* Teacher Information section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-cyan-600 mb-4">
          Teacher Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <FaUser className="text-cyan-500 mr-2" />
            <span>
              Name: {teacherData.first_name} {teacherData.last_name}
            </span>
          </div>
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-cyan-500 mr-2" />
            <span>Employee ID: {teacherData?.staff_id}</span>
          </div>
          <div className="flex items-center">
            <FaGraduationCap className="text-cyan-500 mr-2" />
            <span>
              Years of Experience:{" "}
              {pastEvaluations
                ? pastEvaluations[0]?.years_of_experience
                : "n/a"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {pastEvaluations ? (
          <div className="overflow-x-auto tableWrap ">
            <CustomTable
              data={pastEvaluations}
              headerNames={headerNames}
              height="20vh"
              displayActions={false}
              displaySearchBar={false}
            />
          </div>
        ) : (
          <div>
            <p>No available past evaluation(s)</p>
          </div>
        )}
      </div>

      {/* Radar Charts */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-cyan-600 mb-4">
          Performance Comparison
        </h3>

        <RadarChartComponent data={getRadarData(averageRatings, formData)} />

        {/* <RadarChartComponent
            data={getRadarData(formData)}
            title="Current Evaluation"
          /> */}
      </div>

      {/* Evaluation Form */}
      <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-cyan-600 mb-4">
          Evaluation Form
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="evaluation_date"
            >
              Evaluation Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                name="evaluation_date"
                id="evaluation_date"
                required
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                value={formData.evaluation_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="years_of_experience"
            >
              Years of Experience
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaStar className="text-gray-400" />
              </div>
              <input
                type="number"
                name="years_of_experience"
                id="years_of_experience"
                required
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                value={formData.years_of_experience}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="overall_rating"
          >
            Overall Rating
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaStar className="text-gray-400" />
            </div>
            <input
              type="number"
              name="overall_rating"
              id="overall_rating"
              readOnly
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 bg-gray-100"
              value={formData.overall_rating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            "teaching_effectiveness",
            "classroom_management",
            "student_engagement",
            "professionalism",
          ].map((field) => (
            <div key={field}>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor={field}
              >
                {field
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaChartBar className="text-gray-400" />
                </div>
                <select
                  name={field}
                  id={field}
                  required
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  value={formData[field]}
                  onChange={handleChange}
                >
                  <option value="">Select Rating</option>
                  <option value="5">Excellent (5)</option>
                  <option value="4">Very Good (4)</option>
                  <option value="3">Good (3)</option>
                  <option value="2">Fair (2)</option>
                  <option value="1">Poor (1)</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="comments"
          >
            Comments
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <FaComments className="text-gray-400" />
            </div>
            <textarea
              name="comments"
              id="comments"
              rows="4"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 min-h-32 max-h-32 "
              placeholder="Provide any additional comments or feedback"
              value={formData.comments}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            title="cancel"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Close
          </button>

          {formData?.overall_rating && (
            <button
              type="submit"
              title="submit evaluation"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Submit Evaluation
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TeacherPerformanceEvaluationPage;

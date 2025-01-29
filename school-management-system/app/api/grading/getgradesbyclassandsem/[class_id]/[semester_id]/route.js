import db from "../../../../../lib/db";
import { NextResponse } from "next/server";

// /api/grading/getgradesbyclassandsem/[class_id]/[semester_id]/route.js
export async function GET(req, { params }) {
  try {
    const { class_id, semester_id } = params;

    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Missing class_id or semester_id parameter" },
        { status: 400 }
      );
    }

    // Get unique subjects for the given class
    const subjectsQuery = `
      SELECT DISTINCT sub.subject_name
      FROM student_grades sg
      JOIN subjects sub ON sg.subject_id = sub.subject_id
      WHERE sg.class_id = $1
      ORDER BY sub.subject_name
    `;
    const subjectsResult = await db.query(subjectsQuery, [class_id]);
    const subjects = subjectsResult.rows.map((row) => row.subject_name);

    // Get student grades and remarks for the class and semester
    const gradesAndRemarksQuery = `
      SELECT 
        s.student_id,
        s.first_name || ' ' || s.last_name AS student_name,
        json_object_agg(sub.subject_name, COALESCE(sg.total_score, 0)) AS grades,
        sr.class_teachers_remark,
        sr.headteachers_remark
      FROM 
        students s
      JOIN 
        student_grades sg ON s.student_id = sg.student_id
      JOIN 
        subjects sub ON sg.subject_id = sub.subject_id
      LEFT JOIN
        student_remarks sr ON s.student_id = sr.student_id
          AND sr.class_id = $1
          AND sr.semester_id = $2
      WHERE 
        sg.class_id = $1
        AND sg.semester_id = $2
      GROUP BY 
        s.student_id, s.first_name, s.last_name, sr.class_teachers_remark, sr.headteachers_remark
    `;

    const gradesAndRemarksResult = await db.query(gradesAndRemarksQuery, [
      class_id,
      semester_id,
    ]);

    // Calculate class average for each subject
    const classAverageQuery = `
      SELECT 
        sub.subject_name,
        AVG(COALESCE(sg.total_score, 0)) AS average_score
      FROM 
        student_grades sg
      JOIN 
        subjects sub ON sg.subject_id = sub.subject_id
      WHERE 
        sg.class_id = $1
        AND sg.semester_id = $2
      GROUP BY 
        sub.subject_name
    `;

    const classAverageResult = await db.query(classAverageQuery, [
      class_id,
      semester_id,
    ]);

    const classAverage = {};
    classAverageResult.rows.forEach((row) => {
      classAverage[row.subject_name] = parseFloat(row.average_score);
    });

    const formattedResults = gradesAndRemarksResult.rows.map((row) => {
      const studentGrades = {};
      subjects.forEach((subject) => {
        studentGrades[subject] = row.grades[subject] || 0;
      });

      return {
        id: row.student_id,
        name: row.student_name,
        grades: studentGrades,
        teacherRemark: row.class_teachers_remark || "",
        headteacherRemark: row.headteachers_remark || "",
      };
    });

    return NextResponse.json(
      {
        subjects: subjects,
        students: formattedResults,
        classAverage: classAverage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student grades and remarks:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

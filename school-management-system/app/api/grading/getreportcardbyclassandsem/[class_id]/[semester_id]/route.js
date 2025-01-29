import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const { class_id, semester_id } = params;

    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Class ID and Semester ID are required" },
        { status: 400 }
      );
    }

    console.log("starting query...");

    const query = `
      WITH semester_class_students AS (
        SELECT DISTINCT student_id
        FROM student_grades
        WHERE class_id = $1 
        AND semester_id = $2 
        AND status = 'active'
      ),
      class_subjects AS (
        SELECT DISTINCT s.subject_id, s.subject_name
        FROM subjects s
        JOIN student_grades sg ON s.subject_id = sg.subject_id
        WHERE sg.class_id = $1 
        AND sg.semester_id = $2 
        AND sg.status = 'active'
      ),
      student_averages AS (
        SELECT 
          sg.student_id,
          AVG(sg.total_score) as average_score,
          SUM(sg.total_score) as total_score,
          RANK() OVER (ORDER BY SUM(sg.total_score) DESC) as overall_position
        FROM student_grades sg
        WHERE sg.class_id = $1 
        AND sg.semester_id = $2 
        AND sg.status = 'active'
        GROUP BY sg.student_id
      ),
      student_subject_grades AS (
        SELECT 
          s.student_id,
          cs.subject_name,
          COALESCE(sg.class_score, 0) as class_score,
          COALESCE(sg.exams_score, 0) as exams_score,
          COALESCE(sg.total_score, 0) as grade,
          COALESCE(gs.grade_remark, '-') as remark,
          RANK() OVER (PARTITION BY cs.subject_name ORDER BY sg.total_score DESC NULLS LAST) as subject_position
        FROM students s
        CROSS JOIN class_subjects cs
        LEFT JOIN student_grades sg ON s.student_id = sg.student_id 
          AND cs.subject_id = sg.subject_id
          AND sg.class_id = $1 
          AND sg.semester_id = $2 
          AND sg.status = 'active'
        LEFT JOIN grading_scheme gs ON sg.gradescheme_id = gs.gradescheme_id
        WHERE s.student_id IN (SELECT student_id FROM semester_class_students)
      ),
      student_teacher_remarks AS (
        SELECT 
          sr.student_id,
          sr.class_teachers_remark,
          sr.headteachers_remark
        FROM student_remarks sr
        WHERE sr.class_id = $1 
        AND sr.semester_id = $2
      ),
      total_students AS (
        SELECT COUNT(DISTINCT student_id) as count
        FROM semester_class_students
      ),
      student_attendance AS (
        SELECT 
          student_id,
          COUNT(*) as total_attendance
        FROM attendance
        WHERE class_id = $1 
        AND semester_id = $2 
        AND status = 'present'
        GROUP BY student_id
      ),
      semester_attendance AS (
        SELECT COUNT(DISTINCT attendance_date) as total_semester_attendance
        FROM attendance
        WHERE class_id = $1 
        AND semester_id = $2
      )
      SELECT 
        s.student_id as id,
        CONCAT(s.first_name, ' ', s.last_name) as name,
        s.email,
        c.class_name as historical_class_name,
        COALESCE(ROUND(sa.average_score::numeric, 2), 0) as average,
        COALESCE(ROUND(sa.total_score::numeric, 2), 0) as total,
        COALESCE(sa.overall_position, 0) as overall_position,
        json_object_agg(
          ssg.subject_name, 
          json_build_object(
            'class_score', CASE WHEN ssg.class_score = 0 THEN '-' ELSE ssg.class_score::text END,
            'exams_score', CASE WHEN ssg.exams_score = 0 THEN '-' ELSE ssg.exams_score::text END,
            'grade', CASE WHEN ssg.grade = 0 THEN '-' ELSE ssg.grade::text END,
            'remark', ssg.remark,
            'position', CASE WHEN ssg.grade = 0 THEN '-' ELSE ssg.subject_position::text END
          )
        ) as grades,
        str.class_teachers_remark,
        str.headteachers_remark,
        ts.count as total_students,
        COALESCE(sta.total_attendance, 0) as student_attendance,
        sea.total_semester_attendance,
        (
          SELECT c2.class_name 
          FROM students s2 
          JOIN classes c2 ON s2.class_id = c2.class_id 
          WHERE s2.student_id = s.student_id
        ) as current_class_name,
        CASE 
          WHEN s.class_promoted_to IS NOT NULL THEN (
            SELECT c3.class_name 
            FROM classes c3 
            WHERE c3.class_id = s.class_promoted_to
          )
          ELSE NULL 
        END as promoted_to_class
      FROM students s
      JOIN semester_class_students scs ON s.student_id = scs.student_id
      JOIN classes c ON c.class_id = $1  -- Join with the historical class
      LEFT JOIN student_averages sa ON s.student_id = sa.student_id
      LEFT JOIN student_subject_grades ssg ON s.student_id = ssg.student_id
      LEFT JOIN student_teacher_remarks str ON s.student_id = str.student_id
      LEFT JOIN student_attendance sta ON s.student_id = sta.student_id
      CROSS JOIN total_students ts
      CROSS JOIN semester_attendance sea
      GROUP BY s.student_id, s.first_name, s.last_name, s.email, c.class_name, sa.average_score, sa.total_score, 
               sa.overall_position, str.class_teachers_remark, str.headteachers_remark, ts.count,
               sta.total_attendance, sea.total_semester_attendance, s.class_promoted_to
      ORDER BY sa.total_score DESC NULLS LAST, s.last_name, s.first_name
    `;

    const result = await db.query(query, [class_id, semester_id]);
    console.log("Ended query...");

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          students: [],
          totalStudents: 0,
          totalSemesterAttendance: 0,
          className: null,
        },
        { status: 200 }
      );
    }

    const totalStudents = result.rows[0].total_students;
    const totalSemesterAttendance = result.rows[0].total_semester_attendance;
    const className = result.rows[0].historical_class_name;

    const students = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      historicalClassName: row.historical_class_name,
      currentClassName: row.current_class_name,
      promotedToClass: row.promoted_to_class,
      average: parseFloat(row.average),
      total: parseFloat(row.total),
      overallPosition: parseInt(row.overall_position),
      grades: row.grades,
      remarks: {
        classTeacherRemark: row.class_teachers_remark || null,
        headTeacherRemark: row.headteachers_remark || null,
      },
      attendance: {
        studentAttendance: parseInt(row.student_attendance),
        totalSemesterAttendance: parseInt(row.total_semester_attendance),
      },
    }));

    return NextResponse.json(
      {
        students,
        totalStudents,
        totalSemesterAttendance,
        className,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

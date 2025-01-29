import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

// /api/attendance/getattendance/1/1

export async function GET(req, { params }) {
  try {
    const { class_id, semester_id } = params;
    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Class ID and Semester ID are required" },
        { status: 400 }
      );
    }

    const currentDate = new Date().toISOString().slice(0, 10);

    // Semester dates query
    const semesterDatesQuery = `
      SELECT start_date, end_date
      FROM semesters
      WHERE semester_id = $1
    `;

    // First, get the semester dates
    const semesterDatesResult = await db.query(semesterDatesQuery, [
      semester_id,
    ]);

    if (semesterDatesResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      );
    }

    const { start_date, end_date } = semesterDatesResult.rows[0];

    // Attendance Query for current date
    const attendanceQuery = `
      SELECT 
        status, 
        COUNT(*) as count
      FROM 
        attendance
      WHERE 
        class_id = $1 AND 
        semester_id = $2 AND
        attendance_date = $3
      GROUP BY 
        status
      ORDER BY 
        CASE 
          WHEN status = 'present' THEN 1
          WHEN status = 'late' THEN 2
          WHEN status = 'absent' THEN 3
          ELSE 4
        END
    `;

    // Semester Attendance Query
    const semesterAttendanceQuery = `
      SELECT 
        status, 
        COUNT(*) as count
      FROM 
        attendance
      WHERE 
        class_id = $1 AND 
        semester_id = $2 AND
        attendance_date BETWEEN $3 AND $4
      GROUP BY 
        status
    `;

    // Performance Query
    const performanceQuery = `
      SELECT 
        s.subject_name as subject,
        ROUND(AVG(sg.total_score), 2) as averageScore
      FROM 
        student_grades sg
      JOIN
        subjects s ON sg.subject_id = s.subject_id
      WHERE 
        sg.class_id = $1 AND 
        sg.semester_id = $2 AND
        sg.status = 'active'
      GROUP BY 
        s.subject_name
      ORDER BY 
        averageScore DESC
    `;

    // Class Info Query
    const classInfoQuery = `
      SELECT 
        c.class_name,
        COUNT(DISTINCT s.student_id) AS total_students,
        COUNT(DISTINCT sub.subject_id) AS total_subjects
      FROM 
        classes c
      LEFT JOIN students s ON s.class_id = c.class_id AND s.status = 'active'
      CROSS JOIN subjects sub
      WHERE 
        c.class_id = $1 AND
        c.status = 'active'
      GROUP BY 
        c.class_name
    `;

    const [
      attendanceResult,
      semesterAttendanceResult,
      performanceResult,
      classInfoResult,
    ] = await Promise.all([
      db.query(attendanceQuery, [class_id, semester_id, currentDate]),
      db.query(semesterAttendanceQuery, [
        class_id,
        semester_id,
        start_date,
        end_date,
      ]),
      db.query(performanceQuery, [class_id, semester_id]),
      db.query(classInfoQuery, [class_id]),
    ]);

    // Process attendance data for current date
    const statuses = ["present", "absent", "late"];
    const attendanceData = statuses.map((status) => {
      const found = attendanceResult.rows.find((row) => row.status === status);
      return found
        ? { status, count: parseInt(found.count) }
        : { status, count: 0 };
    });

    // Process semester attendance data
    const semesterAttendanceData = semesterAttendanceResult.rows.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      },
      {}
    );

    const totalSemesterAttendance = Object.values(
      semesterAttendanceData
    ).reduce((sum, count) => sum + count, 0);
    const presentSemesterAttendance = semesterAttendanceData.present || 0;
    const attendancePercentage =
      totalSemesterAttendance > 0
        ? Math.round(
            (presentSemesterAttendance / totalSemesterAttendance) * 100
          )
        : 0;

    // Process performance data
    const performanceData = performanceResult.rows.map((row) => ({
      subject: row.subject,
      averageScore: parseFloat(row.averagescore),
    }));

    // Process class info
    const {
      rows: [classInfo],
    } = classInfoResult;
    const { class_name, total_students, total_subjects } = classInfo;

    const averagePerformance =
      performanceData.reduce((sum, row) => sum + row.averageScore, 0) /
      performanceData.length;

    return NextResponse.json(
      {
        attendanceData,
        attendancePercentage,
        performanceData,
        averagePerformance,
        className: class_name,
        totalStudents: total_students,
        totalSubjects: total_subjects,
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

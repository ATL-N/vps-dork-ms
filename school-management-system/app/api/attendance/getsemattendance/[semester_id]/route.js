import { NextResponse } from "next/server";
import db from "../../../../lib/db";


// /api/attendance/getsemattendance/1

export async function GET(req, { params }) {
  try {
    const { semester_id } = params;
    if (!semester_id) {
      return NextResponse.json(
        { error: "Semester ID is required" },
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

    // School-wide attendance query for current date
    const currentAttendanceQuery = `
      SELECT 
        c.class_id,
        c.class_name,
        COUNT(DISTINCT s.student_id) AS class_count,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN s.student_id END) AS present,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN s.student_id END) AS absent
      FROM 
        classes c
      LEFT JOIN students s ON s.class_id = c.class_id AND s.status = 'active'
      LEFT JOIN attendance a ON a.student_id = s.student_id AND a.attendance_date = $1 AND a.semester_id = $2
      WHERE 
        c.status = 'active'
      GROUP BY 
        c.class_id, c.class_name
      ORDER BY 
        c.class_name, c.class_level
    `;

    // School-wide attendance query for the entire semester
    const semesterAttendanceQuery = `
      SELECT 
        c.class_id,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS total_present,
        COUNT(a.attendance_id) AS total_attendance
      FROM 
        classes c
      LEFT JOIN students s ON s.class_id = c.class_id AND s.status = 'active'
      LEFT JOIN attendance a ON a.student_id = s.student_id 
        AND a.attendance_date BETWEEN $1 AND $2 
        AND a.semester_id = $3
      WHERE 
        c.status = 'active'
      GROUP BY 
        c.class_id
    `;

    // Total active students query
    const totalStudentsQuery = `
      SELECT COUNT(*) AS total_active_students
      FROM students
      WHERE status = 'active'
    `;

    const [
      currentAttendanceResult,
      semesterAttendanceResult,
      totalStudentsResult,
    ] = await Promise.all([
      db.query(currentAttendanceQuery, [currentDate, semester_id]),
      db.query(semesterAttendanceQuery, [start_date, end_date, semester_id]),
      db.query(totalStudentsQuery),
    ]);

    // Process attendance data
    const attendanceData = currentAttendanceResult.rows.map((row) => {
      const semesterData = semesterAttendanceResult.rows.find(
        (sr) => sr.class_id === row.class_id
      );
      const attendanceRate =
        semesterData && semesterData.total_attendance > 0
          ? (
              (semesterData.total_present / semesterData.total_attendance) *
              100
            ).toFixed(2)
          : 0;

      return {
        id: row.class_id,
        class: row.class_name,
        class_count: parseInt(row.class_count),
        present: parseInt(row.present),
        absent: parseInt(row.absent),
        attendanceRate: parseFloat(attendanceRate),
      };
    });

    // Calculate school-wide statistics
    const totalActiveStudents = parseInt(
      totalStudentsResult.rows[0].total_active_students
    );
    const totalPresent = attendanceData.reduce(
      (sum, row) => sum + row.present,
      0
    );
    const totalAbsent = attendanceData.reduce(
      (sum, row) => sum + row.absent,
      0
    );

    const totalSemesterAttendance = semesterAttendanceResult.rows.reduce(
      (sum, row) => sum + parseInt(row.total_attendance),
      0
    );
    const totalSemesterPresent = semesterAttendanceResult.rows.reduce(
      (sum, row) => sum + parseInt(row.total_present),
      0
    );
    const averageAttendance =
      totalSemesterAttendance > 0
        ? ((totalSemesterPresent / totalSemesterAttendance) * 100).toFixed(2)
        : 0;

    return NextResponse.json(
      {
        totalActiveStudents,
        totalPresentToday: totalPresent,
        totalAbsentToday: totalAbsent,
        averageAttendanceForSemester: parseFloat(averageAttendance),
        attendanceData,
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

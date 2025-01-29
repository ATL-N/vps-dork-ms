import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

// /api/attendance/getstudentattendance/[user_id]/[semester_id]
// /api/attendance/getstudentattendance
export async function GET(req, { params }) {
  try {
    const { user_id, semester_id } = params;
    if (!user_id || !semester_id) {
      return NextResponse.json(
        { error: "User ID and Semester ID are required" },
        { status: 400 }
      );
    }

    // Student Info Query
    const studentInfoQuery = `
      SELECT 
        s.student_id, s.first_name, s.last_name, s.date_of_birth,
        s.gender, s.enrollment_date, c.class_name, c.class_id
      FROM 
        students s
      JOIN
        classes c ON s.class_id = c.class_id
      WHERE 
        s.user_id = $1 AND s.status = 'active'
    `;

    // Updated Grade Data Query
    const gradeDataQuery = `
      WITH class_subjects AS (
        SELECT DISTINCT s.subject_id, s.subject_name
        FROM subjects s
        JOIN student_grades sg ON s.subject_id = sg.subject_id
        JOIN students stu ON sg.student_id = stu.student_id
        WHERE stu.class_id = (SELECT class_id FROM students WHERE user_id = $1)
          AND sg.semester_id = $2
      ),
      student_grades AS (
        SELECT 
          sg.subject_id,
          CAST(AVG(sg.total_score) AS DECIMAL(10,2)) as grade
        FROM 
          student_grades sg
        JOIN
          students s ON sg.student_id = s.student_id
        WHERE 
          s.user_id = $1 AND 
          sg.semester_id = $2 AND
          sg.status = 'active'
        GROUP BY 
          sg.subject_id
      )
      SELECT 
        cs.subject_name as subject,
        COALESCE(sg.grade, 0) as grade
      FROM 
        class_subjects cs
      LEFT JOIN
        student_grades sg ON cs.subject_id = sg.subject_id
      ORDER BY 
        cs.subject_name
    `;

    // Updated Attendance Data Query with overall attendance rate
    const attendanceDataQuery = `
      WITH attendance_data AS (
        SELECT 
          DATE_TRUNC('month', a.attendance_date) AS month,
          COUNT(*) AS total_days,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_days
        FROM 
          attendance a
        JOIN
          students s ON a.student_id = s.student_id
        WHERE 
          s.user_id = $1 AND 
          a.semester_id = $2
        GROUP BY 
          DATE_TRUNC('month', a.attendance_date)
      ),
      monthly_attendance AS (
        SELECT 
          TO_CHAR(month, 'Mon') AS month,
          CAST((present_days::float / total_days) * 100 AS DECIMAL(10,2)) AS attendance
        FROM 
          attendance_data
      ),
      overall_attendance AS (
        SELECT 
          CAST((SUM(present_days)::float / SUM(total_days)) * 100 AS DECIMAL(10,2)) AS overall_rate
        FROM 
          attendance_data
      )
      SELECT 
        (SELECT overall_rate FROM overall_attendance) AS overall_attendance_rate,
        json_agg(json_build_object('month', month, 'attendance', attendance) ORDER BY month) AS monthly_attendance
      FROM 
        monthly_attendance
    `;

    // Updated Schedule Query with lesson duration calculation
    const scheduleQuery = `
      WITH lesson_durations AS (
        SELECT 
          t.day_of_week,
          t.start_time,
          t.end_time,
          s.subject_name,
          CONCAT(st.first_name, ' ', st.last_name) as teacher_name,
          EXTRACT(EPOCH FROM (t.end_time - t.start_time)) / 3600 AS duration_hours
        FROM 
          timetable t
        JOIN
          subjects s ON t.subject_id = s.subject_id
        JOIN
          staff st ON t.teacher_id = st.staff_id
        JOIN
          students stu ON t.class_id = stu.class_id
        WHERE 
          stu.user_id = $1 AND 
          t.semester_id = $2
      )
      SELECT 
        json_agg(
          json_build_object(
            'day', day_of_week,
            'startTime', start_time,
            'endTime', end_time,
            'subject', subject_name,
            'teacher', teacher_name
          ) ORDER BY
          CASE
            WHEN day_of_week = 'Monday' THEN 1
            WHEN day_of_week = 'Tuesday' THEN 2
            WHEN day_of_week = 'Wednesday' THEN 3
            WHEN day_of_week = 'Thursday' THEN 4
            WHEN day_of_week = 'Friday' THEN 5
            WHEN day_of_week = 'Saturday' THEN 6
            WHEN day_of_week = 'Sunday' THEN 7
          END,
          start_time
        ) AS schedule_data,
        SUM(duration_hours) AS total_weekly_hours
      FROM 
        lesson_durations
    `;

    const [
      studentInfoResult,
      gradeDataResult,
      attendanceDataResult,
      scheduleResult,
    ] = await Promise.all([
      db.query(studentInfoQuery, [user_id]),
      db.query(gradeDataQuery, [user_id, semester_id]),
      db.query(attendanceDataQuery, [user_id, semester_id]),
      db.query(scheduleQuery, [user_id, semester_id]),
    ]);

    if (studentInfoResult.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const studentInfo = studentInfoResult.rows[0];

    // Process grade data
    const gradeData = gradeDataResult.rows.map((row) => ({
      subject: row.subject,
      grade: parseFloat(row.grade),
    }));

    // Process attendance data
    const { overall_attendance_rate, monthly_attendance } =
      attendanceDataResult.rows[0];
    const attendanceData = {
      overallRate: parseFloat(overall_attendance_rate),
      monthlyData: monthly_attendance,
    };

    // Calculate average performance
    const averagePerformance =
      gradeData.length > 0
        ? gradeData.reduce((sum, row) => sum + row.grade, 0) / gradeData.length
        : 0;

    // Process schedule data
    const { schedule_data, total_weekly_hours } = scheduleResult.rows[0];
    const scheduleData = {
      weeklySchedule: schedule_data,
      totalWeeklyHours: parseFloat(total_weekly_hours),
    };

    return NextResponse.json(
      {
        studentInfo,
        gradeData,
        attendanceData,
        averagePerformance,
        scheduleData,
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

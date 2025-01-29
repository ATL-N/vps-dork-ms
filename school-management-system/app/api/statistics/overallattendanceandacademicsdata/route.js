import { NextResponse } from "next/server";
import db from "../../../lib/db";

// GET /api/statistics/overallattendanceandacademicsdata
export async function GET(req) {
  try {

    // Fetch student count and gender distribution
    const studentCountQuery = `
      SELECT 
        COUNT(*) AS total_students,
        COUNT(*) FILTER (WHERE gender = 'Male') AS male_count,
        COUNT(*) FILTER (WHERE gender = 'Female') AS female_count
      FROM students
      WHERE status = 'active'
    `;
    const studentCountResult = await db.query(studentCountQuery);
    const studentCountData = studentCountResult.rows[0];

    // Fetch overall school attendance data
    const attendanceQuery = `
      WITH daily_attendance AS (
        SELECT 
          TO_CHAR(attendance_date, 'DD/MM/YYYY') AS attendance_date,
          attendance_date,
          COUNT(*) FILTER (WHERE status = 'present') AS present_count,
          COUNT(*) FILTER (WHERE status = 'absent') AS absent_count,
          COUNT(*) FILTER (WHERE status = 'late') AS late_count,
          COUNT(*) AS total_count
        FROM attendance
        GROUP BY attendance_date
      )
      SELECT 
        AVG(present_count * 100.0 / total_count) AS average_attendance_rate,
        AVG(present_count) AS average_daily_present,
        AVG(absent_count) AS average_daily_absent,
        AVG(late_count) AS average_daily_late,
        SUM(present_count) AS total_present,
        SUM(absent_count) AS total_absent,
        SUM(late_count) AS total_late,
        SUM(total_count) AS total_attendance_records
      FROM daily_attendance
    `;
    const attendanceResult = await db.query(attendanceQuery);
    const attendanceData = attendanceResult.rows[0];

    // Fetch attendance trends (last 30 days)
    const attendanceTrendQuery = `
      SELECT 
        TO_CHAR(attendance_date, 'DD/MM/YYYY') AS attendance_date,
        COUNT(*) FILTER (WHERE status = 'present') AS present_count,
        COUNT(*) FILTER (WHERE status = 'absent') AS absent_count,
        COUNT(*) FILTER (WHERE status = 'late') AS late_count
      FROM attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY attendance_date
      ORDER BY attendance_date
    `;
    const attendanceTrendResult = await db.query(attendanceTrendQuery);
    const attendanceTrend = attendanceTrendResult.rows;

    // Fetch attendance by class
    const attendanceByClassQuery = `
      SELECT 
        c.class_name,
        AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 AS attendance_rate,
        COUNT(DISTINCT a.student_id) AS total_students
      FROM 
        attendance a
      JOIN 
        classes c ON a.class_id = c.class_id
      WHERE c.status='active' AND c.class_id != '1'
      GROUP BY 
        c.class_id, c.class_name
      ORDER BY 
        attendance_rate DESC
    `;
    const attendanceByClassResult = await db.query(attendanceByClassQuery);
    const attendanceByClass = attendanceByClassResult.rows;

    // Fetch overall academic performance data
    const academicQuery = `
      WITH student_averages AS (
        SELECT 
          student_id,
          AVG(total_score) AS average_score
        FROM 
          student_grades
        GROUP BY 
          student_id
      )
      SELECT 
        AVG(average_score) AS school_average_score,
        MIN(average_score) AS lowest_average_score,
        MAX(average_score) AS highest_average_score,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY average_score) AS median_score
      FROM 
        student_averages
    `;
    const academicResult = await db.query(academicQuery);
    const academicData = academicResult.rows[0];

    // Fetch academic performance by subject
    const subjectPerformanceQuery = `
      SELECT 
        s.subject_name,
        AVG(sg.total_score) AS average_score,
        MIN(sg.total_score) AS lowest_score,
        MAX(sg.total_score) AS highest_score
      FROM 
        student_grades sg
      JOIN 
        subjects s ON sg.subject_id = s.subject_id
      WHERE s.status='active'
      GROUP BY 
        s.subject_id, s.subject_name
      ORDER BY 
        average_score DESC
      
    `;
    const subjectPerformanceResult = await db.query(subjectPerformanceQuery);
    const subjectPerformance = subjectPerformanceResult.rows;

    // Fetch academic performance by class
    const classPerformanceQuery = `
      SELECT 
        c.class_name,
        AVG(sg.total_score) AS average_score,
        MIN(sg.total_score) AS lowest_score,
        MAX(sg.total_score) AS highest_score
      FROM 
        student_grades sg
      JOIN 
        classes c ON sg.class_id = c.class_id
      WHERE c.status='active' AND c.class_id != '1'
      GROUP BY 
        c.class_id, c.class_name
      ORDER BY 
        average_score DESC
    `;
    const classPerformanceResult = await db.query(classPerformanceQuery);
    const classPerformance = classPerformanceResult.rows;

    // Fetch grade distribution
    const gradeDistributionQuery = `
      SELECT 
        gs.grade_name,
        COUNT(*) AS count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percentage
      FROM 
        student_grades sg
      JOIN 
        grading_scheme gs ON sg.gradescheme_id = gs.gradescheme_id
      GROUP BY 
        gs.grade_name
      ORDER BY 
        gs.grade_name
    `;
    const gradeDistributionResult = await db.query(gradeDistributionQuery);
    const gradeDistribution = gradeDistributionResult.rows;

    // Combine all data
    const schoolData = {
      studentCount: studentCountData,
      attendance: {
        overall: attendanceData,
        trend: attendanceTrend,
        byClass: attendanceByClass,
      },
      academic: {
        overall: academicData,
        bySubject: subjectPerformance,
        byClass: classPerformance,
        gradeDistribution: gradeDistribution,
      },
    };

    return NextResponse.json(schoolData, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export const dynamic = "force-dynamic";

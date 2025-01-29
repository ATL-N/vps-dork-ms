import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/parents/getparentsdetailswithuserid/[userId]
export async function GET(req, { params }) {
  try {
    const userId = params.userId;

    // Get parent_id from user_id
    const getParentIdQuery = `
      SELECT parent_id 
      FROM parents 
      WHERE user_id = $1 AND status = 'active'
      LIMIT 1
    `;
    const {
      rows: [parentRow],
    } = await db.query(getParentIdQuery, [userId]);

    if (!parentRow) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const parentId = parentRow.parent_id;

    // Get current semester
    const currentSemesterQuery = `
      SELECT semester_id 
      FROM semesters 
      WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE 
      AND status = 'active'
      LIMIT 1
    `;
    const {
      rows: [currentSemester],
    } = await db.query(currentSemesterQuery);
    const semesterId = currentSemester?.semester_id;

    // Get parent's children basic info and fees
    const childrenQuery = `
      SELECT DISTINCT 
        s.student_id as "ID",
        s.first_name || ' ' || s.last_name as name,
        c.class_name as class,
        COALESCE(s.amountowed, 0) as amount_owed
      FROM students s
      JOIN student_parent sp ON s.student_id = sp.student_id
      JOIN classes c ON s.class_id = c.class_id
      WHERE sp.parent_id = $1 AND s.status = 'active'
    `;

    // Get children's performance (grades) with overall average
    const performanceQuery = `
      WITH student_names AS (
        SELECT 
          s.student_id,
          s.first_name || ' ' || s.last_name as name
        FROM students s
        JOIN student_parent sp ON s.student_id = sp.student_id
        WHERE sp.parent_id = $1 AND s.status = 'active'
      ),
      student_subject_scores AS (
        SELECT 
          sn.name,
          sub.subject_name,
          COALESCE(sg.total_score, 0) as score
        FROM student_names sn
        CROSS JOIN subjects sub
        LEFT JOIN student_grades sg ON 
          sg.student_id = sn.student_id AND 
          sg.subject_id = sub.subject_id AND
          sg.semester_id = $2
        WHERE sub.status = 'active'
      ),
      student_averages AS (
        SELECT
          name,
          json_object_agg(subject_name, score) as subjects,
          ROUND(AVG(score)::numeric, 2) as student_average
        FROM student_subject_scores
        GROUP BY name
      )
      SELECT 
        json_agg(
          json_build_object(
            'name', name,
            'subjects', subjects,
            'average', student_average
          )
        ) as student_grades,
        ROUND(AVG(student_average)::numeric, 2) as overall_average
      FROM student_averages
    `;

    // Get attendance data for last 5 months with overall rate
    const attendanceQuery = `
      WITH RECURSIVE months AS (
        SELECT 
          generate_series(
            date_trunc('month', CURRENT_DATE - interval '4 month'),
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
          )::date as month_date,
          TO_CHAR(
            generate_series(
              date_trunc('month', CURRENT_DATE - interval '4 month'),
              date_trunc('month', CURRENT_DATE),
              '1 month'::interval
            )::date,
            'Mon'
          ) as month_name
      ),
      student_names AS (
        SELECT 
          s.student_id,
          s.first_name || ' ' || s.last_name as name
        FROM students s
        JOIN student_parent sp ON s.student_id = sp.student_id
        WHERE sp.parent_id = $1 AND s.status = 'active'
      ),
      attendance_data AS (
        SELECT 
          m.month_name,
          sn.name,
          COUNT(a.attendance_date) as total_days,
          COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_days,
          ROUND(
            CASE 
              WHEN COUNT(a.attendance_date) = 0 THEN 0
              ELSE COUNT(CASE WHEN a.status = 'Present' THEN 1 END)::DECIMAL * 100 / COUNT(a.attendance_date)
            END,
            1
          ) as attendance_rate
        FROM months m
        CROSS JOIN student_names sn
        LEFT JOIN attendance a ON 
          a.student_id = sn.student_id AND 
          date_trunc('month', a.attendance_date) = m.month_date
        GROUP BY m.month_name, sn.name
      ),
      monthly_attendance AS (
        SELECT 
          month_name,
          json_object_agg(name, attendance_rate) as attendance_rates
        FROM attendance_data
        GROUP BY month_name
      )
      SELECT 
        (
          SELECT json_agg(
            json_build_object(
              'month', month_name,
              'attendance', attendance_rates
            )
            ORDER BY to_date(month_name, 'Mon')
          )
          FROM monthly_attendance
        ) as monthly_data,
        ROUND(
          AVG(attendance_rate)::numeric,
          1
        ) as overall_attendance_rate
      FROM attendance_data
    `;

    // Get upcoming events
    const eventsQuery = `
      SELECT 
        TO_CHAR(event_date, 'YYYY-MM-DD') as date,
        event_title as event
      FROM events
      WHERE 
        event_date >= CURRENT_DATE AND
        status = 'active' AND
        (target_audience = 'parents' OR target_audience = 'all')
      ORDER BY event_date, start_time
      LIMIT 5
    `;

    // Execute all queries in parallel
    const [childrenResult, performanceResult, attendanceResult, eventsResult] =
      await Promise.all([
        db.query(childrenQuery, [parentId]),
        db.query(performanceQuery, [parentId, semesterId]),
        db.query(attendanceQuery, [parentId]),
        db.query(eventsQuery),
      ]);

    // Calculate total fees owed
    const totalFeesOwed = childrenResult.rows.reduce(
      (sum, child) => sum + parseFloat(child.amount_owed || 0),
      0
    );

    return NextResponse.json(
      {
        students: childrenResult.rows, // Now includes amount_owed for each student
        childrenPerformance: performanceResult.rows[0]?.student_grades || [],
        overallAverage: performanceResult.rows[0]?.overall_average || 0,
        attendanceData: attendanceResult.rows[0]?.monthly_data || [],
        overallAttendanceRate:
          attendanceResult.rows[0]?.overall_attendance_rate || 0,
        totalFeesOwed: parseFloat(totalFeesOwed.toFixed(2)),
        upcomingEvents: eventsResult.rows,
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

export const dynamic = "force-dynamic";

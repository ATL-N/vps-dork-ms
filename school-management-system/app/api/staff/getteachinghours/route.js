import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const semesterId = searchParams.get("semesterId");

  if (!userId || !semesterId) {
    return NextResponse.json(
      { error: "Both userId and semesterId are required" },
      { status: 400 }
    );
  }

  try {
    const query = `
      WITH teacher_schedule AS (
        SELECT 
          t.teacher_id,
          t.day_of_week,
          t.start_time,
          t.end_time,
          t.class_id,
          EXTRACT(EPOCH FROM (t.end_time - t.start_time)) / 3600 AS hours_per_day
        FROM 
          timetable t
        JOIN 
          staff s ON t.teacher_id = s.staff_id
        WHERE 
          s.user_id = $1 AND t.semester_id = $2
      ),
      student_count AS (
        SELECT 
          ts.teacher_id,
          COUNT(DISTINCT s.student_id) AS total_students
        FROM 
          teacher_schedule ts
        JOIN 
          students s ON ts.class_id = s.class_id
        WHERE 
          s.status = 'active'
        GROUP BY 
          ts.teacher_id
      ),
      class_count AS (
        SELECT 
          teacher_id,
          COUNT(DISTINCT class_id) AS total_classes
        FROM 
          teacher_schedule
        GROUP BY 
          teacher_id
      ),
      period_count AS (
        SELECT 
          teacher_id,
          COUNT(*) AS total_periods
        FROM 
          teacher_schedule
        GROUP BY 
          teacher_id
      )
      SELECT
        s.*,
        u.user_email,
        hr.medical_conditions,
        hr.allergies,
        hr.vaccination_status,
        TO_CHAR(hr.last_physical_exam_date, 'YYYY-MM-DD') as last_physical_exam_date,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') as date_of_birth,
        TO_CHAR(s.date_of_joining, 'YYYY-MM-DD') as date_of_joining,
        COALESCE(SUM(ts.hours_per_day), 0) AS total_hours_per_week,
        COALESCE(sc.total_students, 0) AS total_students,
        COALESCE(cc.total_classes, 0) AS total_classes,
        COALESCE(pc.total_periods, 0) AS total_periods_per_week,
        json_agg(
          DISTINCT jsonb_build_object(
            'day', ts.day_of_week,
            'startTime', TO_CHAR(ts.start_time, 'HH24:MI'),
            'endTime', TO_CHAR(ts.end_time, 'HH24:MI'),
            'hoursPerDay', ts.hours_per_day
          )
        ) FILTER (WHERE ts.teacher_id IS NOT NULL) as weekly_schedule
      FROM
        staff s
      LEFT JOIN
        users u ON s.user_id = u.user_id
      LEFT JOIN
        user_health_record hr ON s.user_id = hr.user_id
      LEFT JOIN
        teacher_schedule ts ON s.staff_id = ts.teacher_id
      LEFT JOIN
        student_count sc ON s.staff_id = sc.teacher_id
      LEFT JOIN
        class_count cc ON s.staff_id = cc.teacher_id
      LEFT JOIN
        period_count pc ON s.staff_id = pc.teacher_id
      WHERE
        s.user_id = $1
      GROUP BY
        s.staff_id, u.user_email, hr.medical_conditions, hr.allergies, hr.vaccination_status, hr.last_physical_exam_date, sc.total_students, cc.total_classes, pc.total_periods
    `;

    const { rows } = await db.query(query, [userId, semesterId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Format the staff data
    const staffData = {
      ...rows[0],
      total_hours_per_week: parseFloat(rows[0].total_hours_per_week).toFixed(2),
      total_students: parseInt(rows[0].total_students),
      total_classes: parseInt(rows[0].total_classes),
      total_periods_per_week: parseInt(rows[0].total_periods_per_week),
      weekly_schedule: rows[0].weekly_schedule || [],
    };

    return NextResponse.json(staffData, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

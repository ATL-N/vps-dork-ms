import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/staff/staffuserdetails/[id]

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const query = `
      SELECT
        s.*,
        u.user_email,
        hr.medical_conditions,
        hr.allergies,
        hr.vaccination_status,
        hr.last_physical_exam_date,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') as formatted_date_of_birth,
        TO_CHAR(s.date_of_joining, 'YYYY-MM-DD') as formatted_date_of_joining,
        TO_CHAR(hr.last_physical_exam_date, 'YYYY-MM-DD') as formatted_last_physical_exam_date,
        json_agg(
          DISTINCT jsonb_build_object(
            'evaluation_id', e.evaluation_id,
            'evaluation_date', TO_CHAR(e.evaluation_date, 'YYYY-MM-DD'),
            'teaching_effectiveness', e.teaching_effectiveness,
            'classroom_management', e.classroom_management,
            'student_engagement', e.student_engagement,
            'professionalism', e.professionalism,
            'overall_rating', e.overall_rating,
            'comments', e.comments,
            'years_of_experience', e.years_of_experience,
            'evaluator_id', e.evaluator_id,
            'status', e.status
          )
        ) FILTER (WHERE e.evaluation_id IS NOT NULL) as evaluations,
        json_agg(
          DISTINCT jsonb_build_object(
            'day', tt.day_of_week,
            'startTime', TO_CHAR(tt.start_time, 'HH24:MI'),
            'endTime', TO_CHAR(tt.end_time, 'HH24:MI'),
            'subject', sub.subject_name,
            'class', c.class_name,
            'room', r.room_name
          )
        ) FILTER (WHERE tt.timetable_id IS NOT NULL) as schedule
      FROM
        staff s
      LEFT JOIN
        users u ON s.user_id = u.user_id
      LEFT JOIN
        user_health_record hr ON s.user_id = hr.user_id
      LEFT JOIN
        evaluations e ON s.staff_id = e.evaluatee_id
      LEFT JOIN
        timetable tt ON s.staff_id = tt.teacher_id
      LEFT JOIN
        subjects sub ON tt.subject_id = sub.subject_id
      LEFT JOIN
        classes c ON tt.class_id = c.class_id
      LEFT JOIN
        rooms r ON tt.room_id = r.room_id
      WHERE
        s.user_id = $1
      GROUP BY
        s.staff_id, u.user_email, hr.medical_conditions, hr.allergies, hr.vaccination_status, hr.last_physical_exam_date
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Format the staff data
    const staffData = {
      ...rows[0],
      date_of_birth: rows[0].formatted_date_of_birth,
      date_of_joining: rows[0].formatted_date_of_joining,
      last_physical_exam_date: rows[0].formatted_last_physical_exam_date,
      evaluations: rows[0].evaluations || [],
      schedule: rows[0].schedule || [],
    };

    // Remove the formatted fields
    delete staffData.formatted_date_of_birth;
    delete staffData.formatted_date_of_joining;
    delete staffData.formatted_last_physical_exam_date;

    return NextResponse.json(staffData, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

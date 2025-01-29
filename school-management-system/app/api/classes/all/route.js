import { NextResponse } from "next/server";
import db from "../../../lib/db";

// app/api/classes/all
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    let sqlQuery;
    let queryParams = [];
    sqlQuery = `
      WITH class_data AS (
        SELECT
          c.*,
          s.last_name || s.first_name || s.middle_name AS name,

          COUNT(DISTINCT st.student_id) AS student_count,
          COUNT(DISTINCT a.attendance_id) AS total_attendance,
          COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.attendance_id END) AS present_count,
          COUNT(DISTINCT sg.subject_id) AS unique_subjects,
          AVG(sg.total_score) AS avg_score
        FROM
          classes c
        LEFT JOIN staff s ON s.staff_id = c.staff_id
        LEFT JOIN students st ON st.class_id = c.class_id AND st.status = 'active'
        LEFT JOIN attendance a ON a.class_id = c.class_id
        LEFT JOIN student_grades sg ON sg.class_id = c.class_id
        WHERE
          c.status = 'active' AND c.class_id != 1
          ${
            query ? "AND (c.class_name ILIKE $1 OR c.class_level ILIKE $1)" : ""
          }
        GROUP BY
          c.class_id, s.last_name, s.first_name, s.middle_name
      ),
      overall_stats AS (
        SELECT
          COUNT(DISTINCT c.class_id) AS total_classes,
          COUNT(DISTINCT s.student_id) AS total_students,
          COUNT(DISTINCT sub.subject_id) AS total_subjects,
          AVG(sg.total_score) AS overall_avg_score
        FROM
          classes c
        LEFT JOIN students s ON s.class_id = c.class_id AND s.status = 'active'
        LEFT JOIN student_grades sg ON sg.class_id = c.class_id
        CROSS JOIN subjects sub
        WHERE
          c.status = 'active' AND c.class_id != 1
      )
      SELECT
        (SELECT ROW_TO_JSON(overall_stats) FROM overall_stats) AS overall_statistics,
        json_agg(
          json_build_object(
            'class_id', cd.class_id,
            'class_name', cd.class_name,
            'class_level', cd.class_level,
            'capacity', cd.capacity,
            'room_name', cd.room_name,
            'staff_id', cd.staff_id,
            'staff_name', name,
            'student_count', cd.student_count,
            'attendance_percentage', CASE
              WHEN cd.total_attendance > 0 THEN ROUND((cd.present_count::numeric / cd.total_attendance) * 100, 2)
              ELSE 0
            END,
            'unique_subjects', cd.unique_subjects,
            'avg_score', ROUND(cd.avg_score::numeric, 2)
          )
          ORDER BY cd.class_level, cd.class_name
        ) AS classes
      FROM
        class_data cd
    `;
    if (query) {
      queryParams = [`%${query}%`];
    }
    const { rows } = await db.query(sqlQuery, queryParams);
    // The result will be a single row with two columns: overall_statistics and classes
    const result = rows[0];
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";


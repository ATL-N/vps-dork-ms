import db from "../../../lib/db";
import { NextResponse } from "next/server";


// /api/students/getstudents
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    let sqlQuery;
    let queryParams = [];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        WITH grade_stats AS (
          SELECT
            c.class_id,
            c.class_name AS grade,
            COUNT(s.student_id) AS count
          FROM
            classes c
          LEFT JOIN
            students s ON c.class_id = s.class_id
          GROUP BY
            c.class_id, c.class_name
        )
        SELECT
          s.*,
          s.student_id AS id,
          s.first_name || ' ' || s.last_name AS name,
          s.gender,
          TO_CHAR(s.date_of_birth, 'DD/MM/YYYY') AS date_of_birth,
          s.phone,
          c.class_name AS class,
          c.class_id,
          gs.grade,
          gs.count,
          ft.transportation_method,
          ft.pick_up_point,
          ft.feeding_fee,
          ft.transport_fee,
          hr.medical_conditions,
          hr.allergies,
          hr.blood_group,
          hr.vaccination_status,
          hr.health_insurance_id
        FROM
          students s
        LEFT JOIN
          classes c ON s.class_id = c.class_id
        LEFT JOIN
          grade_stats gs ON c.class_id = gs.class_id
        LEFT JOIN
          feeding_transport_fees ft ON s.student_id = ft.student_id
        LEFT JOIN
          user_health_record hr ON s.user_id = hr.user_id
        WHERE
          (s.first_name ILIKE $1 OR 
           s.last_name ILIKE $1 OR 
           s.other_names ILIKE $1 OR 
           s.phone ILIKE $1 OR 
           c.class_name ILIKE $1) 
          AND s.status = 'active' AND s.class_id != 1
        ORDER BY
          s.last_name, s.first_name
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete student list
      sqlQuery = `
        WITH grade_stats AS (
          SELECT
            c.class_id,
            c.class_name AS grade,
            COUNT(s.student_id) AS count
          FROM
            classes c
          LEFT JOIN
            students s ON c.class_id = s.class_id
          GROUP BY
            c.class_id, c.class_name
        )
        SELECT
          s.*,
          s.student_id AS id,
          s.first_name || ' ' || s.last_name AS name,
          s.gender,
          TO_CHAR(s.date_of_birth, 'DD/MM/YYYY') AS date_of_birth,
          s.phone,
          c.class_name AS class,
          c.class_id,
          gs.grade,
          gs.count,
          ft.transportation_method,
          ft.pick_up_point,
          ft.feeding_fee,
          ft.transport_fee,
          hr.medical_conditions,
          hr.allergies,
          hr.blood_group,
          hr.vaccination_status,
          hr.health_insurance_id
        FROM
          students s
        LEFT JOIN
          classes c ON s.class_id = c.class_id
        LEFT JOIN
          grade_stats gs ON c.class_id = gs.class_id
        LEFT JOIN
          feeding_transport_fees ft ON s.student_id = ft.student_id
        LEFT JOIN
          user_health_record hr ON s.user_id = hr.user_id
        WHERE
          s.status = 'active' AND s.class_id != '1'
        ORDER BY
          s.last_name, s.first_name
        LIMIT 10000
      `;
    }

    const { rows } = await db.query(sqlQuery, queryParams);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

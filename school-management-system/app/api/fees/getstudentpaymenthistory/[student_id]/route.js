import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// app/api/fees/getpaymenthistory/[student_id]
// /api/fees/getstudentpaymenthistory

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const { student_id } = params;

    if (!student_id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Check if the student exists
    const studentQuery = `
      SELECT student_id FROM students
      WHERE student_id = $1 AND status != 'deleted'
    `;
    const studentResult = await db.query(studentQuery, [student_id]);
    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Student not found or not active" },
        { status: 404 }
      );
    }

    let sqlQuery;
    let queryParams = [student_id];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        SELECT
          f.*,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
          to_char(f.payment_date, 'YYYY-MM-DD') AS payment_date,
          c.class_name,
          (
            SELECT semester_name
            FROM semesters
            WHERE f.created_at BETWEEN start_date AND end_date
            AND status != 'deleted'
            LIMIT 1
          ) AS semester_name
        FROM
          fee_collections f
        LEFT JOIN students s ON f.student_id = s.student_id
        LEFT JOIN staff st ON f.received_by = st.user_id
        LEFT JOIN classes c ON s.class_id = c.class_id
        WHERE 
          f.student_id = $1 AND f.status='active'
          AND (
            (
              SELECT semester_name
              FROM semesters
              WHERE f.created_at BETWEEN start_date AND end_date
              AND status != 'deleted'
              LIMIT 1
            ) ILIKE $2
            OR st.first_name ILIKE $2
            OR st.last_name ILIKE $2
            OR f.payment_date ILIKE $2
          )
        ORDER BY 
          f.collection_id DESC
        LIMIT 10000
      `;
      queryParams.push(sanitizedQuery);
    } else {
      // Complete fee collections list for the student
      sqlQuery = `
        SELECT
          f.*,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
          to_char(f.payment_date, 'YYYY-MM-DD') AS payment_date,
          c.class_name,
          (
            SELECT semester_name
            FROM semesters
            WHERE f.created_at BETWEEN start_date AND end_date
            AND status != 'deleted'
            LIMIT 1
          ) AS semester_name
        FROM
          fee_collections f
        LEFT JOIN students s ON f.student_id = s.student_id
        LEFT JOIN staff st ON f.received_by = st.user_id
        LEFT JOIN classes c ON s.class_id = c.class_id
        WHERE 
          f.student_id = $1 AND f.status='active'
        ORDER BY 
          f.collection_id DESC
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

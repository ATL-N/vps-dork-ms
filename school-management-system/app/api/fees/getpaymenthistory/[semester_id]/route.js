import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// app/api/fees/getpaymenthistory/[semester_id]

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const { semester_id } = params;

    if (!semester_id) {
      return NextResponse.json(
        { error: "Semester ID is required" },
        { status: 400 }
      );
    }

    // Fetch semester dates
    const semesterQuery = `
      SELECT start_date, end_date FROM semesters
      WHERE semester_id = $1 AND status != 'deleted'
    `;
    const semesterResult = await db.query(semesterQuery, [semester_id]);
    if (semesterResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Semester not found or not active" },
        { status: 404 }
      );
    }
    const { start_date, end_date } = semesterResult.rows[0];

    let sqlQuery;
    let queryParams = [start_date, end_date];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        SELECT
          f.*,
          s.first_name,
          s.last_name,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          CONCAT(st.first_name, ' ', st.last_name) AS receiver_name,
          to_char(f.payment_date, 'YYYY-MM-DD') AS payment_date,
          c.class_name 
        FROM
          fee_collections f
        LEFT JOIN students s ON f.student_id = s.student_id
        LEFT JOIN staff st ON f.received_by = st.user_id
        LEFT JOIN classes c ON s.class_id = c.class_id
        WHERE 
          (f.created_at BETWEEN $1 AND $2)
          AND (s.first_name ILIKE $3 OR s.last_name ILIKE $3 OR c.class_name ILIKE $3) AND f.status='active'
        ORDER BY 
          f.collection_id DESC
        LIMIT 10000
      `;
      queryParams.push(sanitizedQuery);
    } else {
      // Complete fee collections list for the semester
      sqlQuery = `
        SELECT
          f.*,
          s.first_name,
          s.last_name,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          CONCAT(st.first_name, ' ', st.last_name) AS receiver_name,
          to_char(f.payment_date, 'YYYY-MM-DD') AS payment_date,
          c.class_name 
        FROM
          fee_collections f
        LEFT JOIN students s ON f.student_id = s.student_id
        LEFT JOIN staff st ON f.received_by = st.user_id
        LEFT JOIN classes c ON s.class_id = c.class_id
        WHERE 
          (f.created_at BETWEEN $1 AND $2) AND f.status='active' 
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

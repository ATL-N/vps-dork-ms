import { NextResponse } from "next/server";
import db from "../../../lib/db";

// app/api/fees/getpaymenthistory


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
console.log('query', query)
    let sqlQuery;
    let queryParams = [];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        SELECT
  f.*,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
      to_char(payment_date, 'YYYY-MM-DD') AS payment_date,
  c.class_name 
FROM
  fee_collections f
LEFT JOIN students s ON f.student_id = s.student_id
LEFT JOIN staff st ON f.received_by = st.user_id
LEFT JOIN classes c ON s.class_id = c.class_id
WHERE (s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR c.class_name ILIKE $1) AND f.status='active'
ORDER BY 
 f.collection_id DESC

 LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete classes list
      sqlQuery = `
        SELECT
  f.*,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
    to_char(payment_date, 'YYYY-MM-DD') AS payment_date,
  c.class_name 
FROM
  fee_collections f
LEFT JOIN students s ON f.student_id = s.student_id
LEFT JOIN staff st ON f.received_by = st.user_id
LEFT JOIN classes c ON s.class_id = c.class_id
WHERE f.status='active'
ORDER BY 
 f.collection_id DESC

        LIMIT 10000;

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


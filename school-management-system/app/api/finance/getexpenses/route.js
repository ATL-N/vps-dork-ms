import { NextResponse } from "next/server";
import db from "../../../lib/db";

// app/api/expenses/getAll

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    console.log("query", query);

    let sqlQuery;
    let queryParams = [];

    const baseQuery = `
      SELECT
        e.*,
        e.expense_id AS id,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
        TO_CHAR(e.created_at, 'YYYY-MM-DD"T"HH24:MI') AS formatted_created_at,
        CASE
          WHEN e.staff_id IS NOT NULL THEN CONCAT(st.first_name, ' ', st.last_name)
          WHEN e.supplier_id IS NOT NULL THEN s.supplier_name
          ELSE e.recipient_name
        END AS recipient_name,
        s.supplier_name,
        CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
        u.user_name
      FROM
        expenses e
      LEFT JOIN suppliers s ON e.supplier_id = s.supplier_id
      LEFT JOIN staff st ON e.staff_id = st.staff_id
      LEFT JOIN users u ON e.user_id = u.user_id
    `;

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        ${baseQuery}
        WHERE 
          e.recipient_name ILIKE $1 OR
          e.expense_category ILIKE $1 OR
          e.description ILIKE $1 OR
          s.supplier_name ILIKE $1 OR
          CONCAT(st.first_name, ' ', st.last_name) ILIKE $1 OR
          u.user_name ILIKE $1
        ORDER BY e.expense_id DESC
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Fetch all expenses
      sqlQuery = `
        ${baseQuery}
        ORDER BY e.expense_id DESC
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

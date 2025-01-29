import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/users/getuserswithnumbers

export async function GET(req) {
  try {
    let sqlQuery;
    let queryParams = [];

    // Updated query to include phone numbers from students, parents, and staff
    sqlQuery = `
    SELECT 
      u.*,
      COALESCE(s.phone, st.phone_number, p.phone) AS telephone_number
    FROM
      users u
    LEFT JOIN students s ON u.user_id = s.user_id
    LEFT JOIN staff st ON u.user_id = st.user_id
    LEFT JOIN parents p ON u.user_id = p.user_id
    WHERE 
      u.user_id NOT IN (2) AND u.status='active'
    ORDER BY 
      u.role, u.user_name
    LIMIT 10000;
    `;

    const { rows } = await db.query(sqlQuery, queryParams);

    return NextResponse.json(
      rows,
      { status: 200 },
      { message: "users fetched successfully" }
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

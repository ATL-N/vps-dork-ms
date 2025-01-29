import db from "../../../lib/db";
import { NextResponse } from "next/server";

//localhost:3000/api/users/all

export async function GET(req) {
  try {
    let sqlQuery;
    let queryParams = [];

    // Complete roles list
    sqlQuery = `
    SELECT 
      *
    FROM
      users u
    WHERE 
      user_id NOT IN (2) AND status='active'
    ORDER BY 
        u.user_name
    LIMIT 10000;
      `;

    const { rows } = await db.query(sqlQuery, queryParams);

    return NextResponse.json(
      rows,
      { status: 200 },
      { message: "roles fetched successfully" }
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


import { NextResponse } from "next/server";
import db from "../../../lib/db";

// app/api/semester/all


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
        SELECT 
          s.semester_id as id,
          s.semester_name, 
          TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date,
          TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date,
          s.status

        FROM 
          semesters s
        WHERE 
          (s.semester_name ILIKE $1) AND s.status!='active'
        ORDER BY 
          s.start_date
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete semesters list
      sqlQuery = `
        SELECT 
          s.semester_id as id,
          s.semester_name, 
          TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date,
          TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date,
          s.status

        FROM 
          semesters s

        WHERE s.status != 'deleted'
        
        ORDER BY 
          s.start_date

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

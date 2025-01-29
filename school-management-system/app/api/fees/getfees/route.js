import db from "../../../lib/db";
import { NextResponse } from "next/server";

//localhost:3000/api/fees/getfees

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    console.log("query", query);

    let sqlQuery;
    let queryParams = [];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        SELECT 
          s.*,
          s.student_id AS id, 
          s.amountowed as old_balance,
          TO_CHAR(s.date_of_birth, 'DD/MM/YYYY') AS date_of_birth,
          c.class_name
        FROM 
          students s
        LEFT JOIN 
          classes c ON s.class_id = c.class_id
        WHERE 
          s.first_name ILIKE $1 OR 
          s.last_name ILIKE $1 OR 
          c.class_name ILIKE $1 
        ORDER BY
            s.last_name, s.first_name, s.amountowed DESC, c.class_name
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete students list
      sqlQuery = `
        SELECT 
          s.*,
          s.student_id AS id, 
          s.amountowed as old_balance,
          TO_CHAR(s.date_of_birth, 'DD/MM/YYYY') AS date_of_birth,
          c.class_name
        FROM 
          students s
        LEFT JOIN 
          classes c ON s.class_id = c.class_id
        ORDER BY
            s.last_name, s.first_name, s.amountowed DESC, c.class_name
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

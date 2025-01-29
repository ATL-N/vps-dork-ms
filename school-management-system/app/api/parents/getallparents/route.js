import db from "../../../lib/db";
import { NextResponse } from "next/server";

//localhost:3000/api/parents/getallparents

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
          *
        FROM 
          parents p
        WHERE 
          (p.other_names ILIKE $1 OR p.last_name ILIKE $1  ) AND p.status='active'
        ORDER BY 
          p.last_name, p.parent_id Desc
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete staff list
      sqlQuery = `
        SELECT 
          *
        FROM 
          parents p
        WHERE 
          p.status = 'active'
        ORDER BY 
          p.last_name, p.parent_id Desc
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

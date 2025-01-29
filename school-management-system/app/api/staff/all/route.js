import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/staff/all


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
          staff s
        WHERE 
          (s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR s.email ILIKE $1 OR s.role ILIKE $1 OR s.employee_id ILIKE $1) AND s.status='active'
        ORDER BY 
          s.first_name, s.last_name
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete staff list
      sqlQuery = `
        SELECT 
          *
        FROM 
          staff s

        WHERE s.status = 'active'
        
        ORDER BY 
          s.first_name, s.last_name

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

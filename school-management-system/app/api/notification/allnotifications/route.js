import db from "../../../lib/db";
import { NextResponse } from "next/server";

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
          notifications n
        WHERE 
          (n.notification_title ILIKE $1 OR n.notification_type ILIKE $1 OR n.priority ILIKE $1) AND n.status='active'
        ORDER BY 
          n.notification_id DESC, n.notification_title, n.notification_type
        LIMIT 1000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete staff list
      sqlQuery = `
        SELECT 
          *
        FROM 
          notifications n

        WHERE n.status = 'active'
        
        ORDER BY 
         n.notification_id DESC

        LIMIT 30;

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

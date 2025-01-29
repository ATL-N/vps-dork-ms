import { NextResponse } from "next/server";
import db from "../../../lib/db";

// app/api/inventory/getinventories


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
          inventory_items i
        WHERE 
          (i.class_name ILIKE $1 OR i.class_level ILIKE $1) AND i.status='active'
        ORDER BY 
           i.inventory_name, i.unit_price Desc
        LIMIT 1000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete classes list
      sqlQuery = `
        SELECT 
          *
        FROM 
           inventory_items i

        WHERE i.status = 'active'
        
        ORDER BY 
           i.inventory_name, i.unit_price Desc

        LIMIT 1000;

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


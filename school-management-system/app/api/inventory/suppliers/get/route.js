import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/inventory/suppliers/get


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
          suppliers s
        WHERE 
          (s.supplier_name ILIKE $1 OR s.contact_name ILIKE $1 OR s.contact_email ILIKE $1 OR s.address ILIKE $1 OR s.details ILIKE $1) AND s.status='active'
        ORDER BY 
           s.supplier_name, s.contact_name Desc
        LIMIT 1000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete classes list
      sqlQuery = `
        SELECT 
          *
        FROM 
           suppliers s

        WHERE s.status = 'active'
        
        ORDER BY 
           s.supplier_name, s.contact_name Desc

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


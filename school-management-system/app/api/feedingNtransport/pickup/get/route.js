import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/feedingNtransport/pickup/get
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
                    p.pick_up_id,
                    p.pick_up_point_name,
                    p.pick_up_price
                FROM 
                    bus_pick_up_points p
                WHERE 
                    (p.pick_up_point_name ILIKE $1) AND p.status='active'
                ORDER BY 
                    p.pick_up_point_name Desc
                LIMIT 1000
            `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete pick up points list
      sqlQuery = `
                SELECT 
                    p.pick_up_id,
                    p.pick_up_point_name,
                    p.pick_up_price
                FROM 
                    bus_pick_up_points p
                WHERE p.status = 'active'
                ORDER BY 
                    p.pick_up_point_name Desc
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

import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/inventory/getlowstockItems


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
          items i
        WHERE 
          (i.item_name ILIKE $1 OR i.category ILIKE $1) AND i.status!='deleted' AND i.quantity_available <= i.restock_level
        ORDER BY 
           i.item_name, i.unit_price Desc
        LIMIT 1000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete classes list
      sqlQuery = `
        SELECT 
          *
        FROM 
           items i

        WHERE (i.quantity_available <= i.restock_level) AND i.status != 'deleted'
        
        ORDER BY 
           i.item_name, i.unit_price Desc

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

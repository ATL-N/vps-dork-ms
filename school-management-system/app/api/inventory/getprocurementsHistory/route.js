import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/inventory/getprocurementsHistory

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
          p.*,
          i.item_name,
          i.category,
          s.supplier_name,
          st.first_name, 
          st.last_name,
          TO_CHAR(DATE(p.procurement_date), 'YYYY-MM-DD') AS procurement_date
        FROM 
          procurements p
          INNER JOIN items i ON p.item_id = i.item_id
          INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
          INNER JOIN staff st ON p.received_by = st.staff_id
        WHERE 
          (i.item_name ILIKE $1 OR s.supplier_name ILIKE $1 OR st.first_name ILIKE $1 OR st.last_name ILIKE $1) 
          AND p.status = 'active'
        ORDER BY 
          p.procurement_date DESC
        LIMIT 1000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete procurement history list
      sqlQuery = `
        SELECT
          p.*,
          i.item_name,
          i.category,
          s.supplier_name,
          st.first_name, 
          st.last_name,
          TO_CHAR(DATE(p.procurement_date), 'YYYY-MM-DD') AS procurement_date
        FROM
          procurements p
          INNER JOIN items i ON p.item_id = i.item_id
          INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
          INNER JOIN staff st ON p.received_by = st.staff_id
        WHERE 
          p.status = 'active'
        ORDER BY 
          p.procurement_date DESC
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


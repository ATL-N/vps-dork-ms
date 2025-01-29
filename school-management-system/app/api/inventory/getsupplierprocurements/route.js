import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/inventory/getsupplierprocurements

// GET /api/inventory/getProcurementsHistory
// GET /api/inventory/getProcurementsHistory?fromDate=2023-06-01&toDate=2023-06-30
// GET /api/inventory/getProcurementsHistory?query=someItemOrSupplier

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
console.log('supplier query', query)
    let sqlQuery;
    let queryParams = [];

    sqlQuery = `
      SELECT 
        TO_CHAR(p.procurement_date, 'YYYY-MM-DD') AS procurement_date,
        s.supplier_id,
        s.supplier_name,
        json_agg(json_build_object(
          'procurement_id', p.procurement_id,
          'item_id', i.item_id,
          'item_name', i.item_name,
          'category', i.category,
          'unit_cost', p.unit_cost,
          'quantity', p.quantity,
          'total_cost', p.total_cost,
          'procurement_date', TO_CHAR(p.procurement_date, 'YYYY-MM-DD')
        )) AS procured_items,
        SUM(p.total_cost) AS group_total_cost,
        json_build_object(
          'staff_id', st.staff_id,
          'first_name', st.first_name,
          'last_name', st.last_name
        ) AS received_by
      FROM 
        procurements p
        INNER JOIN items i ON p.item_id = i.item_id
        INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
        INNER JOIN staff st ON p.received_by = st.staff_id
      WHERE 
        p.status = 'active'
    `;

    if (fromDate && toDate) {
      sqlQuery += ` AND p.procurement_date BETWEEN $1 AND $2`;
      queryParams.push(fromDate, toDate);
    }

    if (query) {
      console.log('running query if')
      const sanitizedQuery = `%${query}%`;
      sqlQuery += ` AND (s.supplier_name ILIKE $${
        queryParams.length + 1
      } OR s.supplier_name ILIKE $${queryParams.length + 1})`;
      queryParams.push(sanitizedQuery);
    }

    sqlQuery += `
      GROUP BY 
        p.procurement_date, s.supplier_id, s.supplier_name, st.staff_id, st.first_name, st.last_name
      ORDER BY 
        p.procurement_date DESC, s.supplier_name
    `;

    const { rows } = await db.query(sqlQuery, queryParams);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No procurements found for the given criteria" },
        { status: 404 }
      );
    }

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

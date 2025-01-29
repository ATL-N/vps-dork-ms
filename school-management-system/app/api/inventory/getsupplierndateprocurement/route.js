import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/inventory/getsupplierndateprocurement
// GET /api/inventory/getsupplierndateprocurement?supplier_id=1&selected_date=2023-06-01

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const supplier_id = searchParams.get("supplier_id");
    const selected_date = searchParams.get("selected_date");

    if (!supplier_id || !selected_date) {
      return NextResponse.json(
        { error: "Missing required fields: supplier_id and selected_date" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      SELECT 
        s.supplier_id,
        s.supplier_name,
        p.procurement_date,
        json_agg(json_build_object(
          'procurement_id', p.procurement_id,
          'item_id', i.item_id,
          'item_name', i.item_name,
          'category', i.category,
          'unit_cost', p.unit_cost,
          'unit_price', i.unit_price,
          'quantity', p.quantity,
          'total_cost', p.total_cost
        )) AS procured_items,
        st.staff_id,
        st.first_name,
        st.last_name
      FROM 
        procurements p
        INNER JOIN items i ON p.item_id = i.item_id
        INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
        INNER JOIN staff st ON p.received_by = st.staff_id
      WHERE 
        p.supplier_id = $1 AND 
        p.procurement_date = $2 AND
        p.status = 'active'
      GROUP BY 
        s.supplier_id, s.supplier_name, p.procurement_date, st.staff_id, st.first_name, st.last_name
    `;

    const { rows } = await db.query(sqlQuery, [supplier_id, selected_date]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No procurements found for the given supplier and date" },
        { status: 404 }
      );
    }

    const formattedResponse = {
      supplier_id: rows[0].supplier_id,
      supplier_name: rows[0].supplier_name,
      selected_date: rows[0].procurement_date,
      procured_items: rows[0].procured_items,
      received_by: {
        staff_id: rows[0].staff_id,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
      },
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

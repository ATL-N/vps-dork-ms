import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/inventory/getitemmovements
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const recipient_name = searchParams.get("recipient_name");
    const staff_id = searchParams.get("staff_id");

    let query = `
      SELECT 
        im.supply_id,
        im.staff_id,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name || ' ', ''), s.last_name) as staff_name,
        im.recipient_name,
        im.recipient_phone,
        im.comments,
        im.item_id,
        i.item_name,
        im.quantity,
        im.supplied_by,
        im.movement_type,
        im.supplied_at
      FROM 
        items_movement im
      JOIN
        items i ON im.item_id = i.item_id
      LEFT JOIN
        staff s ON im.staff_id = s.staff_id
      WHERE 
        im.movement_type = 'out'
    `;

    const queryParams = [];

    if (recipient_name) {
      query += ` AND im.recipient_name ILIKE $1`;
      queryParams.push(`%${recipient_name}%`);
    } else if (staff_id) {
      query += ` AND im.staff_id = $1`;
      queryParams.push(staff_id);
    }

    query += ` ORDER BY im.supplied_at DESC`;

    const result = await db.query(query, queryParams);

    return NextResponse.json(
      {
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching item movements:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/inventory/getallitemmovements

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    let sqlQuery = `
      SELECT 
        im.supply_id as id,
        im.staff_id,
        im.item_id,
        CASE 
          WHEN im.staff_id IS NOT NULL THEN CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name)
          ELSE im.recipient_name
        END AS name,
        CASE 
          WHEN im.staff_id IS NOT NULL THEN u.user_email
          ELSE im.recipient_phone
        END AS contact,
        im.comments,
        i.item_name,
        im.quantity,
        TO_CHAR(im.supplied_at, 'DD/MM/YYYY HH24:MI') AS supplied_at,
        im.status,
        im.movement_type,
        CONCAT(ss.first_name, ' ', COALESCE(ss.middle_name, ''), ' ', ss.last_name) AS supplied_by_name
      FROM 
        items_movement im
      LEFT JOIN
        staff s ON im.staff_id = s.staff_id
      LEFT JOIN
        users u ON s.user_id = u.user_id
      LEFT JOIN
        items i ON im.item_id = i.item_id
      LEFT JOIN
        staff ss ON im.supplied_by = ss.staff_id
      WHERE 
        im.status != 'delete'
    `;

    let queryParams = [];

    if (query) {
      sqlQuery += ` AND (
        im.recipient_name ILIKE $1 OR
        im.recipient_phone ILIKE $1 OR
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) ILIKE $1 OR
        i.item_name ILIKE $1
      )`;
      queryParams.push(`%${query}%`);
    }

    sqlQuery += `
      ORDER BY 
        im.supplied_at DESC
      LIMIT 1000
    `;

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

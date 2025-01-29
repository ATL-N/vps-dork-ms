import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/inventory/getallitemsupplies/route.js

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
          si.supply_id,
          si.quantity,
          TO_CHAR(DATE(si.supplied_at), 'YYYY-MM-DD') AS supplied_at,
          cl.class_name,
          sem.semester_name,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          i.item_name,
          i.category,
          i.unit_price,
          CONCAT(st.first_name, ' ', st.last_name) AS staff_name
        FROM 
          items_supply si
        JOIN 
          students s ON si.student_id = s.student_id
        JOIN 
          items i ON si.item_id = i.item_id
        JOIN 
          staff st ON si.supplied_by = st.staff_id
        JOIN 
          semesters sem ON si.semester_id = sem.semester_id
        JOIN 
          classes cl ON si.class_id = cl.class_id


        WHERE 
          (i.item_name ILIKE $1 OR sem.semester_name ILIKE $1 OR cl.class_name ILIKE $1 OR s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR st.first_name ILIKE $1 OR st.last_name ILIKE $1, OR si.supplied_at ILIKE $1) AND si.status != 'deleted'
        ORDER BY 
          si.supplied_at DESC, i.item_name, i.unit_price DESC
        LIMIT 1000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete items supply list
      sqlQuery = `
        SELECT 
          si.supply_id,
          si.quantity,
          TO_CHAR(DATE(si.supplied_at), 'YYYY-MM-DD') AS supplied_at,
          cl.class_name,
          sem.semester_name,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          i.item_name,
          i.category,
          i.unit_price,
          CONCAT(st.first_name, ' ', st.last_name) AS staff_name
        FROM 
          items_supply si
        JOIN 
          students s ON si.student_id = s.student_id
        JOIN 
          items i ON si.item_id = i.item_id
        JOIN 
          staff st ON si.supplied_by = st.staff_id
        JOIN 
          semesters sem ON si.semester_id = sem.semester_id
        JOIN 
          classes cl ON si.class_id = cl.class_id

          WHERE 
          si.status != 'deleted'
        ORDER BY 
          si.supplied_at DESC, i.item_name, i.unit_price DESC
        LIMIT 1000
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


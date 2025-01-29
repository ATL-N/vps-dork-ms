import db from "../../../lib/db";
import { NextResponse } from "next/server";

//localhost:3000/api/feedingNtransport/getfeedingntransportdet

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    console.log("query", query);

    let sqlQuery;
    let queryParams = [];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        SELECT 
          s.student_id,
          s.last_name  || ' ' || s.first_name || ' ' || s.other_names AS full_name,
          c.class_name,
          s.class_id,
          ft.feeding_fee,
          ft.transport_fee,
          (ft.feeding_fee + ft.transport_fee) as total_fees_due,
          s.amountowed as previous_balance,
          (ft.feeding_fee + ft.transport_fee + s.amountowed) as total_amount_due
        FROM 
          students s
        LEFT JOIN 
          classes c ON s.class_id = c.class_id
        LEFT JOIN
          feeding_transport_fees ft ON s.student_id = ft.student_id
        WHERE 
          (s.first_name ILIKE $1 OR 
          s.last_name ILIKE $1 OR 
          c.class_name ILIKE $1)
          AND s.status = 'active'
        ORDER BY
          s.last_name, 
          s.first_name, 
          c.class_name,
          total_amount_due DESC
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete students list
      sqlQuery = `
        SELECT 
          s.student_id,
          s.last_name || ' ' || s.first_name || ' ' || s.other_names AS full_name,
          c.class_name,
          s.class_id,
          ft.feeding_fee,
          ft.transport_fee,
          (ft.feeding_fee + ft.transport_fee) as total_fees_due,
          s.amountowed as previous_balance,
          (ft.feeding_fee + ft.transport_fee + s.amountowed) as total_amount_due
        FROM 
          students s
        LEFT JOIN 
          classes c ON s.class_id = c.class_id
        LEFT JOIN
          feeding_transport_fees ft ON s.student_id = ft.student_id
        WHERE 
          s.status = 'active'
        ORDER BY
          s.last_name, 
          s.first_name, 
          c.class_name,
          total_amount_due DESC
        LIMIT 10000
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

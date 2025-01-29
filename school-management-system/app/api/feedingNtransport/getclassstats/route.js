import { NextResponse } from "next/server";
import db from "../../../lib/db";

// GET /api/feeding/getclassfees?class_id=1&date=2024-03-15
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const class_id = searchParams.get("class_id");
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!class_id) {
      return NextResponse.json(
        { error: "Missing required field: class_id" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      WITH date_stats AS (
        -- Daily payments
        SELECT 
          COUNT(DISTINCT CASE WHEN feeding_fee > 0 THEN student_id END) as feeding_paid_count,
          COUNT(DISTINCT CASE WHEN transport_fee > 0 THEN student_id END) as transport_paid_count,
          COALESCE(SUM(feeding_fee), 0) as total_feeding_received,
          COALESCE(SUM(transport_fee), 0) as total_transport_received
        FROM feeding_fee_payments
        WHERE 
          class_id = $1 
          AND DATE(payment_date) = DATE($2)
      ),
      weekly_stats AS (
        -- Weekly payments (for the week containing the specified date)
        SELECT 
          COALESCE(SUM(feeding_fee), 0) as weekly_feeding_received,
          COALESCE(SUM(transport_fee), 0) as weekly_transport_received
        FROM feeding_fee_payments
        WHERE 
          class_id = $1 
          AND DATE(payment_date) >= DATE($2) - EXTRACT(DOW FROM DATE($2))::INTEGER
          AND DATE(payment_date) <= DATE($2) + (6 - EXTRACT(DOW FROM DATE($2))::INTEGER)
      ),
      expected_totals AS (
        -- Expected fees for active students
        SELECT 
          COALESCE(SUM(ftf.feeding_fee), 0) as total_feeding_expected,
          COALESCE(SUM(ftf.transport_fee), 0) as total_transport_expected
        FROM students s
        LEFT JOIN feeding_transport_fees ftf ON s.student_id = ftf.student_id
        WHERE 
          s.class_id = $1 
          AND s.status = 'active'
      )
      SELECT 
        ds.feeding_paid_count,
        ds.transport_paid_count,
        ds.total_feeding_received,
        ds.total_transport_received,
        et.total_feeding_expected,
        et.total_transport_expected,
        ws.weekly_feeding_received,
        ws.weekly_transport_received
      FROM 
        date_stats ds
        CROSS JOIN expected_totals et
        CROSS JOIN weekly_stats ws;
    `;

    const { rows } = await db.query(sqlQuery, [class_id, date]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // Format the response
    const statistics = {
      date,
      class_id,
      daily_statistics: {
        students_paid_feeding: rows[0].feeding_paid_count,
        students_paid_transport: rows[0].transport_paid_count,
        total_feeding_received: parseFloat(rows[0].total_feeding_received),
        total_transport_received: parseFloat(rows[0].total_transport_received),
        total_feeding_expected: parseFloat(rows[0].total_feeding_expected),
        total_transport_expected: parseFloat(rows[0].total_transport_expected),
      },
      weekly_statistics: {
        total_feeding_received: parseFloat(rows[0].weekly_feeding_received),
        total_transport_received: parseFloat(rows[0].weekly_transport_received),
      },
    };

    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

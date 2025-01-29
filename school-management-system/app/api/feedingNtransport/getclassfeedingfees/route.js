import { NextResponse } from "next/server";
import db from "../../../lib/db";

// GET /api/feeding/getclassfees?class_id=1&payment_date=2024-03-15
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const class_id = searchParams.get("class_id");
    const payment_date = searchParams.get("payment_date");

    if (!class_id || !payment_date) {
      return NextResponse.json(
        { error: "Missing required fields: class_id and payment_date" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      WITH payments_on_date AS (
        SELECT 
          student_id,
          feeding_fee as current_feeding_fee,
          transport_fee as current_transport_fee,
          valid_until_feeding as feeding_valid_until,
          valid_until_transport as transport_valid_until,
          total_fee,
          payment_date,
          collected_by
        FROM feeding_fee_payments
        WHERE 
          class_id = $1 
          AND DATE(payment_date) = DATE($2)
      )
      SELECT 
        s.student_id,
        s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.other_names, '') as student_name,
        s.class_id,
        s.status,
        ftf.feeding_fee as default_feeding_fee,
        COALESCE(bpp.pick_up_price, 0) as default_transport_fee,
        COALESCE(ftf.feeding_fee, 0) + COALESCE(bpp.pick_up_price, 0) as expected_total,
        ftf.transportation_method,
        COALESCE(bpp.pick_up_point_name, '') as pick_up_point,
        COALESCE(pod.current_feeding_fee::TEXT, '') as current_feeding_fee,
        COALESCE(pod.current_transport_fee::TEXT, '') as current_transport_fee,
        COALESCE(pod.feeding_valid_until::TEXT, '') as feeding_valid_until,
        COALESCE(pod.transport_valid_until::TEXT, '') as transport_valid_until,
        COALESCE(pod.total_fee::TEXT, '') as total_fee,
        COALESCE(pod.payment_date::TEXT, '') as payment_date,
        COALESCE(pod.collected_by::TEXT, '') as collected_by,
        COALESCE(st.staff_id::TEXT, '') as staff_id,
        COALESCE(st.last_name || ' ' || st.first_name || ' ' || COALESCE(st.middle_name, ''), '') as staff_name
      FROM 
        students s
      LEFT JOIN feeding_transport_fees ftf ON s.student_id = ftf.student_id
      LEFT JOIN bus_pick_up_points bpp ON ftf.pick_up_point = bpp.pick_up_id
      LEFT JOIN payments_on_date pod ON s.student_id = pod.student_id
      LEFT JOIN staff st ON pod.collected_by = st.user_id
      WHERE 
        s.class_id = $1 
        AND s.status = 'active'
      ORDER BY 
        s.student_id;
    `;

    const { rows } = await db.query(sqlQuery, [class_id, payment_date]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No active students found in this class" },
        { status: 404 }
      );
    }

    // Format the response to match the component's expected structure
    const formattedResponse = rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      class_id: row.class_id,
      status: row.status,
      default_feeding_fee: parseFloat(row.default_feeding_fee) || 0,
      default_transport_fee: parseFloat(row.default_transport_fee) || 0,
      expected_total: parseFloat(row.expected_total) || 0,
      transportation_method: row.transportation_method || "",
      pick_up_point: row.pick_up_point || "",
      current_feeding_fee: row.current_feeding_fee
        ? parseFloat(row.current_feeding_fee)
        : "",
      current_transport_fee: row.current_transport_fee
        ? parseFloat(row.current_transport_fee)
        : "",
      feeding_valid_until: row.feeding_valid_until || "",
      transport_valid_until: row.transport_valid_until || "",
      total_fee: row.total_fee ? parseFloat(row.total_fee) : "",
      payment_date: row.payment_date || "",
      collected_by: row.collected_by || "",
      staff_id: row.staff_id || "",
      staff_name: row.staff_name || "",
    }));

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

import { NextResponse } from "next/server";
import db from "../../../lib/db";

// GET /api/feeding/getStaffCollections?semester_id=1
// /api/feedingNtransport/getStaffCollections?semester_id=1
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const semester_id = searchParams.get("semester_id");

    if (!semester_id) {
      return NextResponse.json(
        { error: "Missing required field: semester_id" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      WITH semester_totals AS (
        SELECT 
          SUM(total_fee) as semester_total_amount
        FROM 
          feeding_fee_payments
        WHERE 
          semester_id = $1
      )
      SELECT 
        TO_CHAR(DATE(ffp.payment_date), 'YYYY-MM-DD') as html_date,
        TO_CHAR(DATE(ffp.payment_date), 'Mon DD, YYYY') as formatted_date,
        TO_CHAR(DATE(ffp.payment_date), 'Day') as day_of_week,
        ffp.collected_by,
        s.staff_id,
        s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, '') as staff_name,
        COUNT(DISTINCT ffp.student_id) as students_paid,
        COUNT(DISTINCT ffp.class_id) as classes_collected,
        SUM(ffp.feeding_fee) as total_feeding_collected,
        SUM(ffp.transport_fee) as total_transport_collected,
        SUM(ffp.total_fee) as total_amount_collected,
        ROUND(
          (SUM(ffp.total_fee) / st.semester_total_amount * 100)::numeric,
          2
        ) as percentage_of_semester,
        st.semester_total_amount
      FROM 
        feeding_fee_payments ffp
        JOIN staff s ON ffp.collected_by = s.user_id
        CROSS JOIN semester_totals st
      WHERE 
        ffp.semester_id = $1
      GROUP BY 
        DATE(ffp.payment_date),
        ffp.collected_by,
        s.staff_id,
        s.last_name,
        s.first_name,
        s.middle_name,
        st.semester_total_amount
      ORDER BY 
        DATE(ffp.payment_date) DESC,
        total_amount_collected DESC;
    `;

    const { rows } = await db.query(sqlQuery, [semester_id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No collections found for this semester" },
        { status: 404 }
      );
    }

    const formattedResponse = rows.map((row) => ({
      // payment_date: row.formatted_date,
      payment_date: row.html_date,
      day_of_week: row.day_of_week.trim(),
      collected_by: row.collected_by,
      staff_id: row.staff_id,
      staff_name: row.staff_name.trim(),
      students_paid: row.students_paid,
      classes_collected: row.classes_collected,
      total_feeding_collected: parseFloat(row.total_feeding_collected),
      total_transport_collected: parseFloat(row.total_transport_collected),
      total_amount_collected: parseFloat(row.total_amount_collected),
      percentage_of_semester: parseFloat(row.percentage_of_semester),
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

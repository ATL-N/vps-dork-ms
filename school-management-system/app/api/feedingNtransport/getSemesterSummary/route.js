import { NextResponse } from "next/server";
import db from "../../../lib/db";

//  /api/feedingNtransport/getSemesterSummary?semester_id=1
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
        DATE(ffp.payment_date) as raw_date,
        TO_CHAR(DATE(ffp.payment_date), 'YYYY-MM-DD') as formatted_date,
        TO_CHAR(DATE(ffp.payment_date), 'Day') as day_of_week,
        ffp.class_id,
        c.class_name,
        COUNT(DISTINCT ffp.student_id) as students_paid,
        SUM(ffp.feeding_fee) as total_class_feeding_fee,
        SUM(ffp.transport_fee) as total_class_transport_fee,
        SUM(ffp.total_fee) as total_class_amount,
        ROUND(
          (SUM(ffp.total_fee) / st.semester_total_amount * 100)::numeric,
          2
        ) as percentage_of_semester,
        st.semester_total_amount
      FROM 
        feeding_fee_payments ffp
        JOIN classes c ON ffp.class_id = c.class_id
        CROSS JOIN semester_totals st
      WHERE 
        ffp.semester_id = $1
      GROUP BY 
        DATE(ffp.payment_date),
        ffp.class_id,
        c.class_name,
        st.semester_total_amount
      ORDER BY 
        DATE(ffp.payment_date) DESC,
        ffp.class_id;
    `;

    const { rows } = await db.query(sqlQuery, [semester_id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No payments found for this semester" },
        { status: 404 }
      );
    }

    const formattedResponse = rows.map((row) => ({
      payment_date: row.formatted_date, // e.g., "Mar 15, 2024"
      day_of_week: row.day_of_week.trim(), // e.g., "Monday"
      raw_date: row.raw_date, // Keep the raw date for sorting if needed
      class_id: row.class_id,
      class_name: row.class_name,
      students_paid: row.students_paid,
      total_class_feeding_fee: parseFloat(row.total_class_feeding_fee),
      total_class_transport_fee: parseFloat(row.total_class_transport_fee),
      total_class_amount: parseFloat(row.total_class_amount),
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

import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/feedingNtransport/getoverallstats?date=2024-03-15
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    const sqlQuery = `
      WITH daily_payments AS (
        -- Overall daily payment counts and totals
        SELECT 
          COUNT(DISTINCT CASE 
            WHEN feeding_fee > 0 AND DATE(payment_date) = DATE($1)
            THEN student_id 
          END) as total_students_paid_feeding,
          COUNT(DISTINCT CASE 
            WHEN transport_fee > 0 AND DATE(payment_date) = DATE($1)
            THEN student_id 
          END) as total_students_paid_transport,
          COALESCE(SUM(CASE 
            WHEN DATE(payment_date) = DATE($1) 
            THEN feeding_fee 
            ELSE 0 
          END), 0) as total_feeding_received,
          COALESCE(SUM(CASE 
            WHEN DATE(payment_date) = DATE($1) 
            THEN transport_fee 
            ELSE 0 
          END), 0) as total_transport_received
        FROM feeding_fee_payments
      ),
      class_stats AS (
        -- Daily payments aggregated by class
        SELECT 
          c.class_name,
          c.class_id,
          COUNT(DISTINCT CASE WHEN ffp.feeding_fee > 0 THEN ffp.student_id END) as feeding_paid_count,
          COUNT(DISTINCT CASE WHEN ffp.transport_fee > 0 THEN ffp.student_id END) as transport_paid_count,
          COALESCE(SUM(ffp.feeding_fee), 0) as class_feeding_received,
          COALESCE(SUM(ffp.transport_fee), 0) as class_transport_received
        FROM classes c
        LEFT JOIN feeding_fee_payments ffp ON 
          c.class_id = ffp.class_id 
          AND DATE(ffp.payment_date) = DATE($1)
        GROUP BY c.class_id, c.class_name
      ),
      weekly_stats AS (
        -- Weekly totals
        SELECT 
          COALESCE(SUM(feeding_fee), 0) as weekly_feeding_received,
          COALESCE(SUM(transport_fee), 0) as weekly_transport_received
        FROM feeding_fee_payments
        WHERE 
          DATE(payment_date) >= DATE($1) - EXTRACT(DOW FROM DATE($1))::INTEGER
          AND DATE(payment_date) <= DATE($1) + (6 - EXTRACT(DOW FROM DATE($1))::INTEGER)
      ),
      class_weekly_stats AS (
        -- Weekly payments by class
        SELECT 
          class_id,
          COALESCE(SUM(feeding_fee), 0) as class_weekly_feeding_received,
          COALESCE(SUM(transport_fee), 0) as class_weekly_transport_received
        FROM feeding_fee_payments
        WHERE 
          DATE(payment_date) >= DATE($1) - EXTRACT(DOW FROM DATE($1))::INTEGER
          AND DATE(payment_date) <= DATE($1) + (6 - EXTRACT(DOW FROM DATE($1))::INTEGER)
        GROUP BY class_id
      ),
      expected_totals AS (
        -- Expected totals from all active students
        SELECT 
          COUNT(DISTINCT s.student_id) as total_students,
          COUNT(DISTINCT CASE WHEN ftf.feeding_fee > 0 THEN s.student_id END) as students_with_feeding,
          COUNT(DISTINCT CASE WHEN ftf.transport_fee > 0 THEN s.student_id END) as students_with_transport,
          COALESCE(SUM(ftf.feeding_fee), 0) as total_feeding_expected,
          COALESCE(SUM(ftf.transport_fee), 0) as total_transport_expected
        FROM students s
        LEFT JOIN feeding_transport_fees ftf ON s.student_id = ftf.student_id
        WHERE s.status = 'active'
      ),
      class_expected AS (
        -- Expected totals by class
        SELECT 
          c.class_id,
          COUNT(DISTINCT s.student_id) as class_total_students,
          COUNT(DISTINCT CASE WHEN ftf.feeding_fee > 0 THEN s.student_id END) as class_students_with_feeding,
          COUNT(DISTINCT CASE WHEN ftf.transport_fee > 0 THEN s.student_id END) as class_students_with_transport,
          COALESCE(SUM(ftf.feeding_fee), 0) as class_feeding_expected,
          COALESCE(SUM(ftf.transport_fee), 0) as class_transport_expected
        FROM classes c
        LEFT JOIN students s ON c.class_id = s.class_id AND s.status = 'active'
        LEFT JOIN feeding_transport_fees ftf ON s.student_id = ftf.student_id
        GROUP BY c.class_id
      )
      SELECT 
        dp.*,
        wp.*,
        et.*,
        json_agg(
          json_build_object(
            'class_id', cs.class_id,
            'class_name', cs.class_name,
            'feeding_paid_count', cs.feeding_paid_count,
            'transport_paid_count', cs.transport_paid_count,
            'class_feeding_received', cs.class_feeding_received,
            'class_transport_received', cs.class_transport_received,
            'class_weekly_feeding_received', cws.class_weekly_feeding_received,
            'class_weekly_transport_received', cws.class_weekly_transport_received,
            'class_total_students', ce.class_total_students,
            'class_students_with_feeding', ce.class_students_with_feeding,
            'class_students_with_transport', ce.class_students_with_transport,
            'class_feeding_expected', ce.class_feeding_expected,
            'class_transport_expected', ce.class_transport_expected
          )
        ) as class_statistics
      FROM 
        daily_payments dp
        CROSS JOIN weekly_stats wp
        CROSS JOIN expected_totals et
        LEFT JOIN class_stats cs ON true
        LEFT JOIN class_weekly_stats cws ON cs.class_id = cws.class_id
        LEFT JOIN class_expected ce ON cs.class_id = ce.class_id
      GROUP BY 
        dp.total_students_paid_feeding, 
        dp.total_students_paid_transport,
        dp.total_feeding_received,
        dp.total_transport_received,
        wp.weekly_feeding_received,
        wp.weekly_transport_received,
        et.total_students,
        et.students_with_feeding,
        et.students_with_transport,
        et.total_feeding_expected,
        et.total_transport_expected;
    `;

    const { rows } = await db.query(sqlQuery, [date]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // Format the response
    const statistics = {
      date,
      school_statistics: {
        daily_statistics: {
          students_paid_feeding: parseInt(rows[0].total_students_paid_feeding),
          students_paid_transport: parseInt(
            rows[0].total_students_paid_transport
          ),
          total_feeding_received: parseFloat(rows[0].total_feeding_received),
          total_transport_received: parseFloat(
            rows[0].total_transport_received
          ),
        },
        expected_statistics: {
          total_students: parseInt(rows[0].total_students),
          students_with_feeding: parseInt(rows[0].students_with_feeding),
          students_with_transport: parseInt(rows[0].students_with_transport),
          total_feeding_expected: parseFloat(rows[0].total_feeding_expected),
          total_transport_expected: parseFloat(
            rows[0].total_transport_expected
          ),
        },
        weekly_statistics: {
          total_feeding_received: parseFloat(rows[0].weekly_feeding_received),
          total_transport_received: parseFloat(
            rows[0].weekly_transport_received
          ),
        },
      },
      class_statistics: rows[0].class_statistics.map((cls) => ({
        class_id: cls.class_id,
        class_name: cls.class_name,
        daily_statistics: {
          students_paid_feeding: parseInt(cls.feeding_paid_count),
          students_paid_transport: parseInt(cls.transport_paid_count),
          total_feeding_received: parseFloat(cls.class_feeding_received),
          total_transport_received: parseFloat(cls.class_transport_received),
        },
        expected_statistics: {
          total_students: parseInt(cls.class_total_students),
          students_with_feeding: parseInt(cls.class_students_with_feeding),
          students_with_transport: parseInt(cls.class_students_with_transport),
          total_feeding_expected: parseFloat(cls.class_feeding_expected),
          total_transport_expected: parseFloat(cls.class_transport_expected),
        },
        weekly_statistics: {
          total_feeding_received: parseFloat(cls.class_weekly_feeding_received),
          total_transport_received: parseFloat(
            cls.class_weekly_transport_received
          ),
        },
      })),
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

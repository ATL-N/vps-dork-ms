import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const { semester_id } = params;
    if (!semester_id) {
      return NextResponse.json(
        { error: "Semester ID is required" },
        { status: 400 }
      );
    }

    // Fetch semester dates
    const semesterQuery = `
      SELECT start_date, end_date FROM semesters
      WHERE semester_id = $1 AND status != 'deleted'
    `;
    const semesterResult = await db.query(semesterQuery, [semester_id]);
    if (semesterResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Semester not found or not active" },
        { status: 404 }
      );
    }
    const { start_date, end_date } = semesterResult.rows[0];

    // New query to get today's revenue
    const dailyRevenueQuery = `
      WITH daily_tuition AS (
        SELECT COALESCE(SUM(amount_received), 0) as tuition_revenue
        FROM fee_collections
        WHERE DATE(payment_date) = CURRENT_DATE AND status='active'
      ),
      daily_feeding AS (
        SELECT 
          COALESCE(SUM(feeding_fee), 0) as feeding_revenue,
          COALESCE(SUM(transport_fee), 0) as transport_revenue,
          COALESCE(SUM(total_fee), 0) as total_feeding_transport
        FROM feeding_fee_payments
        WHERE DATE(payment_date) = CURRENT_DATE
      )
      SELECT 
        dt.tuition_revenue,
        df.feeding_revenue,
        df.transport_revenue,
        (dt.tuition_revenue + df.total_feeding_transport) as total_daily_revenue
      FROM daily_tuition dt, daily_feeding df
    `;
    const dailyRevenueResult = await db.query(dailyRevenueQuery);
    const dailyRevenue = dailyRevenueResult.rows[0];

    // Modified stats query to include feeding fees
    const statsQuery = `
      WITH semester_stats AS (
        SELECT 
          COALESCE(SUM(amount_received), 0) as tuition_revenue,
          COALESCE(SUM(CASE WHEN payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN amount_received ELSE 0 END), 0) as recent_tuition_payments,
          AVG(EXTRACT(DAY FROM (payment_date - created_at))) as average_payment_time
        FROM fee_collections
        WHERE (payment_date BETWEEN $1 AND $2) AND status='active'
      ),
      feeding_stats AS (
        SELECT
          COALESCE(SUM(total_fee), 0) as feeding_revenue,
          COALESCE(SUM(CASE WHEN payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN total_fee ELSE 0 END), 0) as recent_feeding_payments,
          COALESCE(SUM(feeding_fee), 0) as feeding_only_revenue,
          COALESCE(SUM(transport_fee), 0) as transport_revenue
        FROM feeding_fee_payments
        WHERE payment_date BETWEEN $1 AND $2
      ),
      student_debt AS (
        SELECT COALESCE(SUM(amountowed), 0) as total_debt
        FROM students
        WHERE status = 'active'
      ),
      semester_expenses AS (
        SELECT COALESCE(SUM(amount), 0) as total_expenses
        FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
      )
      SELECT 
        ss.tuition_revenue,
        ss.recent_tuition_payments,
        ss.average_payment_time,
        fs.feeding_revenue,
        fs.recent_feeding_payments,
        fs.feeding_only_revenue,
        fs.transport_revenue,
        (ss.tuition_revenue + fs.feeding_revenue) as total_revenue,
        (ss.recent_tuition_payments + fs.recent_feeding_payments) as total_recent_payments,
        sd.total_debt as outstanding_payments,
        se.total_expenses
      FROM semester_stats ss, feeding_stats fs, student_debt sd, semester_expenses se
    `;
    const statsResult = await db.query(statsQuery, [start_date, end_date]);
    const stats = statsResult.rows[0];

    // Modified semester report data query to include feeding fees
    const semReportDataQuery = `
      WITH weekly_data AS (
        SELECT
          DATE_TRUNC('week', payment_date) AS date,
          SUM(amount_received) AS tuition_revenue,
          0 AS feeding_revenue,
          0 AS transport_revenue,
          0 AS expenses
        FROM fee_collections
        WHERE (payment_date BETWEEN $1 AND $2) AND status='active'
        GROUP BY DATE_TRUNC('week', payment_date)
        UNION ALL
        SELECT
          DATE_TRUNC('week', payment_date) AS date,
          0 AS tuition_revenue,
          SUM(feeding_fee) AS feeding_revenue,
          SUM(transport_fee) AS transport_revenue,
          0 AS expenses
        FROM feeding_fee_payments
        WHERE payment_date BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('week', payment_date)
        UNION ALL
        SELECT
          DATE_TRUNC('week', expense_date) AS date,
          0 AS tuition_revenue,
          0 AS feeding_revenue,
          0 AS transport_revenue,
          SUM(amount) AS expenses
        FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('week', expense_date)
      ),
      monthly_data AS (
        SELECT
          DATE_TRUNC('month', payment_date) AS date,
          SUM(amount_received) AS tuition_revenue,
          0 AS feeding_revenue,
          0 AS transport_revenue,
          0 AS expenses
        FROM fee_collections
        WHERE (payment_date BETWEEN $1 AND $2) AND status='active'
        GROUP BY DATE_TRUNC('month', payment_date)
        UNION ALL
        SELECT
          DATE_TRUNC('month', payment_date) AS date,
          0 AS tuition_revenue,
          SUM(feeding_fee) AS feeding_revenue,
          SUM(transport_fee) AS transport_revenue,
          0 AS expenses
        FROM feeding_fee_payments
        WHERE payment_date BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('month', payment_date)
        UNION ALL
        SELECT
          DATE_TRUNC('month', expense_date) AS date,
          0 AS tuition_revenue,
          0 AS feeding_revenue,
          0 AS transport_revenue,
          SUM(amount) AS expenses
        FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('month', expense_date)
      )
      SELECT
        'weekly' AS data_type,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        SUM(tuition_revenue) AS tuition_revenue,
        SUM(feeding_revenue) AS feeding_revenue,
        SUM(transport_revenue) AS transport_revenue,
        SUM(tuition_revenue + feeding_revenue + transport_revenue) AS total_revenue,
        SUM(expenses) AS expenses,
        SUM(tuition_revenue + feeding_revenue + transport_revenue) - SUM(expenses) AS profit
      FROM weekly_data
      GROUP BY date
      UNION ALL
      SELECT
        'monthly' AS data_type,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        SUM(tuition_revenue) AS tuition_revenue,
        SUM(feeding_revenue) AS feeding_revenue,
        SUM(transport_revenue) AS transport_revenue,
        SUM(tuition_revenue + feeding_revenue + transport_revenue) AS total_revenue,
        SUM(expenses) AS expenses,
        SUM(tuition_revenue + feeding_revenue + transport_revenue) - SUM(expenses) AS profit
      FROM monthly_data
      GROUP BY date
      ORDER BY data_type, date
    `;
    const semReportDataResult = await db.query(semReportDataQuery, [
      start_date,
      end_date,
    ]);

    const weeklyReportData = [];
    const monthlyReportData = [];
    semReportDataResult.rows.forEach((row) => {
      const formattedRow = {
        date: row.date,
        tuitionRevenue: parseFloat(row.tuition_revenue),
        feedingRevenue: parseFloat(row.feeding_revenue),
        transportRevenue: parseFloat(row.transport_revenue),
        totalRevenue: parseFloat(row.total_revenue),
        expenses: parseFloat(row.expenses),
        profit: parseFloat(row.profit),
      };
      if (row.data_type === "weekly") {
        weeklyReportData.push(formattedRow);
      } else {
        monthlyReportData.push(formattedRow);
      }
    });

    // Rest of the queries
    const semExpensesDataQuery = `
      SELECT 
        expense_category as name,
        CAST(ROUND(SUM(amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM expenses WHERE expense_date BETWEEN $1 AND $2), 0)) AS INTEGER) as value
      FROM expenses
      WHERE expense_date BETWEEN $1 AND $2
      GROUP BY expense_category
      ORDER BY value DESC
    `;
    const semExpensesDataResult = await db.query(semExpensesDataQuery, [
      start_date,
      end_date,
    ]);
    const semExpensesData = semExpensesDataResult.rows.map((row) => ({
      name: row.name,
      value: parseInt(row.value) || 0,
    }));

    // Modified to include feeding fee payments in recent payments
    const recentPaymentsQuery = `
      (SELECT 
        fc.collection_id as id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        fc.amount_received as amount,
        'Tuition' as payment_type,
        fc.old_balance,
        fc.new_balance,
        TO_CHAR(fc.created_at, 'YYYY-MM-DD') as date
      FROM fee_collections fc
      JOIN students s ON fc.student_id = s.student_id
      WHERE fc.created_at BETWEEN $1 AND $2 AND fc.status='active')
      UNION ALL
      (SELECT 
        ffp.id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        ffp.total_fee as amount,
        'Feeding & Transport' as payment_type,
        NULL as old_balance,
        NULL as new_balance,
        TO_CHAR(ffp.payment_date, 'YYYY-MM-DD') as date
      FROM feeding_fee_payments ffp
      JOIN students s ON ffp.student_id = s.student_id
      WHERE ffp.payment_date BETWEEN $1 AND $2)
      ORDER BY date DESC
    `;
    const recentPaymentsResult = await db.query(recentPaymentsQuery, [
      start_date,
      end_date,
    ]);
    const recentPaymentsForCurrentSem = recentPaymentsResult.rows;

    // Fetch all expenses for current semester
    const semesterExpensesQuery = `
      SELECT 
        e.expense_id as id,
        COALESCE(
          CASE 
            WHEN e.staff_id IS NOT NULL THEN CONCAT(s.first_name, ' ', s.last_name)
            WHEN e.supplier_id IS NOT NULL THEN sup.supplier_name
            ELSE e.recipient_name
          END,
          e.recipient_name
        ) as recipient_name,
        e.amount,
        e.expense_category,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD') as date
      FROM expenses e
      LEFT JOIN staff s ON e.staff_id = s.staff_id
      LEFT JOIN suppliers sup ON e.supplier_id = sup.supplier_id
      WHERE e.expense_date BETWEEN $1 AND $2
      ORDER BY e.expense_date DESC
    `;
    const semesterExpensesResult = await db.query(semesterExpensesQuery, [
      start_date,
      end_date,
    ]);
    const semesterExpensesForCurrentSem = semesterExpensesResult.rows;

    return NextResponse.json(
      {
        stats: {
          totalRevenue: parseFloat(stats.total_revenue) || 0,
          tuitionRevenue: parseFloat(stats.tuition_revenue) || 0,
          feedingRevenue: parseFloat(stats.feeding_revenue) || 0,
          feedingOnlyRevenue: parseFloat(stats.feeding_only_revenue) || 0,
          transportRevenue: parseFloat(stats.transport_revenue) || 0,
          outstandingPayments: parseFloat(stats.outstanding_payments) || 0,
          recentPayments: parseFloat(stats.total_recent_payments) || 0,
          averagePaymentTime:
            Math.round(parseFloat(stats.average_payment_time)) || 0,
          totalExpenses: parseFloat(stats.total_expenses) || 0,
        },
        dailyRevenue: {
          tuitionRevenue: parseFloat(dailyRevenue.tuition_revenue) || 0,
          feedingRevenue: parseFloat(dailyRevenue.feeding_revenue) || 0,
          transportRevenue: parseFloat(dailyRevenue.transport_revenue) || 0,
          totalDailyRevenue: parseFloat(dailyRevenue.total_daily_revenue) || 0,
        },
        weeklyReportData,
        monthlyReportData,
        semExpensesData,
        recentPaymentsForCurrentSem,
        semesterExpensesForCurrentSem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

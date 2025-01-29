import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req, { params }) {
  try {
    const statsQuery = `
      WITH daily_stats AS (
        SELECT 
          COALESCE(SUM(fc.amount_received), 0) as daily_revenue,
          COUNT(DISTINCT fc.student_id) as daily_payers
        FROM fee_collections fc
        WHERE DATE(fc.payment_date) = CURRENT_DATE AND fc.status='active'
      ),
      daily_expenses AS (
        SELECT COALESCE(SUM(e.amount), 0) as daily_expenses
        FROM expenses e
        WHERE DATE(e.expense_date) = CURRENT_DATE
      ),
      weekly_stats AS (
        SELECT 
          COALESCE(SUM(fc.amount_received), 0) as weekly_revenue,
          COUNT(DISTINCT fc.student_id) as weekly_payers
        FROM fee_collections fc
        WHERE fc.payment_date >= DATE_TRUNC('week', CURRENT_DATE) AND fc.status='active'
      ),
      weekly_expenses AS (
        SELECT COALESCE(SUM(e.amount), 0) as weekly_expenses
        FROM expenses e
        WHERE e.expense_date >= DATE_TRUNC('week', CURRENT_DATE)
      ),
      student_debt AS (
        SELECT COALESCE(SUM(amountowed), 0) as total_debt
        FROM students
        WHERE status = 'active'
      )
      SELECT 
        ds.daily_revenue,
        ds.daily_payers,
        de.daily_expenses,
        ws.weekly_revenue,
        ws.weekly_payers,
        we.weekly_expenses,
        sd.total_debt as outstanding_payments
      FROM 
        daily_stats ds, 
        daily_expenses de, 
        weekly_stats ws, 
        weekly_expenses we,
        student_debt sd
    `;
    const statsResult = await db.query(statsQuery);
    const stats = statsResult.rows[0];

    // Fetch daily report data (revenue and expenses for each day of the current week)
    const dailyReportDataQuery = `
      WITH days AS (
        SELECT generate_series(
          DATE_TRUNC('week', CURRENT_DATE),
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      ),
      daily_revenue AS (
        SELECT 
          DATE(payment_date) AS date,
          SUM(amount_received) AS revenue
        FROM fee_collections
        WHERE payment_date >= DATE_TRUNC('week', CURRENT_DATE) AND status='active'
        GROUP BY DATE(payment_date)
      ),
      daily_expenses AS (
        SELECT 
          DATE(expense_date) AS date,
          SUM(amount) AS expenses
        FROM expenses
        WHERE expense_date >= DATE_TRUNC('week', CURRENT_DATE)
        GROUP BY DATE(expense_date)
      )
      SELECT 
        TO_CHAR(d.date, 'YYYY-MM-DD') AS date,
        COALESCE(dr.revenue, 0) AS revenue,
        COALESCE(de.expenses, 0) AS expenses,
        COALESCE(dr.revenue, 0) - COALESCE(de.expenses, 0) AS profit
      FROM days d
      LEFT JOIN daily_revenue dr ON d.date = dr.date
      LEFT JOIN daily_expenses de ON d.date = de.date
      ORDER BY d.date
    `;
    const dailyReportDataResult = await db.query(dailyReportDataQuery);
    const dailyReportData = dailyReportDataResult.rows.map((row) => ({
      ...row,
      revenue: parseFloat(row.revenue),
      expenses: parseFloat(row.expenses),
      profit: parseFloat(row.profit),
    }));

    // Fetch expenses data by category for the current week
    const weeklyExpensesDataQuery = `
      SELECT 
        expense_category as name,
        CAST(ROUND(SUM(amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM expenses WHERE expense_date >= DATE_TRUNC('week', CURRENT_DATE)), 0)) AS INTEGER) as value
      FROM expenses
      WHERE expense_date >= DATE_TRUNC('week', CURRENT_DATE)
      GROUP BY expense_category
      ORDER BY value DESC
    `;
    const weeklyExpensesDataResult = await db.query(weeklyExpensesDataQuery);
    const weeklyExpensesData = weeklyExpensesDataResult.rows.map((row) => ({
      name: row.name,
      value: parseInt(row.value) || 0,
    }));

    // Fetch payments for the current week
    const recentPaymentsQuery = `
      SELECT 
        fc.collection_id as id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        fc.amount_received as amount,
        fc.old_balance,
        fc.new_balance,
        TO_CHAR(fc.payment_date, 'YYYY-MM-DD HH24:MI:SS') as date
      FROM fee_collections fc
      JOIN students s ON fc.student_id = s.student_id
      WHERE fc.payment_date >= DATE_TRUNC('week', CURRENT_DATE) AND fc.status='active'
      ORDER BY fc.payment_date DESC
    `;
    const recentPaymentsResult = await db.query(recentPaymentsQuery);
    const recentPaymentsForWeek = recentPaymentsResult.rows;

    // Fetch expenses for the current week
    const recentExpensesQuery = `
      SELECT 
        e.expense_id as id,
        e.recipient_name,
        e.amount,
        e.expense_category,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD HH24:MI:SS') as date
      FROM expenses e
      WHERE e.expense_date >= DATE_TRUNC('week', CURRENT_DATE)
      ORDER BY e.expense_date DESC
    `;
    const recentExpensesResult = await db.query(recentExpensesQuery);
    const recentExpensesForWeek = recentExpensesResult.rows;

    return NextResponse.json(
      {
        stats: {
          dailyRevenue: parseFloat(stats.daily_revenue) || 0,
          dailyPayers: parseInt(stats.daily_payers) || 0,
          dailyExpenses: parseFloat(stats.daily_expenses) || 0,
          weeklyRevenue: parseFloat(stats.weekly_revenue) || 0,
          weeklyPayers: parseInt(stats.weekly_payers) || 0,
          weeklyExpenses: parseFloat(stats.weekly_expenses) || 0,
          outstandingPayments: parseFloat(stats.outstanding_payments) || 0,
        },
        dailyReportData,
        weeklyExpensesData,
        recentPaymentsForWeek,
        recentExpensesForWeek,
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

export const dynamic = "force-dynamic";


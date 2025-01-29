import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/finance/getreport?startDate=2024-01-01&endDate=2024-12-31
export async function GET(req) {
  try {
    // Get query parameters for date range
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || "2024-01-01";
    const endDate = searchParams.get("endDate") || "2024-12-31";

    // Query for monthly revenue and expenses
    const monthlyDataQuery = `
      WITH monthly_revenue AS (
        SELECT
          DATE_TRUNC('month', payment_date)::DATE as month,
          SUM(COALESCE(feeding_fee, 0) + COALESCE(transport_fee, 0)) as feeding_revenue,
          0 as fee_revenue
        FROM feeding_fee_payments
        WHERE (payment_date BETWEEN $1 AND $2) 
        GROUP BY DATE_TRUNC('month', payment_date)
        
        UNION ALL
        
        SELECT
          DATE_TRUNC('month', payment_date)::DATE as month,
          0 as feeding_revenue,
          SUM(amount_received) as fee_revenue
        FROM fee_collections
        WHERE (payment_date BETWEEN $1 AND $2) AND status='active'
        AND status = 'active'
        GROUP BY DATE_TRUNC('month', payment_date)
      ),
      monthly_expenses AS (
        SELECT
          DATE_TRUNC('month', expense_date)::DATE as month,
          SUM(amount) as total_expenses
        FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('month', expense_date)
      ),
      combined_monthly AS (
        SELECT
          r.month,
          ROUND(SUM(r.feeding_revenue + r.fee_revenue)::numeric, 2) as revenue,
          ROUND(COALESCE(e.total_expenses, 0)::numeric, 2) as expenses
        FROM monthly_revenue r
        LEFT JOIN monthly_expenses e ON r.month = e.month
        GROUP BY r.month, e.total_expenses
      )
      SELECT
        month,
        revenue,
        expenses,
        ROUND((revenue - expenses)::numeric, 2) as profit
      FROM combined_monthly
      ORDER BY month;
    `;

    // Query for revenue distribution with 2 decimal places
    const revenueDistributionQuery = `
      WITH total_revenue AS (
        SELECT 
          SUM(CASE 
            WHEN f.feeding_fee > 0 THEN f.feeding_fee
            ELSE 0
          END) as feeding_total,
          SUM(CASE 
            WHEN f.transport_fee > 0 THEN f.transport_fee
            ELSE 0
          END) as transport_total,
          (SELECT SUM(amount_received) FROM fee_collections 
           WHERE status = 'active' AND payment_date BETWEEN $1 AND $2) as fees_total
        FROM feeding_fee_payments f
        WHERE f.payment_date BETWEEN $1 AND $2
      )
      SELECT 
        'Feeding Fees' as name,
        ROUND((feeding_total / NULLIF(feeding_total + transport_total + fees_total, 0) * 100)::numeric, 2) as value
      FROM total_revenue
      UNION ALL
      SELECT 
        'Transport Fees' as name,
        ROUND((transport_total / NULLIF(feeding_total + transport_total + fees_total, 0) * 100)::numeric, 2) as value
      FROM total_revenue
      UNION ALL
      SELECT 
        'Fees' as name,
        ROUND((fees_total / NULLIF(feeding_total + transport_total + fees_total, 0) * 100)::numeric, 2) as value
      FROM total_revenue;
    `;

    // Query for expense distribution
    const expenseDistributionQuery = `
      WITH total_expenses AS (
        SELECT SUM(amount) as total_amount
        FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
      )
      SELECT 
        expense_category as name,
        ROUND((SUM(amount) / NULLIF((SELECT total_amount FROM total_expenses), 0) * 100)::numeric, 2) as value
      FROM expenses
      WHERE expense_date BETWEEN $1 AND $2
      GROUP BY expense_category
      ORDER BY value DESC;
    `;

    // Execute all queries
    const [monthlyData, distributionData, expenseData] = await Promise.all([
      db.query(monthlyDataQuery, [startDate, endDate]),
      db.query(revenueDistributionQuery, [startDate, endDate]),
      db.query(expenseDistributionQuery, [startDate, endDate]),
    ]);

    // Process the distribution data to ensure numeric values
    const processedDistributionData = distributionData.rows.map((row) => ({
      name: row.name,
      value: Number(row.value) || 0,
    }));

    // Process the expense distribution data
    const processedExpenseData = expenseData.rows.map((row) => ({
      name: row.name,
      value: Number(row.value) || 0,
    }));

    return NextResponse.json(
      {
        monthlyData: monthlyData.rows,
        revenueDistribution: processedDistributionData,
        expenseDistribution: processedExpenseData,
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

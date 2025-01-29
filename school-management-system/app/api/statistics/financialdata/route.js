import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/statistics/financialdata

export async function GET(req) {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = currentDate.getDate();

    const yearlyQuery = `
      WITH monthly_data AS (
        SELECT
          DATE_TRUNC('month', payment_date) AS month,
          SUM(amount_received) AS income,
          0 AS expenses
        FROM
          fee_collections
        WHERE
          EXTRACT(YEAR FROM payment_date) = $1
          AND status = 'active'
        GROUP BY
          DATE_TRUNC('month', payment_date)

        UNION ALL

        SELECT
          DATE_TRUNC('month', expense_date) AS month,
          0 AS income,
          SUM(amount) AS expenses
        FROM
          expenses
        WHERE
          EXTRACT(YEAR FROM expense_date) = $1
        GROUP BY
          DATE_TRUNC('month', expense_date)
      )
      SELECT
        TO_CHAR(month, 'Mon') AS month_name,
        EXTRACT(MONTH FROM month) AS month_number,
        SUM(income) AS income,
        SUM(expenses) AS expenses
      FROM
        monthly_data
      GROUP BY
        month
      ORDER BY
        month_number
    `;

    const currentMonthQuery = `
      SELECT
        SUM(amount_received) AS revenue
      FROM
        fee_collections
      WHERE
        EXTRACT(YEAR FROM payment_date) = $1
        AND EXTRACT(MONTH FROM payment_date) = $2
        AND status = 'active'
    `;

    const currentDayQuery = `
      SELECT
        SUM(amount_received) AS revenue
      FROM
        fee_collections
      WHERE
        EXTRACT(YEAR FROM payment_date) = $1
        AND EXTRACT(MONTH FROM payment_date) = $2
        AND EXTRACT(DAY FROM payment_date) = $3
        AND status = 'active'
    `;

    const [yearlyResult, currentMonthResult, currentDayResult] =
      await Promise.all([
        db.query(yearlyQuery, [currentYear]),
        db.query(currentMonthQuery, [currentYear, currentMonth]),
        db.query(currentDayQuery, [currentYear, currentMonth, currentDay]),
      ]);

    if (yearlyResult.rows.length > 0) {
      const formattedData = yearlyResult.rows.map((row) => ({
        month: row.month_name,
        income: parseFloat(row.income),
        expenses: parseFloat(row.expenses),
      }));

      const currentMonthRevenue =
        parseFloat(currentMonthResult.rows[0]?.revenue) || 0;
      const currentDayRevenue =
        parseFloat(currentDayResult.rows[0]?.revenue) || 0;

      return NextResponse.json(
        {
          yearlyData: formattedData,
          currentMonthRevenue: currentMonthRevenue,
          currentDayRevenue: currentDayRevenue,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No data found for the current year" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

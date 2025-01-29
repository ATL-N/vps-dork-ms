import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/statistics/getstaffrolecount

export async function GET() {
  try {
    const query = `
      SELECT role as department, COUNT(*) as count
      FROM staff
      WHERE status = 'active'
      GROUP BY role
      ORDER BY count DESC
    `;

    const result = await db.query(query);

    // Transform the result to match the desired format
    const data = result.rows.map((row) => ({
      department: row.department,
      count: parseInt(row.count, 10),
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";


import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/statistics/academicperformancedata

export async function GET(req) {
  try {
    const query = `
      SELECT 
        s.subject_name AS subject,
        ROUND(AVG(sg.total_score), 2) AS averageScore
      FROM 
        subjects s
      JOIN 
        student_grades sg ON s.subject_id = sg.subject_id
      WHERE 
        s.status = 'active' AND sg.status = 'active'
      GROUP BY 
        s.subject_name
      ORDER BY 
        s.subject_name
    `;

    const result = await db.query(query);

    if (result.rows.length > 0) {
      const formattedData = result.rows.map((row) => ({
        subject: row.subject,
        averageScore: parseFloat(row.averagescore),
      }));

      return NextResponse.json(formattedData, { status: 200 });
    } else {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching subject average scores:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";


import db from "../../../lib/db";
import { NextResponse } from "next/server";


// /api/attendance/getattendanceforclassanddate?class_id=123&attendance_date=2024-01-11
export async function GET(req) {
  try {
    // Get query parameters from the URL
    const url = new URL(req.url);
    const class_id = url.searchParams.get("class_id");
    const attendance_date = url.searchParams.get("attendance_date");

    // Validate required parameters
    if (!class_id || !attendance_date) {
      return NextResponse.json(
        {
          error:
            "Missing required query parameters: class_id and attendance_date",
        },
        { status: 400 }
      );
    }

    // Query to get attendance records
    const query = `
      SELECT 
        a.student_id,
        a.status,
        a.class_id,
        a.attendance_date,
        a.semester_id,
        a.staff_id
      FROM attendance a
      WHERE 
        a.class_id = $1 
        AND a.attendance_date = $2
    `;

    const result = await db.query(query, [class_id, attendance_date]);

    // If no records found
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: "No attendance records found for the specified class and date",
        },
        { status: 404 }
      );
    }

    // Transform the data to match the POST request format
    const transformedData = {
      class_id,
      attendance_date,
      semester_id: result.rows[0].semester_id,
      user_id: result.rows[0].staff_id,
      attendance: result.rows.map((row) => ({
        student_id: row.student_id,
        status: row.status,
      })),
    };

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";


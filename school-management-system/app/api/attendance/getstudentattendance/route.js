import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/attendance/getattendance

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const class_id = searchParams.get("class_id");
    const attendance_date = searchParams.get("attendance_date");

    if (!class_id || !attendance_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const query = `
      SELECT a.attendance_id, a.student_id, s.student_name, a.status
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      WHERE a.class_id = $1 AND a.attendance_date = $2
    `;

    const result = await db.query(query, [class_id, attendance_date]);

    const attendanceData = result.rows.map((row) => ({
      attendance_id: row.attendance_id,
      student_id: row.student_id,
      student_name: row.student_name,
      status: row.status,
    }));

    return NextResponse.json(
      {
        class_id,
        attendance_date,
        attendance: attendanceData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";


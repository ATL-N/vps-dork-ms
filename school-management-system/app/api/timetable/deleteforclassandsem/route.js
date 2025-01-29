import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/timetable/deleteforclassandsem?classId=123&semesterId=456'
export async function DELETE(req) {
  try {
    // Extract classId and semesterId from the URL parameters
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const semesterId = url.searchParams.get("semesterId");

    // Validate required parameters
    if (!classId || !semesterId) {
      return NextResponse.json(
        { error: "Missing required parameters: classId and semesterId" },
        { status: 400 }
      );
    }

    // Start a transaction
    await db.query("BEGIN");

    // Check if timetable entries exist for the given class and semester
    const checkQuery = `
      SELECT COUNT(*) FROM timetable 
      WHERE class_id = $1 AND semester_id = $2;
    `;
    const { rows } = await db.query(checkQuery, [classId, semesterId]);

    if (rows[0].count === "0") {
      await db.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "No timetable entries found for the specified class and semester",
        },
        { status: 404 }
      );
    }

    // Delete timetable entries
    const deleteQuery = `
      DELETE FROM timetable 
      WHERE class_id = $1 AND semester_id = $2
      RETURNING *;
    `;
    const result = await db.query(deleteQuery, [classId, semesterId]);

    // Commit the transaction
    await db.query("COMMIT");

    console.log(
      `Timetable entries deleted successfully for class ${classId} and semester ${semesterId}. Deleted ${result.rowCount} entries.`
    );

    return NextResponse.json(
      {
        message: "Timetable deleted successfully",
        deletedEntries: result.rowCount,
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

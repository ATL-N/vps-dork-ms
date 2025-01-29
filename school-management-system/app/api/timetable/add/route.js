import db from "../../../lib/db";
import { NextResponse } from "next/server";

// Helper function to check if two time periods overlap
function doPeriodsOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { classId, semesterId, timetable, periods } = body;

    if (!classId || !semesterId || !timetable || !periods) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start a transaction
    await db.query("BEGIN");

    // Check for clashes
    const clashCheckQuery = `
      SELECT t.*, s.first_name, s.last_name, c.class_name as clash_class_name
      FROM timetable t
      JOIN staff s ON t.teacher_id = s.staff_id
      JOIN classes c ON t.class_id = c.class_id
      WHERE t.teacher_id = $1 AND t.day_of_week = $2 AND t.semester_id = $3
        AND ((t.start_time <= $4 AND t.end_time > $4)
          OR (t.start_time < $5 AND t.end_time >= $5)
          OR ($4 <= t.start_time AND $5 >= t.end_time));
    `;

    // Get the class name for the current class
    const currentClassQuery = `
      SELECT class_name FROM classes WHERE class_id = $1;
    `;
    const currentClassResult = await db.query(currentClassQuery, [classId]);
    const currentClassName = currentClassResult.rows[0].class_name;

    for (const day in timetable) {
      for (const periodNumber in timetable[day]) {
        const entry = timetable[day][periodNumber];
        const period = periods.find((p) => p.number === parseInt(periodNumber));

        const { rows } = await db.query(clashCheckQuery, [
          entry.teacher,
          day,
          semesterId,
          period.startTime,
          period.endTime,
        ]);

        if (rows.length > 0) {
          const clash = rows[0];
          return NextResponse.json(
            {
              error: `Clash detected for ${clash.first_name} ${clash.last_name} on ${day} between ${period.startTime}-${period.endTime} and ${clash.start_time}-${clash.end_time}. Classes involved: ${currentClassName} and ${clash.clash_class_name}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Delete existing timetable entries for the class and semester
    const deleteQuery = `
      DELETE FROM timetable WHERE class_id = $1 AND semester_id = $2;
    `;
    await db.query(deleteQuery, [classId, semesterId]);

    // Insert new timetable entries
    const insertQuery = `
      INSERT INTO timetable (class_id, semester_id, subject_id, teacher_id, room_id, day_of_week, period_number, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;

    for (const day in timetable) {
      for (const periodNumber in timetable[day]) {
        const entry = timetable[day][periodNumber];
        const period = periods.find((p) => p.number === parseInt(periodNumber));

        await db.query(insertQuery, [
          classId,
          semesterId,
          entry.subject,
          entry.teacher,
          entry.room,
          day,
          periodNumber,
          period.startTime,
          period.endTime,
        ]);
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    console.log(
      `Timetable for class ${classId} and semester ${semesterId} added successfully`
    );

    return NextResponse.json(
      { message: "Timetable added successfully" },
      { status: 201 }
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

import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  // const db = await db.connect();

  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body in addsemesterapi", body);

    const { semester_name, start_date, end_date, status } = body;

    if (!semester_name || !start_date || !end_date || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if start_date is before end_date
    if (new Date(start_date) >= new Date(end_date)) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Check for overlapping dates
    const overlapQuery = `
      SELECT semester_id 
      FROM semesters 
      WHERE 
        (($1 BETWEEN start_date AND end_date) OR
         ($2 BETWEEN start_date AND end_date) OR
         (start_date BETWEEN $1 AND $2) OR
         (end_date BETWEEN $1 AND $2));
    `;

    const overlapResult = await db.query(overlapQuery, [
      start_date,
      end_date,
    ]);

    if (overlapResult.rows.length > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "The new semester dates overlap with an existing semester" },
        { status: 409 }
      );
    }

    // Check if there's an active semester
    const checkActiveQuery = `
      SELECT semester_id 
      FROM semesters 
      WHERE status = 'active';
    `;

    const activeResult = await db.query(checkActiveQuery);

    if (activeResult.rows.length > 0 && status === "active") {
      // If there's an active semester and the new one is also active,
      // update the existing active semester to 'completed'
      const updateQuery = `
        UPDATE semesters
        SET status = 'completed'
        WHERE semester_id = $1;
      `;
      await db.query(updateQuery, [activeResult.rows[0].semester_id]);
    }

    // Check if semester_name already exists
    const checkNameQuery = `
      SELECT semester_id 
      FROM semesters 
      WHERE LOWER(semester_name) = LOWER($1);
    `;

    const nameCheckResult = await db.query(checkNameQuery, [semester_name]);

    if (nameCheckResult.rows.length > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Semester name already exists. Try adding another semester" },
        { status: 409 } // 409 Conflict
      );
    }

    // If all checks pass, proceed with insertion
    const insertQuery = `
      INSERT INTO semesters (semester_name, start_date, end_date, status)
      VALUES ($1, $2, $3, $4)
      RETURNING semester_id;
    `;

    const insertResult = await db.query(insertQuery, [
      semester_name,
      start_date,
      end_date,
      status,
    ]);
    const newSemesterId = insertResult.rows[0].semester_id;

    await db.query("COMMIT");

    console.log(`Semester ${newSemesterId} added successfully`);

    return NextResponse.json(
      { message: "Semester added successfully", id: newSemesterId },
      { status: 201 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // db.release();
  }
}

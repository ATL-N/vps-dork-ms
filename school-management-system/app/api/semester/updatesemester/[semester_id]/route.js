import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/semester/updatesemester

export async function PUT(req, { params }) {
  const { semester_id } = params;

  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body in updateSemesterApi", body);

    const { semester_name, start_date, end_date, status } = body;

    if (!semester_id || !semester_name || !start_date || !end_date || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the semester exists
    const checkExistQuery = `
      SELECT * FROM semesters WHERE semester_id = $1;
    `;
    const existResult = await db.query(checkExistQuery, [semester_id]);

    if (existResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      );
    }

    const currentSemester = existResult.rows[0];

    // Check if start_date is before end_date
    if (new Date(start_date) >= new Date(end_date)) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Check for overlapping dates (excluding the current semester)
    const overlapQuery = `
      SELECT semester_id, semester_name, start_date, end_date
      FROM semesters 
      WHERE 
        semester_id != $1 AND
        (($2 BETWEEN start_date AND end_date) OR
         ($3 BETWEEN start_date AND end_date) OR
         (start_date BETWEEN $2 AND $3) OR
         (end_date BETWEEN $2 AND $3)) AND status='active';
    `;

    const overlapResult = await db.query(overlapQuery, [
      semester_id,
      start_date,
      end_date,
    ]);

    if (overlapResult.rows.length > 0) {
      await db.query("ROLLBACK");
      const overlapMessage = overlapResult.rows
        .map(
          (sem) =>
            `${sem.semester_name} (${new Date(
              sem.start_date
            ).toLocaleDateString()} - ${new Date(
              sem.end_date
            ).toLocaleDateString()})`
        )
        .join(", ");
      return NextResponse.json(
        {
          error: `The updated semester dates overlap with existing semesters: ${overlapMessage}`,
          overlappingSemesters: overlapResult.rows,
        },
        { status: 409 }
      );
    }

    // Check if semester_name already exists (excluding the current semester)
    const checkNameQuery = `
      SELECT semester_id 
      FROM semesters 
      WHERE LOWER(semester_name) = LOWER($1) AND semester_id != $2;
    `;

    const nameCheckResult = await db.query(checkNameQuery, [
      semester_name,
      semester_id,
    ]);

    if (nameCheckResult.rows.length > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Semester name already exists. Choose a different name." },
        { status: 409 }
      );
    }

    // Handle status changes
    if (status === "active" && currentSemester.status !== "active") {
      // If changing to active, set all other semesters to completed
      await db.query(`
        UPDATE semesters
        SET status = 'completed'
        WHERE status = 'active';
      `);
    } else if (status !== "active" && currentSemester.status === "active") {
      // If changing from active to non-active, ensure there's another active semester
      const activeCheck = await db.query(
        `
        SELECT COUNT(*) as count
        FROM semesters
        WHERE status = 'active' AND semester_id != $1;
      `,
        [semester_id]
      );

      if (activeCheck.rows[0].count === 0) {
        await db.query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "Cannot change the only active semester to inactive. There must always be an active semester.",
          },
          { status: 400 }
        );
      }
    }

    // If all checks pass, proceed with the update
    const updateQuery = `
      UPDATE semesters
      SET semester_name = $1, start_date = $2, end_date = $3, status = $4
      WHERE semester_id = $5
      RETURNING *;
    `;

    const updateResult = await db.query(updateQuery, [
      semester_name,
      start_date,
      end_date,
      status,
      semester_id,
    ]);
    const updatedSemester = updateResult.rows[0];

    await db.query("COMMIT");

    console.log(`Semester ${semester_id} updated successfully`);

    return NextResponse.json(
      {
        message: "Semester updated successfully",
        semester: updatedSemester,
      },
      { status: 200 }
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

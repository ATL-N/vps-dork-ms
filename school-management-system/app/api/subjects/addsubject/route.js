import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addsubjectapi", body);

    const { subject_name } = body;

    if (!subject_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if subject_name already exists
    const checkQuery = `
      SELECT subject_id FROM subjects WHERE LOWER(subject_name) = LOWER($1);
    `;

    const checkResult = await db.query(checkQuery, [subject_name]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Subject name already exists. Try adding another subject" },
        { status: 409 } // 409 Conflict
      );
    }

    // If subject doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO subjects (subject_name)
      VALUES ($1)
      RETURNING subject_id;
    `;

    const insertResult = await db.query(insertQuery, [subject_name]);
    const newSubjectId = insertResult.rows[0].subject_id;

    console.log(`Subject ${newSubjectId} added successfully`);

    return NextResponse.json(
      { message: "Subject added successfully", id: newSubjectId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("body in updateSubjectApi", body);

    const { subject_id, subject_name } = body;

    if (!subject_id || !subject_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the subject exists
    const checkExistQuery = `
      SELECT subject_id FROM subjects WHERE subject_id = $1;
    `;

    const existResult = await db.query(checkExistQuery, [subject_id]);

    if (existResult.rows.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if the new subject name already exists (excluding the current subject)
    const checkDuplicateQuery = `
      SELECT subject_id FROM subjects 
      WHERE LOWER(subject_name) = LOWER($1) AND subject_id != $2;
    `;

    const duplicateResult = await db.query(checkDuplicateQuery, [
      subject_name,
      subject_id,
    ]);

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Subject name already exists. Choose a different name." },
        { status: 409 } // 409 Conflict
      );
    }

    // If checks pass, proceed with the update
    const updateQuery = `
      UPDATE subjects 
      SET subject_name = $1
      WHERE subject_id = $2
      RETURNING subject_id, subject_name;
    `;

    const updateResult = await db.query(updateQuery, [
      subject_name,
      subject_id,
    ]);
    const updatedSubject = updateResult.rows[0];

    console.log(`Subject ${subject_id} updated successfully`);

    return NextResponse.json(
      {
        message: "Subject updated successfully",
        subject: updatedSubject,
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

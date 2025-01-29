import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/subjects/sujectdetails
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const query = `
      SELECT
        s.*
      FROM
        subjects s
      WHERE
        s.subject_id = $1 AND status='active'
      
    `;

    const { rows } = await db.query(query, [id]);
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function PUT(req, {params}) {
    const { id } = params;

    console.log('id', id)

  try {
    const body = await req.json();
    console.log("body in updateSubjectApi", body);

    const { subject_name, user_id } = body;

    if (!id || !subject_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the subject exists
    const checkExistQuery = `
      SELECT subject_id FROM subjects WHERE subject_id = $1;
    `;

    const existResult = await db.query(checkExistQuery, [id]);

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
      id,
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
      id,
    ]);
    const updatedSubject = updateResult.rows[0];

    console.log(`Subject ${id} updated successfully`);

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
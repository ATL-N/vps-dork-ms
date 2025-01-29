import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addsemesterapi", body, body.maximum_mark>body.minimum_mark);

    const { grade_name, minimum_mark, maximum_mark, grade_remark } = body;

    if (
      !grade_name ||
      !minimum_mark ||
      !maximum_mark ||
      !grade_remark 
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check if grade_name already exists
    const checkNameQuery = `
      SELECT gradescheme_id 
      FROM grading_scheme 
      WHERE LOWER(grade_name) = LOWER($1) AND status='active';
    `;

    const checkNameResult = await db.query(checkNameQuery, [grade_name]);

    if (checkNameResult.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Grade scheme name already exists. Try adding another grade scheme",
        },
        { status: 409 }
      );
    }

    // Check if the new grade range conflicts with existing grades
    const checkRangeQuery = `
      SELECT gradescheme_id 
      FROM grading_scheme 
      WHERE status='active' AND (
        ($1 BETWEEN minimum_mark AND maximum_mark) OR
        ($2 BETWEEN minimum_mark AND maximum_mark) OR
        (minimum_mark BETWEEN $1 AND $2) OR
        (maximum_mark BETWEEN $1 AND $2)
      );
    `;

    const checkRangeResult = await db.query(checkRangeQuery, [
      minimum_mark,
      maximum_mark,
    ]);

    if (checkRangeResult.rows.length > 0) {
      return NextResponse.json(
        { error: "The new grade range conflicts with existing grades" },
        { status: 409 }
      );
    }

    // If grade scheme doesn't exist and doesn't conflict, proceed with insertion
    const insertQuery = `
      INSERT INTO grading_scheme (grade_name, minimum_mark, maximum_mark, grade_remark)
      VALUES ($1, $2, $3, $4)
      RETURNING gradescheme_id;
    `;

    const insertResult = await db.query(insertQuery, [
      grade_name,
      minimum_mark,
      maximum_mark,
      grade_remark,
    ]);
    const newGradeId = insertResult.rows[0].gradescheme_id;

if(newGradeId){
    return NextResponse.json(
      { message: "Grade scheme added successfully", id: newGradeId },
      { status: 201 }
    );
  }else{
    return NextResponse.json(
      { error: "Error adding new grade scheme. An internal error occured " },
      { status: 409 }
    );
  }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

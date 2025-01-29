import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Adjust the import path as needed

//localhost:3000/api/fees/getfees/[student_id]
// /api/grading/getgradingscheme/[scheme_id]/route.js

export async function GET(req, { params }) {
  const { scheme_id } = params;

  try {
    const { rows } = await db.query(
      `
      SELECT 
      *  
      FROM
        grading_scheme
      WHERE
        gradescheme_id = $1
      ORDER BY
        grade_name, gradescheme_id desc
    `,
      [scheme_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Grading scheme not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function PUT(req, { params }) {
  const { scheme_id } = params;
  const body = await req.json();

  try {
    const { grade_name, minimum_mark, maximum_mark, grade_remark } = body;

    // Input validation
    if (
      !grade_name ||
      minimum_mark === undefined ||
      maximum_mark === undefined ||
      !grade_remark
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (parseFloat(maximum_mark) <= parseFloat(minimum_mark)) {
      return NextResponse.json(
        { error: "Maximum mark must be greater than minimum mark" },
        { status: 400 }
      );
    }

    // Check if grade_name already exists (excluding the current scheme)
    const checkNameQuery = `
      SELECT gradescheme_id 
      FROM grading_scheme 
      WHERE LOWER(grade_name) = LOWER($1) AND status='active' AND gradescheme_id != $2;
    `;

    const checkNameResult = await db.query(checkNameQuery, [
      grade_name,
      scheme_id,
    ]);

    if (checkNameResult.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Grade scheme name already exists. Please choose a different name.",
        },
        { status: 409 }
      );
    }

    // Check if the new grade range conflicts with existing grades (excluding the current scheme)
    const checkRangeQuery = `
      SELECT gradescheme_id 
      FROM grading_scheme 
      WHERE status='active' AND gradescheme_id != $3 AND (
        ($1 BETWEEN minimum_mark AND maximum_mark) OR
        ($2 BETWEEN minimum_mark AND maximum_mark) OR
        (minimum_mark BETWEEN $1 AND $2) OR
        (maximum_mark BETWEEN $1 AND $2)
      );
    `;

    const checkRangeResult = await db.query(checkRangeQuery, [
      minimum_mark,
      maximum_mark,
      scheme_id,
    ]);

    if (checkRangeResult.rows.length > 0) {
      return NextResponse.json(
        { error: "The new grade range conflicts with existing grades" },
        { status: 409 }
      );
    }

    // If no conflicts, proceed with the update
    const updateQuery = `
      UPDATE grading_scheme
      SET 
        grade_name = $1,
        minimum_mark = $2,
        maximum_mark = $3,
        grade_remark = $4
      WHERE gradescheme_id = $5 AND status = 'active'
      RETURNING *;
    `;

    const { rows } = await db.query(updateQuery, [
      grade_name,
      minimum_mark,
      maximum_mark,
      grade_remark,
      scheme_id,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Grading scheme not found or inactive" },
        { status: 404 }
      );
    }

    // Format the response
    const updatedScheme = {
      gradescheme_id: rows[0].gradescheme_id,
      grade_name: rows[0].grade_name,
      minimum_mark: parseFloat(rows[0].minimum_mark),
      maximum_mark: parseFloat(rows[0].maximum_mark),
      grade_remark: rows[0].grade_remark,
      status: rows[0].status,
    };

    return NextResponse.json(updatedScheme, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



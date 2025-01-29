import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Adjust the import path as needed

//localhost:3000/api/staff/evaluation

export async function GET(req, { params }) {
  const { id } = params;

  // console.log("id of evaluation", id);

  try {
    const { rows } = await db.query(
      `
      SELECT 
      
      TO_CHAR(e.evaluation_date, 'DD/MM/YYYY') as evaluation_date,
      e.teaching_effectiveness,
      e.classroom_management,
      e.student_engagement,
      e.professionalism,
      e.overall_rating,
      e.years_of_experience,
      e.comments
      FROM
        evaluations e
      WHERE
        e.evaluatee_id = $1
      ORDER BY 
        e.evaluation_id DESC
      LIMIT 10000
    `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const body = await req.json();
    const {
      evaluation_date,
      teaching_effectiveness,
      classroom_management,
      student_engagement,
      professionalism,
      overall_rating,
      years_of_experience,
      comments,
    } = body;

    // Update the evaluation data
    const { rowCount } = await db.query(
      `
      UPDATE evaluations
      SET 
        evaluation_date = $1,
        teaching_effectiveness = $2,
        classroom_management = $3,
        student_engagement = $4,
        professionalism = $5,
        overall_rating = $6,
        years_of_experience = $7,
        comments = $8
      WHERE 
        evaluation_id = $9
      `,
      [
        evaluation_date,
        teaching_effectiveness,
        classroom_management,
        student_engagement,
        professionalism,
        overall_rating,
        years_of_experience,
        comments,
        id,
      ]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Evaluation updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import db from "../../../lib/db"; // Adjust the import path as needed

//localhost:3000/api/staff/evaluation

// CREATE TABLE evaluations (
//     evaluation_id SERIAL PRIMARY KEY,
//     evaluatee_id INT REFERENCES staff(staff_id) ON DELETE CASCADE,
//     evaluation_date DATE NOT NULL,
//     teaching_effectiveness NUMERIC(2, 1) CHECK(teaching_effectiveness BETWEEN 1 AND 5),
//     classroom_management NUMERIC(2, 1) CHECK(classroom_management BETWEEN 1 AND 5),
//     student_engagement NUMERIC(2, 1) CHECK(student_engagement BETWEEN 1 AND 5),
//     professionalism NUMERIC(2, 1) CHECK(professionalism BETWEEN 1 AND 5),
//     overall_rating NUMERIC(2, 1) GENERATED ALWAYS AS (
//         (teaching_effectiveness + classroom_management + student_engagement + professionalism) / 4
//     ) STORED,
//     comments text,
//     years_of_experience int,
//     evaluator_id INT references staff(user_id) on delete cascade,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             status VARCHAR(20) DEFAULT 'active'
// );

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('body', body)
    const {
      evaluatee_id,
      evaluation_date,
      teaching_effectiveness,
      classroom_management,
      student_engagement,
      professionalism,
      comments,
      years_of_experience,
    } = body;

    // Validate input
    if (
      !evaluatee_id ||
      !evaluation_date ||
      !teaching_effectiveness ||
      !classroom_management ||
      !student_engagement ||
      !professionalism
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Perform the insertion
    const { rows } = await db.query(
      `INSERT INTO evaluations
       (evaluatee_id, evaluation_date, teaching_effectiveness, classroom_management, student_engagement, professionalism, comments, years_of_experience)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING evaluation_id, overall_rating`,
      [
        evaluatee_id,
        evaluation_date,
        teaching_effectiveness,
        classroom_management,
        student_engagement,
        professionalism,
        comments || "",
        years_of_experience || "",
      ]
    );

    // If the insertion was successful, rows[0] will contain the new evaluation_id and calculated overall_rating
    if (rows[0] && rows[0].evaluation_id) {
      return NextResponse.json(
        {
          message: "Evaluation added successfully",
          evaluation_id: rows[0].evaluation_id,
          overall_rating: rows[0].overall_rating,
        },
        { status: 201 }
      );
    } else {
      throw new Error("Failed to add evaluation");
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to add evaluation" },
      { status: 500 }
    );
  }
}

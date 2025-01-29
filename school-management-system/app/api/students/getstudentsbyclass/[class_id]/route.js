
import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/students/getstudentsbyclass/[class_id]

export async function GET(req, { params }) {
  const { class_id } = params;

  try {
    if (!class_id) {
      return NextResponse.json(
        { error: "Missing required class ID" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        student_id, 
        first_name, 
        last_name, 
        other_names, 
        date_of_birth, 
        gender, 
        national_id
      FROM 
        students 
      WHERE 
        class_id = $1 AND status = 'active'
      ORDER BY 
        last_name, first_name
    `;

    const result = await db.query(query, [class_id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No students found for the given class" },
        { status: 404 }
      );
    }

    const students = result.rows.map((student) => ({
      student_id: student.student_id,
      student_name:
        `${student.last_name} ${student.first_name} ${student.other_names}`.trim(),
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      national_id: student.national_id,
    }));

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

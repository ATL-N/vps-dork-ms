import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Adjust the import path as needed

//localhost:3000/api/fees/getfees/[student_id]

export async function GET(req, { params }) {
  const { student_id } = params;

  try {
    const { rows } = await db.query(
      `
      SELECT 
        s.photo,
        s.first_name,
        s.last_name,
        s.other_names,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
        s.gender,
        s.amountowed as old_balance,
        TO_CHAR(s.enrollment_date, 'YYYY-MM-DD') AS enrollment_date
      FROM
        students s
      LEFT JOIN 
        classes c ON s.class_id = c.class_id
      
      WHERE
        s.student_id = $1
      ORDER BY
        c.class_name, s.first_name, s.last_name
    `,
      [student_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "students not found" }, { status: 404 });
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
  const { student_id } = params;
  const body = await req.json();

  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone,
      email,
      hire_date,
      salary,
      qualification,
      subject_specialization,
      image_upload,
      role,
      // employee_id,
    } = body;

    const { rows } = await db.query(
      `
      UPDATE teachers
      SET 
        first_name = $1,
        last_name = $2,
        date_of_birth = $3,
        gender = $4,
        address = $5,
        phone = $6,
        email = $7,
        hire_date = $8,
        salary = $9,
        qualification = $10,
        subject_specialization = $11,
        image_upload = $12,
        role = $13
      WHERE teacher_id = $14
      RETURNING *
    `,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        address,
        phone,
        email,
        hire_date,
        salary,
        qualification,
        subject_specialization,
        image_upload,
        role,
        // employee_id,
        student_id,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "students not found" }, { status: 404 });
    }

    // Format date fields for the response
    const updatedTeacher = {
      ...rows[0],
      date_of_birth: new Date(rows[0].date_of_birth)
        .toISOString()
        .split("s")[0],
      hire_date: new Date(rows[0].hire_date).toISOString().split("s")[0],
    };

    return NextResponse.json(updatedTeacher, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

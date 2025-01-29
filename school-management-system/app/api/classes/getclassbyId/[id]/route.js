import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Adjust the import path as needed

//localhost:3000/api/classes/getclassbyId/[id]

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const { rows } = await db.query(
      `
      SELECT 
      *
      FROM
        classes cl
      WHERE
        cl.class_id = $1 AND cl.status='active'
    `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
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
  const { id } = params;
  const body = await req.json();
  console.log('body', body)

  try {
    const { class_name, class_level, staff_id, room_number } = body;

    if (!class_name || !staff_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { rows } = await db.query(
      `
      UPDATE classes
      SET 
        class_name = $1,
        class_level = $2,
        staff_id = $3,
        room_name = $4
      WHERE class_id = $5
      RETURNING *
    `,
      [class_name, class_level, staff_id, room_number, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Format date fields for the response
    // const updatedTeacher = {
    //   ...rows[0],
    //   date_of_birth: new Date(rows[0].date_of_birth)
    //     .toISOString()
    //     .split("T")[0],
    //   hire_date: new Date(rows[0].hire_date).toISOString().split("T")[0],
    // };

    return NextResponse.json({message: `update for ${class_name} complete`}, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import db from "../../../lib/db";
import { NextResponse } from "next/server";
// app/api/department/adddepartment

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addsubjectapi", body);

    const { department_name, head_of_department, description } = body;

    if (!department_name || !head_of_department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if department_name already exists
    const checkQuery = `
      SELECT department_id FROM departments WHERE LOWER(department_name) = LOWER($1);
    `;

    const checkResult = await db.query(checkQuery, [department_name]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "department name already exists. Try adding another department" },
        { status: 409 } // 409 Conflict
      );
    }

    // If department doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO departments (department_name, head_of_department, description)
      VALUES ($1, $2, $3)
      RETURNING department_id;
    `;

    const insertResult = await db.query(insertQuery, [department_name, head_of_department, description]);
    const newDepartmentId = insertResult.rows[0].department_id;

    console.log(`department ${newDepartmentId} added successfully`);

    return NextResponse.json(
      { message: "department added successfully", id: newDepartmentId },
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

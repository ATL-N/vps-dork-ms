import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addroleapi", body);

    const { role_name } = body;

    if (!role_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if role_name already exists
    const checkQuery = `
      SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER($1);
    `;

    const checkResult = await db.query(checkQuery, [role_name]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Role name already exists. Try adding another Role" },
        { status: 409 } // 409 Conflict
      );
    }

    // If Role doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO roles (role_name)
      VALUES ($1)
      RETURNING role_id;
    `;

    const insertResult = await db.query(insertQuery, [role_name]);
    const newRoleId = insertResult.rows[0].role_id;

    console.log(`Role ${newRoleId} added successfully`);

    return NextResponse.json(
      { message: "Role added successfully", id: newRoleId },
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

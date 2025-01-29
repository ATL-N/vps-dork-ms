import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/permission/addpermission

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addpermissionapi", body);

    const { permission_name } = body;

    if (!permission_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if permission_name already exists
    const checkQuery = `
      SELECT permission_id FROM permissions WHERE LOWER(permission_name) = LOWER($1);
    `;

    const checkResult = await db.query(checkQuery, [permission_name]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Permission name already exists. Try adding another Permission" },
        { status: 409 } // 409 Conflict
      );
    }

    // If Permission doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO permissions (permission_name)
      VALUES ($1)
      RETURNING permission_id;
    `;

    const insertResult = await db.query(insertQuery, [permission_name]);
    const newRoleId = insertResult.rows[0].permission_id;

    console.log(`Permission ${newRoleId} added successfully`);

    return NextResponse.json(
      { message: "Permission added successfully", id: newRoleId },
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

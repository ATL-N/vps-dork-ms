// app/api/rolesandpermissions/[role_id]/route.js
import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { role_id } = params;

  try {
    const query = `
      SELECT p.permission_id, p.permission_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE rp.role_id = $1
    `;
    const result = await db.query(query, [role_id]);

    return NextResponse.json(
      { permissions: result.rows },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

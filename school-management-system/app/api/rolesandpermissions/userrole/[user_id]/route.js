// app/api/rolesandpermissions/userrole/[user_id]/route.js
import db from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { user_id } = params;

  try {
    const query = `
      SELECT r.role_id, r.role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = $1
    `;
    const result = await db.query(query, [user_id]);

    return NextResponse.json(
      { roles: result.rows },
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

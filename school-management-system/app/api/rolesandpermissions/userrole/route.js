// app/api/rolesandpermissions/userrole
import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { user_id, roles } = await request.json();
    console.log("body", user_id, roles);

    // Start a transaction
    await db.query("BEGIN");

    // Delete existing roles for the role
    await db.query("DELETE FROM user_roles WHERE user_id = $1", [
      user_id,
    ]);

    // Insert new roles
    for (let role_id of roles) {
      await db.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [user_id, role_id]
      );
    }

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      { message: "roles updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query("ROLLBACK");
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

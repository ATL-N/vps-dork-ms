
// app/api/rolesandpermissions/addroleandpermission
import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { role_id, permissions } = await request.json();
    // console.log('body', role_id, permissions)

    // Start a transaction
    await db.query("BEGIN");

    // Delete existing permissions for the role
    await db.query("DELETE FROM role_permissions WHERE role_id = $1", [role_id]);

    // Insert new permissions
    for (let permissionId of permissions) {
      await db.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)",
        [role_id, permissionId]
      );
    }

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      { message: "Permissions updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query("ROLLBACK");
    console.error("Error updating role permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

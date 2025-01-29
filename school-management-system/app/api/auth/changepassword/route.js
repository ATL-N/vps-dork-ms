import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../lib/db";


// /api/auth/changepassword

export async function POST(req) {
  try {
    // Parse the JSON body from the request
    const body = await req.json();
    console.log("body in changePasswordApi", body);
    const { userId, currentPassword, newPassword } = body;

    // Validate the input
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the user from the database
    const getUserQuery = `
      SELECT * FROM users WHERE user_id = $1
    `;
    const userResult = await db.query(getUserQuery, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updatePasswordQuery = `
      UPDATE users
      SET password = $1
      WHERE user_id = $2
      RETURNING user_id, user_name, user_email
    `;
    const updateResult = await db.query(updatePasswordQuery, [
      hashedNewPassword,
      userId,
    ]);

    const updatedUser = updateResult.rows[0];
    console.log(
      `Password updated successfully for user ${updatedUser.user_id}`
    );

    // Return success response
    return NextResponse.json(
      { message: "Password changed successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// app/api/auth/signup/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../lib/db";

export async function POST(req) {
  try {
    // Parse the JSON body from the request
    const body = await req.json();
    console.log("body in signupapi", body);

    const { username, email, password } = body;

    // Validate the input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const checkUserQuery = `
      SELECT * FROM users WHERE user_email = $1
    `;
    const checkResult = await db.query(checkUserQuery, [email]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "user_email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert a new user
    const insertQuery = `
      INSERT INTO users (user_name, user_email, password)
      VALUES ($1, $2, $3)
      RETURNING user_id, user_name, user_email;
    `;

    // Execute the query using the imported db object
    const result = await db.query(insertQuery, [
      username,
      email,
      hashedPassword,
    ]);

    // Get the details of the newly inserted user
    const newUser = result.rows[0];

    console.log(`User ${newUser.user_id} added successfully`);

    // Return success response
    return NextResponse.json(
      { message: "User created successfully", user: newUser },
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

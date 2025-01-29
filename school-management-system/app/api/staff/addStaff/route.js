import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../lib/db";

export async function POST(req) {
  // const db = await db.connect();

  try {
    await db.query("BEGIN");

    const body = await req.json();
    const {
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      marital_status,
      address,
      phone_number,
      email,
      emergency_contact,
      date_of_joining,
      designation,
      department,
      salary,
      account_number,
      contract_type,
      employment_status,
      qualification,
      experience,
      blood_group,
      national_id,
      passport_number,
      photo,
      teaching_subject,
      role,
      // New fields for user_health_record
      medical_conditions,
      allergies,
      vaccination_status,
      last_physical_exam_date,
      sender_id,
    } = body;

    console.log("body", body);

    // Check if staff already exists
    const checkStaffQuery = `
      SELECT * FROM staff 
      WHERE first_name = $1 AND last_name = $2 AND middle_name = $3 AND gender = $4 AND date_of_birth = $5 AND status = 'active'
    `;
    const checkStaffResult = await db.query(checkStaffQuery, [
      first_name,
      last_name,
      middle_name,
      gender,
      date_of_birth,
    ]);

    if (checkStaffResult.rows.length > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Staff member already exists" },
        { status: 400 }
      );
    }

    // Check if user with given email already exists
    if (email !== "") {
      const checkUserQuery = `
      SELECT * FROM users WHERE user_email = $1
    `;
      const checkUserResult = await db.query(checkUserQuery, [email]);

      if (checkUserResult.rows.length > 0) {
        await db.query("ROLLBACK");
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Create user account
    const username = `${first_name} ${last_name} ${middle_name}`.toLowerCase();
    const hashedPassword = await bcrypt.hash(phone_number, 10);

    const insertUserQuery = `
      INSERT INTO users (user_name, user_email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id;
    `;

    const userResult = await db.query(insertUserQuery, [
      username,
      email,
      hashedPassword,
      role,
    ]);
    const user_id = userResult.rows[0].user_id;

    // Insert staff data
    const insertStaffQuery = `
      INSERT INTO staff
      (user_id, first_name, last_name, middle_name, date_of_birth, gender, marital_status, address, phone_number, email, emergency_contact, date_of_joining, designation, department, salary, account_number, contract_type, employment_status, qualification, experience, blood_group, national_id, passport_number, photo, teaching_subject, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING staff_id, first_name;
    `;

    const staffResult = await db.query(insertStaffQuery, [
      user_id,
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      marital_status,
      address,
      phone_number,
      email,
      emergency_contact,
      date_of_joining,
      designation,
      department,
      salary,
      account_number,
      contract_type,
      employment_status,
      qualification,
      experience,
      blood_group,
      national_id,
      passport_number,
      photo,
      teaching_subject,
      role,
    ]);

    const staff_first_name = staffResult.rows[0].first_name;

    // Insert health record data
    const insertHealthRecordQuery = `
      INSERT INTO user_health_record
      (user_id, medical_conditions, allergies, blood_group, vaccination_status, last_physical_exam_date)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;

    await db.query(insertHealthRecordQuery, [
      user_id,
      medical_conditions,
      allergies,
      blood_group,
      vaccination_status,
      last_physical_exam_date,
    ]);

    const notification_title = "New Staff Added";
    const notification_message = `A new staff(${staff_first_name}) has joined the school.`;
    const notification_type = "general";
    const priority = "normal";

    const notificationQuery = `
  INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING notification_id, notification_title;
`;

    const result = await db.query(notificationQuery, [
      notification_title,
      notification_message,
      notification_type,
      priority,
      sender_id,
    ]);

    await db.query("COMMIT");

    if (staffResult.rows[0] && staffResult.rows[0].staff_id) {
      return NextResponse.json(
        {
          message: `${staffResult.rows[0].first_name} added successfully as staff and user with health record`,
          staff_name: staffResult.rows[0].first_name,
          user_id: user_id,
        },
        { status: 201 }
      );
    } else {
      throw new Error("Failed to add staff");
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to add staff" }, { status: 500 });
  } finally {
    // db.release();
  }
}

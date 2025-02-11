import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../lib/db";

// /api/students/addstudent

export async function POST(req) {
  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body", body);

    const {
      photo,
      first_name,
      last_name,
      other_names,
      date_of_birth,
      gender,
      class_id,
      amountowed,
      residential_address,
      phone,
      email,
      enrollment_date,
      national_id,
      birth_cert_id,
      transportation_method,
      pick_up_point,
      feeding_fee,
      transport_fee,
      medical_conditions,
      allergies,
      blood_group,
      vaccination_status,
      health_insurance_id,
      parent1_other_names,
      parent1_last_name,
      parent1_phone,
      parent1_email,
      parent1_address,
      parent1_relationship,
      parent1_selection,
      parent2_other_names,
      parent2_last_name,
      parent2_phone,
      parent2_email,
      parent2_address,
      parent2_relationship,
      parent2_selection,
      // New feeding and transport details
    } = body;

    // Helper function to create a user
    async function createUser(username, email, phone, role) {
      const hashedPassword = await bcrypt.hash(phone, 10);
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
      return userResult.rows[0].user_id;
    }

    // Helper function to create a parent
    async function createParent(other_names, last_name, phone, email, address) {
      const username =
        ` ${last_name?.trim()} ${other_names?.trim()}`.toLowerCase();
      const user_id = await createUser(username, email, phone, "parent");

      const insertParentQuery = `
        INSERT INTO parents (user_id, other_names, last_name, phone, email, address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING parent_id;
      `;
      const parentResult = await db.query(insertParentQuery, [
        user_id,
        other_names,
        last_name,
        phone,
        email,
        address,
      ]);
      return parentResult.rows[0].parent_id;
    }

    // Step 1: Insert student into users table
    const studentUsername =
      `${last_name?.trim()} ${first_name?.trim()} ${other_names?.trim()}`.toLowerCase();
    const student_user_id = await createUser(
      studentUsername,
      email,
      phone,
      "student"
    );

    // Step 2: Insert into students table (modified to include class_promoted_to)
    const insertStudentQuery = `
      INSERT INTO students
      (user_id, first_name, last_name, other_names, date_of_birth, gender, class_id, class_promoted_to, amountowed, residential_address, phone, email, enrollment_date, national_id, birth_cert_id, photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING student_id;
    `;
    const studentResult = await db.query(insertStudentQuery, [
      student_user_id,
      first_name,
      last_name,
      other_names,
      date_of_birth,
      gender,
      class_id,
      amountowed,
      residential_address,
      phone,
      email,
      enrollment_date,
      national_id,
      birth_cert_id,
      photo,
    ]);
    const student_id = studentResult.rows[0].student_id;

    // Step 3: Insert into user_health_record table
    const insertHealthRecordQuery = `
      INSERT INTO user_health_record
      (user_id, medical_conditions, allergies, blood_group, vaccination_status, health_insurance_id)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    await db.query(insertHealthRecordQuery, [
      student_user_id,
      medical_conditions,
      allergies,
      blood_group,
      vaccination_status,
      health_insurance_id,
    ]);

    // NEW Step: Insert into feeding_transport_fees table
    const insertFeedingTransportQuery = `
      INSERT INTO feeding_transport_fees
      (student_id, transportation_method, pick_up_point, feeding_fee, transport_fee)
      VALUES ($1, $2, $3, $4, $5);
    `;

    // Sanitize all relevant fields
    const sanitizedPickUpPoint =
      pick_up_point === "" || pick_up_point === undefined
        ? null
        : pick_up_point;
    const sanitizedFeedingFee =
      feeding_fee === "" || feeding_fee === undefined ? null : feeding_fee;
    const sanitizedTransportFee =
      transport_fee === "" || transport_fee === undefined
        ? null
        : transport_fee;

    await db.query(insertFeedingTransportQuery, [
      student_id,
      transportation_method,
      sanitizedPickUpPoint,
      sanitizedFeedingFee,
      sanitizedTransportFee,
    ]);

    // Step 4: Handle parent1
    let parent1_id = parent1_selection;
    if (!parent1_id) {
      parent1_id = await createParent(
        parent1_other_names,
        parent1_last_name,
        parent1_phone,
        parent1_email,
        parent1_address
      );
    }

    // Step 5: Handle parent2
    let parent2_id = parent2_selection;
    if (!parent2_id && parent2_last_name != "" && parent2_relationship != "") {
      parent2_id = await createParent(
        parent2_other_names,
        parent2_last_name,
        parent2_phone,
        parent2_email,
        parent2_address
      );
    }

    // Step 6: Link students and parents
    const insertParentStudentQuery = `
      INSERT INTO student_parent (student_id, parent_id, relationship)
      VALUES ($1, $2, $3);
    `;

    // Link parent1
    await db.query(insertParentStudentQuery, [
      student_id,
      parent1_id,
      parent1_relationship,
    ]);

    // Link parent2
    if (parent2_relationship != "") {
      await db.query(insertParentStudentQuery, [
        student_id,
        parent2_id,
        parent2_relationship,
      ]);
    }

    // After all the student-related insertions are complete, add the notification
    const notification_title = "New Student Registration";
    const notification_message = `A new student ${first_name} ${last_name} has been registered with ID: ${student_id}`;
    const notification_type = "student";
    const priority = "normal";

    const notificationQuery = `
      INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING notification_id, notification_title;
    `;

    const notificationResult = await db.query(notificationQuery, [
      notification_title,
      notification_message,
      notification_type,
      priority,
      student_user_id, // using the student's user_id as the sender
    ]);

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `${first_name} ${last_name} added successfully as student with associated records.`,
        student_id: student_id,
        user_id: student_user_id,
      },
      { status: 201 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to add student" },
      { status: 500 }
    );
  }
}

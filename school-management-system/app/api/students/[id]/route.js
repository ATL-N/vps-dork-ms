import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../lib/db";

// GET /api/students/[id]
export async function GET(req, { params }) {
  const { id } = params;

  try {
    // Fetch student data
    const studentQuery = `
      SELECT 
      s.*, 
      TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
      TO_CHAR(s.enrollment_date, 'YYYY-MM-DD') AS enrollment_date,
      u.user_name, 
      u.user_email,
      ft.transportation_method,
      ft.pick_up_point,
      ft.feeding_fee,
      ft.transport_fee
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN feeding_transport_fees ft ON s.student_id = ft.student_id
      WHERE s.student_id = $1
    `;
    const studentResult = await db.query(studentQuery, [id]);

    if (studentResult.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentResult.rows[0];

    // Fetch health record
    const healthQuery = `
      SELECT * FROM user_health_record
      WHERE user_id = $1
    `;
    const healthResult = await db.query(healthQuery, [student.user_id]);
    const healthRecord = healthResult.rows[0] || {};

    // Fetch parents
    const parentsQuery = `
      SELECT p.*, sp.relationship
      FROM parents p
      JOIN student_parent sp ON p.parent_id = sp.parent_id
      WHERE sp.student_id = $1
    `;
    const parentsResult = await db.query(parentsQuery, [id]);
    const parents = parentsResult.rows;

    // Combine all data
    const studentData = {
      ...student,
      ...healthRecord,
      parent1: parents[0] || {},
      parent2: parents[1] || {},
    };

    return NextResponse.json(studentData, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// // PUT /api/students/[id]
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import db from "../../../lib/db";

// PUT /api/students/[id]
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import db from "../../../lib/db";

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  console.log("body 22255555552222", body);

  try {
    await db.query("BEGIN");

    // Helper function to create parent user only if parent doesn't exist
    async function getOrCreateParentUser(
      parentId,
      other_names,
      last_name,
      phone,
      email
    ) {
      // If parentId exists, get the existing user_id
      if (parentId) {
        const getParentQuery = `
          SELECT user_id FROM parents WHERE parent_id = $1;
        `;
        const existingParent = await db.query(getParentQuery, [parentId]);
        if (existingParent.rows.length > 0) {
          return existingParent.rows[0].user_id;
        }
      }

      // If no parent exists, create new user
      const username = `${other_names} ${last_name}`.toLowerCase();
      const hashedPassword = await bcrypt.hash(phone, 10);

      const insertUserQuery = `
        INSERT INTO users (user_name, user_email, password, role)
        VALUES ($1, $2, $3, 'parent')
        RETURNING user_id;
      `;

      const userResult = await db.query(insertUserQuery, [
        username,
        email,
        hashedPassword,
      ]);

      return userResult.rows[0].user_id;
    }

    // Update students table
    const updateStudentQuery = `
      UPDATE students
      SET
        first_name = $1, last_name = $2, other_names = $3, date_of_birth = $4,
        gender = $5, class_id = $6, class_promoted_to = $6, amountowed = $7, residential_address = $8,
        phone = $9, email = $10, enrollment_date = $11, national_id = $12,
        birth_cert_id = $13, photo = $14
      WHERE student_id = $15
      RETURNING *;
    `;
    const studentResult = await db.query(updateStudentQuery, [
      body.first_name,
      body.last_name,
      body.other_names,
      body.date_of_birth,
      body.gender,
      body.class_id,
      body.amountowed,
      body.residential_address,
      body.phone,
      body.email,
      body.enrollment_date,
      body.national_id,
      body.birth_cert_id,
      body.photo,
      id,
    ]);

    if (studentResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentResult.rows[0];

    // Sanitize the feeding and transport related fields
    const sanitizedPickUpPoint =
      body.pick_up_point === "" || body.pick_up_point === undefined
        ? null
        : body.pick_up_point;
    const sanitizedFeedingFee =
      body.feeding_fee === "" || body.feeding_fee === undefined
        ? null
        : body.feeding_fee;
    const sanitizedTransportFee =
      body.transport_fee === "" || body.transport_fee === undefined
        ? null
        : body.transport_fee;
    const sanitizedTransportMethod =
      body.transportation_method === "" ||
      body.transportation_method === undefined
        ? null
        : body.transportation_method;

    // Check if feeding transport record exists
    const checkFeedingTransportQuery = `
      SELECT * FROM feeding_transport_fees WHERE student_id = $1;
    `;

    const existingRecord = await db.query(checkFeedingTransportQuery, [id]);

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const updateFeedingTransportQuery = `
        UPDATE feeding_transport_fees 
        SET
          transportation_method = $2,
          pick_up_point = $3,
          feeding_fee = $4,
          transport_fee = $5
        WHERE student_id = $1;
      `;
      await db.query(updateFeedingTransportQuery, [
        id,
        sanitizedTransportMethod,
        sanitizedPickUpPoint,
        sanitizedFeedingFee,
        sanitizedTransportFee,
      ]);
    } else {
      // Insert new record
      const insertFeedingTransportQuery = `
        INSERT INTO feeding_transport_fees 
        (student_id, transportation_method, pick_up_point, feeding_fee, transport_fee)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await db.query(insertFeedingTransportQuery, [
        id,
        sanitizedTransportMethod,
        sanitizedPickUpPoint,
        sanitizedFeedingFee,
        sanitizedTransportFee,
      ]);
    }

    // Update user_health_record table
    const updateHealthQuery = `
      UPDATE user_health_record
      SET
        medical_conditions = $1, allergies = $2, blood_group = $3,
        vaccination_status = $4, health_insurance_id = $5
      WHERE user_id = $6;
    `;
    await db.query(updateHealthQuery, [
      body.medical_conditions,
      body.allergies,
      body.blood_group,
      body.vaccination_status,
      body.health_insurance_id,
      student.user_id,
    ]);

    // Update parents
    for (let i = 1; i <= 2; i++) {
      const parentPrefix = `parent${i}`;
      const parentId = body[`${parentPrefix}_selection`];

      // Get or create parent user - now checks based on parent_id
      const parentUserId = await getOrCreateParentUser(
        parentId,
        body[`${parentPrefix}_other_names`],
        body[`${parentPrefix}_last_name`],
        body[`${parentPrefix}_phone`],
        body[`${parentPrefix}_email`]
      );

      if (parentId) {
        // Update existing parent
        const updateParentQuery = `
          UPDATE parents
          SET
            user_id = $1,
            other_names = $2, 
            last_name = $3, 
            phone = $4, 
            email = $5, 
            address = $6
          WHERE parent_id = $7;
        `;
        await db.query(updateParentQuery, [
          parentUserId,
          body[`${parentPrefix}_other_names`],
          body[`${parentPrefix}_last_name`],
          body[`${parentPrefix}_phone`],
          body[`${parentPrefix}_email`],
          body[`${parentPrefix}_address`],
          parentId,
        ]);

        // Update relationship
        const updateRelationshipQuery = `
          UPDATE student_parent
          SET relationship = $1
          WHERE student_id = $2 AND parent_id = $3;
        `;
        await db.query(updateRelationshipQuery, [
          body[`${parentPrefix}_relationship`],
          id,
          parentId,
        ]);
      } else {
        // Insert new parent
        const insertParentQuery = `
          INSERT INTO parents 
          (user_id, other_names, last_name, phone, email, address)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING parent_id;
        `;
        const parentResult = await db.query(insertParentQuery, [
          parentUserId,
          body[`${parentPrefix}_other_names`],
          body[`${parentPrefix}_last_name`],
          body[`${parentPrefix}_phone`],
          body[`${parentPrefix}_email`],
          body[`${parentPrefix}_address`],
        ]);
        const newParentId = parentResult.rows[0].parent_id;

        // Link new parent to student
        const insertRelationshipQuery = `
          INSERT INTO student_parent (student_id, parent_id, relationship)
          VALUES ($1, $2, $3);
        `;
        await db.query(insertRelationshipQuery, [
          id,
          newParentId,
          body[`${parentPrefix}_relationship`],
        ]);
      }
    }

    await db.query("COMMIT");

    // Create notification
    const notification_title = "Student Information Updated";
    const notification_message = `Student ${body.first_name} ${body.last_name}'s information has been updated.`;
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
      student.user_id,
    ]);

    return NextResponse.json(
      {
        message: "Student updated successfully",
        notification: {
          id: notificationResult.rows[0].notification_id,
          title: notificationResult.rows[0].notification_title,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update student", details: error.message },
      { status: 500 }
    );
  }
}

import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/classes/addclass

export async function POST(req) {
  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body in addclassapi", body);

    const { class_name, class_level, staff_id, room_number, capacity, user_id } = body;

    if (!class_name || !class_level || !staff_id) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if class_name already exists
    const checkNameQuery = `
      SELECT class_id 
      FROM classes 
      WHERE LOWER(class_name) = LOWER($1) AND status='active';
    `;

    const checkNameResult = await db.query(checkNameQuery, [class_name]);

    if (checkNameResult.rows.length > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Class name already exists. Try adding another class" },
        { status: 409 }
      );
    }

    // If class doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO classes (class_name, class_level, staff_id, room_name, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING class_id, class_name;
    `;

    const insertResult = await db.query(insertQuery, [
      class_name,
      class_level,
      staff_id,
      room_number,
      capacity,
    ]);

    const newClass = insertResult.rows[0];

    if (newClass) {
      // Create a notification for the new class
      const notification_title = "New Class Added";
      const notification_message = `A new class "${newClass.class_name}" has been added to the system.`;
      const notification_type = "general";
      const priority = "normal";
      const sender_id = staff_id; // Using the staff_id as the sender

      const notificationQuery = `
        INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING notification_id;
      `;

      await db.query(notificationQuery, [
        notification_title,
        notification_message,
        notification_type,
        priority,
        user_id,
      ]);

      await db.query("COMMIT");

      return NextResponse.json(
        {
          message: `${newClass.class_name} added successfully`,
          id: newClass.class_id,
        },
        { status: 201 }
      );
    } else {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: `Failed to add class (${class_name})` },
        { status: 500 }
      );
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

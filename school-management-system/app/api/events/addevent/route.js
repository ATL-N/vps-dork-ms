import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    // console.log("body in addclassapi", body);
    await db.query("BEGIN");

    const {
      event_title,
      event_type,
      event_date,
      start_time,
      end_time,
      location,
      description,
      target_audience,
      user_id,
    } = body;

    if (!event_title || !event_type || !event_date || !start_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if event_title already exists
    const checkNameQuery = `
      SELECT event_id 
      FROM events 
      WHERE LOWER(event_title) = LOWER($1) and event_date = $2 AND status='active';
    `;

    const checkNameResult = await db.query(checkNameQuery, [
      event_title,
      event_date,
    ]);

    if (checkNameResult.rows.length > 0) {
      return NextResponse.json(
        { error: "event name already exists. Try adding another event" },
        { status: 409 }
      );
    }

    // If event doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO events (event_title, event_type, event_date, start_time, end_time, location, description, target_audience, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING event_id, event_title;
    `;

    const insertResult = await db.query(insertQuery, [
      event_title,
      event_type,
      event_date,
      start_time,
      end_time,
      location,
      description,
      target_audience,
      user_id,
    ]);

    const newClass = insertResult.rows[0];

    // Create a notification for the soft delete
    const notification_title = `Event Added`;
    const notification_message = `Event ${event_title} has been added to the system.`;
    const notification_type = "alert";
    const priority = "normal";
    // const sender_id = user_id; // You might want to change this to the ID of the user performing the deletion

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

    if (newClass) {
      return NextResponse.json(
        {
          message: `${newClass.event_title} added successfully`,
          id: newClass.event_id,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: `Failed to add event (${event_title}) ` },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

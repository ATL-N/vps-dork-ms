import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/events/updateevent

export async function PUT(req, { params }) {
  try {
    const { event_id } = params;
    const body = await req.json();
    console.log('body', body)

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

    // Check if event exists
    const checkEventQuery = `
      SELECT event_id 
      FROM events 
      WHERE event_id = $1 AND status='active';
    `;

    const checkEventResult = await db.query(checkEventQuery, [event_id]);

    if (checkEventResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found or inactive" },
        { status: 404 }
      );
    }

    // Check if the updated event_title already exists for another event
    const checkNameQuery = `
      SELECT event_id 
      FROM events 
      WHERE LOWER(event_title) = LOWER($1) AND event_date = $2 AND status='active' AND event_id != $3;
    `;

    const checkNameResult = await db.query(checkNameQuery, [
      event_title,
      event_date,
      event_id
    ]);

    if (checkNameResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Event name already exists for another event on the same date" },
        { status: 409 }
      );
    }

    // If checks pass, proceed with update
    const updateQuery = `
      UPDATE events 
      SET event_title = $1, event_type = $2, event_date = $3, start_time = $4, 
          end_time = $5, location = $6, description = $7, target_audience = $8, 
          user_id = $9, updated_at = CURRENT_TIMESTAMP
      WHERE event_id = $10 AND status = 'active'
      RETURNING event_id, event_title;
    `;

    const updateResult = await db.query(updateQuery, [
      event_title,
      event_type,
      event_date,
      start_time,
      end_time,
      location,
      description,
      target_audience,
      user_id,
      event_id
    ]);

    const updatedEvent = updateResult.rows[0];

    if (updatedEvent) {
      return NextResponse.json(
        {
          message: `${updatedEvent.event_title} updated successfully`,
          id: updatedEvent.event_id,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: `Failed to update event (${event_title})` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

// /api/feedingNtransport/pickup/update/[pick_up_id]
export async function PUT(req, { params }) {
  const { pick_up_id } = params;

  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body in updatepickupapi", body);

    const {
      pick_up_id: id,
      pick_up_point_name,
      pick_up_price,
      student_id,
      user_id,
    } = body;

    if (!id || !pick_up_point_name || !pick_up_price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (id != pick_up_id) {
      return NextResponse.json(
        {
          error:
            "You are not authorised to perform this update. Contact the administrator",
        },
        { status: 400 }
      );
    }

    // Check if the pick up point exists
    const checkExistQuery = `
          SELECT pick_up_id FROM bus_pick_up_points WHERE pick_up_id = $1;
        `;
    const existResult = await db.query(checkExistQuery, [pick_up_id]);

    if (existResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Pick up point not found" },
        { status: 404 }
      );
    }

    // Check if the new pick up point already exists (excluding the current pick up point)
    const checkDuplicateQuery = `
            SELECT pick_up_id FROM bus_pick_up_points 
            WHERE LOWER(pick_up_point_name) = LOWER($1) AND pick_up_id != $2;
          `;
    const duplicateResult = await db.query(checkDuplicateQuery, [
      pick_up_point_name,
      pick_up_id,
    ]);

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        {
          error: "Pick-up point name already exists. Choose a different name.",
        },
        { status: 409 }
      );
    }

    // If checks pass, proceed with the update
    const updateQuery = `
         UPDATE bus_pick_up_points 
         SET pick_up_point_name = $1, pick_up_price = $2, student_id = $3
         WHERE pick_up_id = $5
         RETURNING pick_up_id, pick_up_point_name;
     `;
    const updateResult = await db.query(updateQuery, [
      pick_up_point_name,
      pick_up_price,
      student_id,
      pick_up_id,
    ]);
    const { pick_up_id: itemId, pick_up_point_name: itemName } =
      updateResult.rows[0];

    // Create a notification for the soft delete
    const notification_title = `Pick-up point updated`;
    const notification_message = `Pick-up point ${pick_up_point_name} has been updated the system.`;
    const notification_type = "general";
    const priority = "normal";

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

    console.log(`Pick-up point ${pick_up_id} updated successfully`);
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `Pick-up point (${pick_up_point_name}) updated successfully`,
        pickup: itemName,
      },
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

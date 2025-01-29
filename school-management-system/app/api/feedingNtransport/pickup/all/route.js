import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/feedingNtransport/pickup/all
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addpickupapi", body);

    const { pick_up_point_name, pick_up_price, student_id, status } = body;

    if (!pick_up_point_name || !pick_up_price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if pick_up_point_name already exists
    const checkQuery = `
        SELECT pick_up_id 
        FROM bus_pick_up_points 
        WHERE LOWER(pick_up_point_name) = LOWER($1)
          AND status='active';
        `;

    const checkResult = await db.query(checkQuery, [pick_up_point_name]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Pick-up point already exists. Try adding another pick-up point",
        },
        { status: 409 }
      );
    }

    // If pick up point doesn't exist, proceed with insertion
    const insertQuery = `
         INSERT INTO bus_pick_up_points (pick_up_point_name, pick_up_price, student_id, status)
         VALUES ($1, $2, $3, $4)
         RETURNING pick_up_id, pick_up_point_name ;
     `;

    const insertResult = await db.query(insertQuery, [
      pick_up_point_name,
      pick_up_price,
      student_id,
      status,
    ]);

    const new_name = insertResult.rows[0].pick_up_point_name;

    console.log(`pick-up point ${new_name} added successfully`);

    return NextResponse.json(
      {
        message: `Pick-up point (${new_name}) added successfully`,
        id: new_name,
      },
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

export const dynamic = "force-dynamic";

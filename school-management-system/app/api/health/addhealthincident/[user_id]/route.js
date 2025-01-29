import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/health/addhealthincident/

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addsemesterapi", body);
    
    const { incident_date, incident_description, treatmentprovided } = body;
    

    if (!incident_date || !incident_description || !treatmentprovided) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If incident doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO health_incident (incident_date, incident_description, treatmentprovided)
      VALUES ($1, $2, $3)
      RETURNING incident_id;
    `;

    const insertResult = await db.query(insertQuery, [incident_date, incident_description, treatmentprovided]);
    const newincidentId = insertResult.rows[0].semester_id;

    console.log(`incident added successfully`);

    return NextResponse.json(
      { message: "incident added successfully", id: newincidentId },
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

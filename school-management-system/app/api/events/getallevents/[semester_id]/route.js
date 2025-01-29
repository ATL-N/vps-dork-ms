import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/events/getallevents/[semester_id]

export async function GET(req, { params }) {
  try {
    const { semester_id } = params;
    if (!semester_id) {
      return NextResponse.json(
        { error: "Semester ID is required" },
        { status: 400 }
      );
    }

    // Fetch semester dates
    const semesterQuery = `
      SELECT start_date, end_date
      FROM semesters
      WHERE semester_id = $1 AND status != 'deleted'
    `;
    const semesterResult = await db.query(semesterQuery, [semester_id]);
    if (semesterResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Semester not found or not active" },
        { status: 404 }
      );
    }
    const { start_date, end_date } = semesterResult.rows[0];

    // Get current date
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0];

    // Calculate dates for this week and this month
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Fetch events data
    const eventsQuery = `
      SELECT 
        *,
        event_id AS id,
        event_title AS title,
        event_date AS date,
        event_type AS type,
        TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at,
        TO_CHAR(e.event_date, 'yyyy-mm-dd') AS event_date1
      FROM 
        events e
      WHERE 
        event_date BETWEEN $1 AND $2
        AND status = 'active'
      ORDER BY 
        event_date 
    `;
    const eventsResult = await db.query(eventsQuery, [start_date, end_date]);

    const events = eventsResult.rows.map((event) => ({
      ...event,
      date: event.date.toISOString().split("T")[0],
    }));

    // Calculate event statistics
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (event) => event.date >= currentDateString
    ).length;
    const eventsThisMonth = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    }).length;
    const eventsThisWeek = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length;

    return NextResponse.json(
      {
        events,
        stats: {
          totalEvents,
          upcomingEvents,
          eventsThisMonth,
          eventsThisWeek,
        },
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

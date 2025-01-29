import db from "../../../../../lib/db";
import { NextResponse } from "next/server";

// /api/timetable/getclasstimetable/[class_id]


export async function GET(req, { params }) {
  try {
  
  const { class_id, semester_id } = params;


    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Missing class_id or semester parameter" },
        { status: 400 }
      );
    }

    // Query to fetch timetable data
    const query = `
      SELECT 
        t.day_of_week, 
        t.period_number, 
        t.start_time, 
        t.end_time, 
        t.subject_id, 
        t.teacher_id, 
        t.room_id,
        s.subject_name,
        CONCAT(st.first_name, ' ', st.last_name) as teacher_name,
        r.room_name
      FROM 
        timetable t
        full join subjects s ON t.subject_id = s.subject_id
        full join staff st ON t.teacher_id = st.staff_id
        full join rooms r ON t.room_id = r.room_id
      WHERE 
        t.class_id = $1 AND t.semester_id = $2
      ORDER BY 
        t.day_of_week, 
        t.period_number
    `;

    const { rows } = await db.query(query, [class_id, semester_id]);

    // Transform the data into the desired format
    const timetable = {};
    const periods = [];
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    rows.forEach((row) => {
      if (!timetable[row.day_of_week]) {
        timetable[row.day_of_week] = {};
      }

      timetable[row.day_of_week][row.period_number] = {
        subject: row.subject_id,
        teacher: row.teacher_id,
        room: row.room_id,
        subjectName: row.subject_name,
        teacherName: row.teacher_name,
        roomName: row.room_name,
      };

      // Add period if it doesn't exist
      if (!periods.some((p) => p.number === parseInt(row.period_number))) {
        periods.push({
          number: parseInt(row.period_number),
          startTime: row.start_time,
          endTime: row.end_time,
        });
      }

    });


    // Sort periods by number
    periods.sort((a, b) => a.number - b.number);

    // Ensure all days are present in the timetable
    daysOfWeek.forEach((day) => {
      if (!timetable[day]) {
        timetable[day] = {};
      }
    });

    return NextResponse.json(
      {
        class_id,
        timetable,
        periods,
        daysOfWeek,
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

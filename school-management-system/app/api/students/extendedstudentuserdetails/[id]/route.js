import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/students/extendedstudentuserdetails/
export async function GET(req, { params }) {
  const { id } = params;
  try {
    // Fetch all student data
    const studentQuery = `
      SELECT
      s.*,
      c.*,
      TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
      TO_CHAR(s.enrollment_date, 'YYYY-MM-DD') AS enrollment_date

      FROM students s
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE s.user_id = $1
    `;
    const studentResult = await db.query(studentQuery, [id]);

    if (studentResult.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const student = studentResult.rows[0];

    // Fetch all semester data
    const semesterQuery = `
      SELECT 
      s.*
      FROM semesters s
      WHERE s.status = $1
    `;
    const semesterResult = await db.query(semesterQuery, ["active"]);

    if (semesterResult.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const activesemester = semesterResult.rows[0];

    // Fetch all health record data
    const healthQuery = `
      SELECT *
      FROM user_health_record
      WHERE user_id = $1
    `;
    const healthResult = await db.query(healthQuery, [id]);
    const healthRecord = healthResult.rows[0] || {};

    // Fetch all health incidents
    const incidentQuery = `
      SELECT *
      FROM health_incident
      WHERE user_id = $1
      ORDER BY incident_date DESC
    `;
    const incidentResult = await db.query(incidentQuery, [id]);
    const healthIncidents = incidentResult.rows;

    // Fetch all attendance data
    const attendanceQuery = `
      SELECT 
        a.*,
        TO_CHAR(a.attendance_date, 'YYYY-MM-DD') AS attendance_date,

        s.semester_name,
        c.class_name
      FROM 
        attendance a
      JOIN
        semesters s ON a.semester_id = s.semester_id
      JOIN
        classes c ON a.class_id = c.class_id
      WHERE 
        a.student_id = $1 AND a.semester_id = $2
      ORDER BY
        a.attendance_date DESC
    `;
    const attendanceResult = await db.query(attendanceQuery, [
      student.student_id,
      activesemester.semester_id,
    ]);
    const attendanceData = attendanceResult.rows;

    // Calculate attendance summary
    const attendanceSummary = attendanceData.reduce(
      (summary, record) => {
        summary.totalDays++;
        summary[record.status.toLowerCase() + "Count"]++;
        return summary;
      },
      { totalDays: 0, presentCount: 0, absentCount: 0, lateCount: 0 }
    );
    attendanceSummary.overallAttendance =
      attendanceSummary.totalDays > 0
        ? Math.round(
            (attendanceSummary.presentCount / attendanceSummary.totalDays) * 100
          )
        : 0;

    // Fetch academic report data
    const academicQuery = `
      SELECT 
        sg.grade_id,
        s.subject_name,
        sg.class_score,
        sg.exams_score,
        sg.total_score,
        gs.grade_name,
        gs.grade_remark,
        staff.first_name || ' ' || staff.last_name AS teacher_name,
        sem.semester_name
      FROM 
        student_grades sg
      JOIN 
        subjects s ON sg.subject_id = s.subject_id
      JOIN 
        staff ON sg.user_id = staff.user_id
      JOIN 
        grading_scheme gs ON sg.gradescheme_id = gs.gradescheme_id
      JOIN 
        semesters sem ON sg.semester_id = sem.semester_id
      WHERE 
        sg.student_id = $1
      ORDER BY 
        sem.semester_id DESC, s.subject_name
    `;
    const academicResult = await db.query(academicQuery, [student.student_id]);

    // Fetch student remarks
    const remarksQuery = `
      SELECT *
      FROM student_remarks
      WHERE student_id = $1
      ORDER BY semester_id DESC
      LIMIT 1
    `;
    const remarksResult = await db.query(remarksQuery, [student.student_id]);

    // Process academic data
    const academicData = academicResult.rows.reduce((acc, row) => {
      if (!acc[row.semester_name]) {
        acc[row.semester_name] = {
          semester: row.semester_name,
          courses: [],
        };
      }

      acc[row.semester_name].courses.push({
        name: row.subject_name,
        grade: row.grade_name,
        class_score: row.class_score,
        exams_score: row.exams_score,
        score: row.total_score,
        teacher: row.teacher_name,
        comments: row.grade_remark,
      });

      return acc;
    }, {});

    const latestSemester = Object.keys(academicData)[0];
    const reportCardData = academicData[latestSemester];

    if (remarksResult.rows.length > 0) {
      reportCardData.teacherNote = remarksResult.rows[0].class_teachers_remark;
      reportCardData.headTeacherNote =
        remarksResult.rows[0].headteachers_remark;
    }

    // Fetch transcript data
    const transcriptQuery = `
      SELECT 
        sg.grade_id,
        s.subject_name,
        gs.grade_name,
        sg.total_score,
        sem.semester_name,
        EXTRACT(YEAR FROM sem.start_date) AS year
      FROM 
        student_grades sg
      JOIN 
        subjects s ON sg.subject_id = s.subject_id
      JOIN 
        grading_scheme gs ON sg.gradescheme_id = gs.gradescheme_id
      JOIN 
        semesters sem ON sg.semester_id = sem.semester_id
      WHERE 
        sg.student_id = $1
      ORDER BY 
        year DESC, sem.semester_id DESC, s.subject_name
    `;
    const transcriptResult = await db.query(transcriptQuery, [
      student.student_id,
    ]);

    // Process transcript data
    const transcriptData = {
      courses: transcriptResult.rows.map((row) => ({
        year: row.year.toString(),
        semester: row.semester_name,
        name: row.subject_name,
        grade: row.grade_name,
        score: row.total_score,
      })),
    };

    // Combine all data
    const studentData = {
      student: student,
      healthRecord: healthRecord,
      healthIncidents: healthIncidents,
      attendanceData: {
        summary: attendanceSummary,
        records: attendanceData,
      },
      academicReport: reportCardData,
      transcript: transcriptData,
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

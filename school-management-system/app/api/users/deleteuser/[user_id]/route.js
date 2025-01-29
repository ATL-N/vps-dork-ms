import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/users/deleteuser/[user_id]

export async function PUT(req, { params }) {
  const { user_id } = params;
  const { sender_id } = await req.json(); // Assuming sender_id is sent in the request body

  try {
    await db.query("BEGIN");

    // Step 1: Check which table the user belongs to
    const checkUserQuery = `
      SELECT 
        CASE
          WHEN EXISTS (SELECT 1 FROM students WHERE user_id = $1) THEN 'students'
          WHEN EXISTS (SELECT 1 FROM parents WHERE user_id = $1) THEN 'parents'
          WHEN EXISTS (SELECT 1 FROM staff WHERE user_id = $1) THEN 'staff'
          ELSE NULL
        END AS user_type
    `;
    const userTypeResult = await db.query(checkUserQuery, [user_id]);

    console.log('userType: ', userTypeResult)

    if (!userTypeResult.rows[0].user_type) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userType = userTypeResult.rows[0].user_type;

    // Step 2: Update status in the specific table (students, parents, or staff)
    const updateSpecificTableQuery = `
      UPDATE ${userType} SET status = 'deleted' WHERE user_id = $1 RETURNING *;
    `;
    const updateResult = await db.query(updateSpecificTableQuery, [user_id]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: `${userType} not found` }, { status: 404 });
    }

    // Step 3: Update status in users table
    const updateUserQuery = `
      UPDATE users SET status = 'deleted' WHERE user_id = $1 RETURNING user_name;
    `;
    const userResult = await db.query(updateUserQuery, [user_id]);
    const deletedUserName = userResult.rows[0].user_name;

    // Step 4: Update status in user_health_record table
    const updateHealthRecordQuery = `
      UPDATE user_health_record SET status = 'deleted' WHERE user_id = $1;
    `;
    await db.query(updateHealthRecordQuery, [user_id]);

    // Step 5: If the user is a student, handle parent relationships
    if (userType === 'students') {
      const student_id = updateResult.rows[0].student_id;

      // Get parent IDs for the student
      const getParentIdsQuery = `
        SELECT parent_id FROM student_parent WHERE student_id = $1;
      `;
      const parentResult = await db.query(getParentIdsQuery, [student_id]);
      const parentIds = parentResult.rows.map((row) => row.parent_id);

      // Check if parents have other active students and update status if not
      for (const parent_id of parentIds) {
        const checkOtherStudentsQuery = `
          SELECT COUNT(*) FROM student_parent sp
          JOIN students s ON sp.student_id = s.student_id
          WHERE sp.parent_id = $1 AND s.status = 'active' AND s.student_id != $2;
        `;
        const otherStudentsResult = await db.query(checkOtherStudentsQuery, [parent_id, student_id]);
        const otherStudentsCount = parseInt(otherStudentsResult.rows[0].count);

        if (otherStudentsCount === 0) {
          const updateParentQuery = `
            UPDATE parents SET status = 'deleted' WHERE parent_id = $1;
          `;
          await db.query(updateParentQuery, [parent_id]);
        }
      }

      // Update status in student_parent table
      const updateStudentParentQuery = `
        UPDATE student_parent SET status = 'deleted' WHERE student_id = $1;
      `;
      await db.query(updateStudentParentQuery, [student_id]);
    }

    // Step 6: Send a notification
    const notificationQuery = `
      INSERT INTO notifications (
        notification_title,
        notification_message,
        notification_type,
        priority,
        sender_id
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING notification_id;
    `;
    const notificationValues = [
      'User Deleted',
      `User ${deletedUserName} (ID: ${user_id}) has been soft deleted from the system.`,
      'alert',
      'high',
      sender_id
    ];
    const notificationResult = await db.query(notificationQuery, notificationValues);

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `User with ID ${user_id} has been successfully soft deleted.`,
        notification_id: notificationResult.rows[0].notification_id
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
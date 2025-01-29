import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/staff/updateStaff

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await db.query("BEGIN");

    const body = await req.json();
    const {
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      marital_status,
      address,
      phone_number,
      email,
      emergency_contact,
      date_of_joining,
      designation,
      department,
      salary,
      account_number,
      contract_type,
      employment_status,
      qualification,
      experience,
      blood_group,
      national_id,
      passport_number,
      photo,
      teaching_subject,
      class_teacher,
      subject_in_charge,
      house_in_charge,
      bus_in_charge,
      library_in_charge,
      role,
      status,
      // Health record fields
      medical_conditions,
      allergies,
      vaccination_status,
      last_physical_exam_date,
    } = body;

    // Update staff data
    const updateStaffQuery = `
      UPDATE staff
      SET first_name = $1, last_name = $2, middle_name = $3, date_of_birth = $4, 
          gender = $5, marital_status = $6, address = $7, phone_number = $8, 
          email = $9, emergency_contact = $10, date_of_joining = $11, designation = $12, 
          department = $13, salary = $14, account_number = $15, contract_type = $16, 
          employment_status = $17, qualification = $18, experience = $19, 
          blood_group = $20, national_id = $21, passport_number = $22, photo = $23, 
          teaching_subject = $24, class_teacher = $25, subject_in_charge = $26, 
          house_in_charge = $27, bus_in_charge = $28, library_in_charge = $29, 
          role = $30, status = $31
      WHERE staff_id = $32
      RETURNING user_id, first_name;
    `;

    const staffResult = await db.query(updateStaffQuery, [
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      marital_status,
      address,
      phone_number,
      email,
      emergency_contact,
      date_of_joining,
      designation,
      department,
      salary,
      account_number,
      contract_type,
      employment_status,
      qualification,
      experience,
      blood_group,
      national_id,
      passport_number,
      photo,
      teaching_subject,
      class_teacher,
      subject_in_charge,
      house_in_charge,
      bus_in_charge,
      library_in_charge,
      role,
      status,
      id,
    ]);

    if (staffResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const { user_id, first_name: staff_first_name } = staffResult.rows[0];

    // Update health record data
    const updateHealthRecordQuery = `
      UPDATE user_health_record
      SET medical_conditions = $1, allergies = $2, blood_group = $3, 
          vaccination_status = $4, last_physical_exam_date = $5
      WHERE user_id = $6;
    `;

    await db.query(updateHealthRecordQuery, [
      medical_conditions,
      allergies,
      blood_group,
      vaccination_status,
      last_physical_exam_date,
      user_id,
    ]);

    // Update user email if it has changed
    const updateUserEmailQuery = `
      UPDATE users
      SET user_email = $1
      WHERE user_id = $2;
    `;

    await db.query(updateUserEmailQuery, [email, user_id]);

    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `${staff_first_name}'s information updated successfully`,
        staff_name: staff_first_name,
        user_id: user_id,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update staff information" },
      { status: 500 }
    );
  }
}

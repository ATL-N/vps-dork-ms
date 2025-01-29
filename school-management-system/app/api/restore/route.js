// app/api/restore/route.js
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file temporarily
    const tempFilePath = path.join(process.cwd(), "temp_backup.sql");
    fs.writeFileSync(tempFilePath, buffer);

    // Get database connection details from environment variables
    const user = process.env.DB_USER;
    const host = process.env.DB_HOST;
    const database = process.env.DB_NAME;
    const password = process.env.DB_PASSWORD;
    const port = process.env.DB_PORT || "5432";

    // Restore the database
    const restoreCommand = `PGPASSWORD=${password} psql -h ${host} -p ${port} -U ${user} -d ${database} < ${tempFilePath}`;
    await execAsync(restoreCommand);

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    return NextResponse.json({ message: "Restore completed successfully" });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore database" },
      { status: 500 }
    );
  }
}

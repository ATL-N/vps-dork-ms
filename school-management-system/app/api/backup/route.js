// app/api/backup/route.js

import { NextResponse } from "next/server";
import db from "../../lib/db";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
// import db from "../../lib/db";


const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "list") {
    return listBackups();
  } else if (action === "download") {
    const fileName = searchParams.get("file");
    return downloadBackup(fileName);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function POST(req) {
    console.log('running post create backup')
  const { action } = await req.json();
      console.log("running post create backup2:", action);


  if (action === "create") {
    return createBackup();
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
async function createBackup() {
    console.log('creating backup')
  try {
    // Retrieve database connection details from environment variables
    const user = process.env.DB_USER;
    const host = process.env.DB_HOST;
    const database = process.env.DB_NAME;
    const password = process.env.DB_PASSWORD;
    const port = process.env.DB_PORT || "5432";

    if (!user || !host || !database || !password) {
      throw new Error(
        "Database connection details are not fully set in environment variables"
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    // Run pg_dump
    const pgDumpCommand = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f ${backupFilePath}`;
    console.log("Executing command:", pgDumpCommand.replace(password, "****"));

    await execAsync(pgDumpCommand);

    return NextResponse.json({
      message: "Backup created successfully",
      file: backupFileName,
    });
  } catch (error) {
    console.error("Backup creation error:", error);
    return NextResponse.json(
      { error: "Failed to create backup: " + error.message },
      { status: 500 }
    );
  }
}

function listBackups() {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => ({
        name: file,
        size: fs.statSync(path.join(BACKUP_DIR, file)).size,
        date: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
      }));
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error listing backups:", error);
    return NextResponse.json(
      { error: "Failed to list backups" },
      { status: 500 }
    );
  }
}

function downloadBackup(fileName) {
  try {
    const filePath = path.join(BACKUP_DIR, fileName);
    const fileContent = fs.readFileSync(filePath);
    const response = new NextResponse(fileContent);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );
    response.headers.set("Content-Type", "application/sql");
    return response;
  } catch (error) {
    console.error("Error downloading backup:", error);
    return NextResponse.json(
      { error: "Failed to download backup" },
      { status: 500 }
    );
  }
}

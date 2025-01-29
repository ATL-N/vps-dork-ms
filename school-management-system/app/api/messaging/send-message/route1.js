import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, recipients } = body;

    // Use recipients from the request or fallback to a default
    const recipientsToUse = recipients?.length > 0 ? recipients : [""]; // Default recipient if none provided

    const data = {
      sender: process.env.ARKESEL_SENDER_ID,
      message: message,
      recipients: recipientsToUse,
      sandbox: true,
    };

    console.log("Sending SMS with data:", data);

    // Send SMS via Arkesel
    const response = await axios({
      method: "post",
      url: process.env.ARKESEL_URL,
      headers: {
        "api-key": process.env.ARKESEL_API_KEY,
      },
      data: data,
    });

    console.log("Arkesel API Response:", response.data);

    // Return the full response from Arkesel
    return NextResponse.json(
      {
        message: "Message sent successfully",
        arkeselResponse: response.data,
        successful: recipientsToUse, // recipients that were attempted
        failed: [], // no failed recipients in this implementation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SMS Sending Error:", error);

    // Return detailed error information
    return NextResponse.json(
      {
        error: "Failed to send SMS",
        details: error.response?.data || error.message,
        failed: recipients || ["0551577446"],
      },
      { status: error.response?.status || 500 }
    );
  }
}

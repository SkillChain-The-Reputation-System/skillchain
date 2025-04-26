import { GetCurrentTimeResponse } from "@/lib/interfaces";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get current time in milliseconds since epoch
    const currentTime = Date.now();

    const response: GetCurrentTimeResponse = {
      success: true,
      time: currentTime,
    };

    // Return the transaction ID
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error getting current time:", error);
    return NextResponse.json(
      { error: "Failed to get current time" },
      { status: 500 }
    );
  }
}
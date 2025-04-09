import { NextResponse } from "next/server";
import { uploadData } from "@/lib/irys-utils";
import { IrysUploadResponseInterface } from "@/lib/interfaces";

export async function POST(request: Request) {
  try {
    // Get data from the request body
    const data = await request.text();
    console.log("Received data:", data);
    if (!data || data.length === 0) {
      const response_no_update: IrysUploadResponseInterface = {
        success: true,
        id: undefined,
        url: undefined,
      };
      return NextResponse.json(response_no_update);
    }

    // Upload data to Irys
    const id = await uploadData(data);

    const response: IrysUploadResponseInterface = {
      success: true,
      id: id,
      url: `https://gateway.irys.xyz/${id}`,
    };

    // Return the transaction ID
    return NextResponse.json(response);
  } catch (error) {
    console.error("Irys upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload to Irys" },
      { status: 500 }
    );
  }
}

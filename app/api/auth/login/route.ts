import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("Login request received:", body);

  return NextResponse.json({
    success: true,
    message: "Login endpoint is working.",
  });
}
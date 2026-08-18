import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
  });
}

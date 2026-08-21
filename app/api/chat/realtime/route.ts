import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  requireActiveOrganizationAccess,
} from "@/features/auth/authorization";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (!session.user.organizationId) {
      return NextResponse.json(
        {
          message:
            "Organization context required",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Tenant isolation + subscription enforcement.
     *
     * The organization ID comes exclusively from
     * the authenticated session.
     */
    await requireActiveOrganizationAccess(
      session.user.organizationId,
    );

    return NextResponse.json({
      userId: session.user.id,
      organizationId:
        session.user.organizationId,
      role: session.user.role,
    });
  } catch (error) {
    console.error(
      "CHAT REALTIME IDENTITY ERROR:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load realtime identity";

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        message:
          message === "Subscription inactive"
            ? "Subscription inactive"
            : "Organization access denied",
      },
      {
        status: 403,
      },
    );
  }
}

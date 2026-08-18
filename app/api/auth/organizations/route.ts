import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const organizations = await db.organization.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        hasBranches: true,
        branches: {
          where: {
            status: "ACTIVE",
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
          orderBy: [
            {
              isHeadquarters: "desc",
            },
            {
              name: "asc",
            },
          ],
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error("ORGANIZATION DISCOVERY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load organizations.",
      },
      { status: 500 },
    );
  }
}

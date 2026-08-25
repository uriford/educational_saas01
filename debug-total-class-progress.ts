import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const courses = await db.course.findMany({
    where: {
      deletedAt: null,
      totalClasses: {
        not: null,
      },
    },
    select: {
      id: true,
      code: true,
      name: true,
      totalClasses: true,

      classSessions: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          status: true,
          startTime: true,
          endTime: true,
        },
        orderBy: {
          startTime: "asc",
        },
      },

      enrollments: {
        select: {
          id: true,
          studentId: true,
          status: true,
          progress: true,
        },
      },
    },
  });

  for (const course of courses) {
    const completed = course.classSessions.filter(
      (session) => session.status === "COMPLETED",
    );

    const counted = course.classSessions.filter(
      (session) =>
        session.status === "SCHEDULED" ||
        session.status === "ONGOING" ||
        session.status === "COMPLETED",
    );

    const calculated =
      course.totalClasses && course.totalClasses > 0
        ? Math.round(
            (completed.length / course.totalClasses) * 100,
          )
        : 0;

    console.log("\n==================================================");
    console.log(`COURSE: ${course.code} - ${course.name}`);
    console.log(`COURSE ID: ${course.id}`);
    console.log(`TOTAL CLASSES: ${course.totalClasses}`);
    console.log(`ALL SESSIONS: ${course.classSessions.length}`);
    console.log(`COUNTED SESSIONS: ${counted.length}`);
    console.log(`COMPLETED SESSIONS: ${completed.length}`);
    console.log(`CALCULATED PROGRESS: ${calculated}%`);

    console.log("\n---------------- SESSIONS ----------------");

    for (const session of course.classSessions) {
      console.log(
        `${session.id} | ${session.status} | ${session.title}`,
      );
    }

    console.log("\n---------------- ENROLLMENTS ----------------");

    for (const enrollment of course.enrollments) {
      console.log(
        `enrollment=${enrollment.id} | student=${enrollment.studentId} | status=${enrollment.status} | cachedProgress=${enrollment.progress}%`,
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

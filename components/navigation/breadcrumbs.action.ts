"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

function cleanSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function getScopedOrganization() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    session,
    organizationId: session.user.organizationId ?? null,
    branchId: session.user.branchId ?? null,
  };
}

export async function resolveBreadcrumbs(
  pathname: string,
): Promise<BreadcrumbItem[]> {
  const context = await getScopedOrganization();

  if (!context) {
    return [];
  }

  const { session, organizationId, branchId } = context;

  const isStudent =
    session.user.role === "STUDENT";

  const root: BreadcrumbItem = isStudent
    ? {
        label: "Home",
        href: "/student",
      }
    : {
        label: "Dashboard",
        href: "/dashboard",
      };

  const parts = pathname
    .split("/")
    .filter(Boolean);

  if (parts.length === 0) {
    return [root];
  }

  const breadcrumbs: BreadcrumbItem[] = [root];

  const add = (
    label: string,
    href?: string,
  ) => {
    breadcrumbs.push({ label, href });
  };

  /*
   * ==========================================
   * STUDENT PORTAL
   * ==========================================
   */

  if (isStudent) {
    if (parts[0] !== "student") {
      return breadcrumbs;
    }

    if (parts[1] === "courses") {
      add("My Courses", "/student/courses");

      if (parts[2]) {
        const course = await db.course.findFirst({
          where: {
            id: parts[2],
            ...(organizationId
              ? { organizationId }
              : {}),
            ...(branchId ? { branchId } : {}),
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (course) {
          add(
            course.name,
            `/student/courses/${course.id}`,
          );
        }

        if (
          parts[3] === "lessons" &&
          parts[4]
        ) {
          const lesson =
            await db.lesson.findFirst({
              where: {
                id: parts[4],
                courseId: parts[2],
                ...(organizationId
                  ? { organizationId }
                  : {}),
                ...(branchId
                  ? { branchId }
                  : {}),
                deletedAt: null,
              },
              select: {
                id: true,
                title: true,
              },
            });

          add("Lessons");

          if (lesson) {
            add(lesson.title);
          }
        }
      }

      return breadcrumbs;
    }

    if (parts[1] === "explore-courses") {
      add(
        "Explore Courses",
        "/student/explore-courses",
      );

      if (parts[2]) {
        const course = await db.course.findFirst({
          where: {
            id: parts[2],
            ...(organizationId
              ? { organizationId }
              : {}),
            ...(branchId ? { branchId } : {}),
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (course) {
          add(course.name);
        }
      }

      return breadcrumbs;
    }

    if (parts[1] === "announcements") {
      add(
        "Announcements",
        "/student/announcements",
      );

      if (parts[2]) {
        const announcement =
          await db.announcement.findFirst({
            where: {
              id: parts[2],
              ...(organizationId
                ? { organizationId }
                : {}),
              ...(branchId
                ? { branchId }
                : {}),
            },
            select: {
              title: true,
            },
          });

        if (announcement) {
          add(announcement.title);
        }
      }

      return breadcrumbs;
    }

    if (parts[1] === "assessments") {
      add(
        "Assessments",
        "/student/assessments",
      );

      if (parts[2]) {
        const assessment =
          await db.assessment.findFirst({
            where: {
              id: parts[2],
              ...(organizationId
                ? { organizationId }
                : {}),
              ...(branchId
                ? { branchId }
                : {}),
              deletedAt: null,
            },
            select: {
              title: true,
            },
          });

        if (assessment) {
          add(assessment.title);
        }
      }

      if (parts[3] === "result") {
        add("Result");
      }

      return breadcrumbs;
    }

    const studentPages: Record<
      string,
      string
    > = {
      chat: "Chat",
      payments: "Payments",
      profile: "Profile",
      results: "Results",
      routine: "Routine",
      schedule: "Schedule",
    };

    if (studentPages[parts[1]]) {
      add(
        studentPages[parts[1]],
        `/student/${parts[1]}`,
      );

      if (
        parts[1] === "profile" &&
        parts[2] === "edit"
      ) {
        add("Edit");
      }

      return breadcrumbs;
    }

    return breadcrumbs;
  }

  /*
   * ==========================================
   * SUPER ADMIN / ORGANIZATION DASHBOARD
   * ==========================================
   */

  if (parts[0] === "dashboard") {
    add("Dashboard");
    return breadcrumbs;
  }

  /*
   * COURSES
   */

  if (parts[0] === "courses") {
    add("Courses", "/courses");

    let courseId: string | undefined;

    if (parts[1]) {
      courseId = parts[1];

      const course =
        await db.course.findFirst({
          where: {
            id: courseId,
            ...(organizationId
              ? { organizationId }
              : {}),
            ...(branchId ? { branchId } : {}),
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
        });

      if (course) {
        add(
          course.name,
          `/courses/${course.id}`,
        );
      }
    }

    if (!parts[1]) {
      return breadcrumbs;
    }

    if (parts[2] === "edit") {
      add("Edit");
      return breadcrumbs;
    }

    if (parts[2] === "students") {
      add(
        "Students",
        `/courses/${courseId}/students`,
      );

      if (parts[3] === "enroll") {
        add("Enroll");
      }

      return breadcrumbs;
    }

    if (parts[2] === "lessons") {
      add(
        "Lessons",
        `/courses/${courseId}/lessons`,
      );

      if (parts[3] === "create") {
        add("Create");
        return breadcrumbs;
      }

      if (parts[3]) {
        const lesson =
          await db.lesson.findFirst({
            where: {
              id: parts[3],
              courseId,
              ...(organizationId
                ? { organizationId }
                : {}),
              ...(branchId
                ? { branchId }
                : {}),
              deletedAt: null,
            },
            select: {
              id: true,
              title: true,
            },
          });

        if (lesson) {
          add(
            lesson.title,
            `/courses/${courseId}/lessons/${lesson.id}`,
          );
        }
      }

      if (parts[4] === "edit") {
        add("Edit");
      }

      return breadcrumbs;
    }

    if (parts[2] === "classes") {
      add(
        "Classes",
        `/courses/${courseId}/classes`,
      );

      if (parts[3] === "create") {
        add("Create");
        return breadcrumbs;
      }

      if (parts[3]) {
        if (parts[4] === "attendance") {
          add("Attendance");
        } else if (parts[4] === "edit") {
          add("Edit");
        }
      }

      return breadcrumbs;
    }

    if (parts[2] === "assessments") {
      add(
        "Assessments",
        `/courses/${courseId}/assessments`,
      );

      if (parts[3] === "create") {
        add("Create");
        return breadcrumbs;
      }

      if (parts[3]) {
        const assessment =
          await db.assessment.findFirst({
            where: {
              id: parts[3],
              courseId,
              ...(organizationId
                ? { organizationId }
                : {}),
              ...(branchId
                ? { branchId }
                : {}),
              deletedAt: null,
            },
            select: {
              id: true,
              title: true,
            },
          });

        if (assessment) {
          add(
            assessment.title,
            `/courses/${courseId}/assessments/${assessment.id}`,
          );
        }
      }

      const assessmentBase =
        `/courses/${courseId}/assessments/${parts[3]}`;

      if (parts[4] === "edit") {
        add("Edit");
        return breadcrumbs;
      }

      if (parts[4] === "questions") {
        add(
          "Questions",
          `${assessmentBase}/questions`,
        );

        if (parts[5] === "create") {
          add("Create");
          return breadcrumbs;
        }

        if (parts[5] === "ai-generate") {
          add("AI Generate");
          return breadcrumbs;
        }

        if (parts[5] === "ai-review") {
          add("AI Review");

          if (parts[6]) {
            add("Generation Review");
          }

          return breadcrumbs;
        }

        if (parts[5]) {
          const question =
            await db.assessmentQuestion.findFirst({
              where: {
                id: parts[5],
                assessmentId: parts[3],
              },
              select: {
                question: true,
              },
            });

          if (question) {
            add(
              question.question.length > 50
                ? `${question.question.slice(0, 50)}...`
                : question.question,
            );
          }
        }

        if (parts[6] === "edit") {
          add("Edit");
        }

        return breadcrumbs;
      }

      if (parts[4] === "submissions") {
        add("Submissions");

        if (parts[5]) {
          add("Submission");
        }

        return breadcrumbs;
      }

      return breadcrumbs;
    }

    return breadcrumbs;
  }

  /*
   * STUDENTS
   */

  if (parts[0] === "students") {
    add("Students", "/students");

    if (parts[1] && organizationId) {
      const student =
        await db.student.findFirst({
          where: {
            id: parts[1],
            organizationId,
            ...(branchId
              ? { branchId }
              : {}),
          },
          select: {
            firstName: true,
            lastName: true,
          },
        });

      if (student) {
        add(
          `${student.firstName} ${student.lastName ?? ""}`.trim(),
        );
      }
    }

    if (parts[1] === "create") {
      add("Create");
    } else if (parts[2] === "edit") {
      add("Edit");
    }

    return breadcrumbs;
  }

  /*
   * TEACHERS
   */

  if (parts[0] === "teachers") {
    add("Teachers", "/teachers");

    if (parts[1] && organizationId) {
      const teacher =
        await db.teacher.findFirst({
          where: {
            id: parts[1],
            organizationId,
            ...(branchId
              ? { branchId }
              : {}),
          },
          select: {
            firstName: true,
            lastName: true,
          },
        });

      if (teacher) {
        add(
          `${teacher.firstName} ${teacher.lastName ?? ""}`.trim(),
        );
      }
    }

    if (parts[1] === "create") {
      add("Create");
    } else if (parts[2] === "edit") {
      add("Edit");
    }

    return breadcrumbs;
  }

  /*
   * ANNOUNCEMENTS
   */

  if (parts[0] === "announcements") {
    add(
      "Announcements",
      "/announcements",
    );

    if (parts[1] && parts[1] !== "create") {
      const announcement =
        await db.announcement.findFirst({
          where: {
            id: parts[1],
            ...(organizationId
              ? { organizationId }
              : {}),
            ...(branchId
              ? { branchId }
              : {}),
          },
          select: {
            title: true,
          },
        });

      if (announcement) {
        add(announcement.title);
      }
    }

    if (parts[1] === "create") {
      add("Create");
    } else if (parts[2] === "edit") {
      add("Edit");
    }

    return breadcrumbs;
  }

  /*
   * ORGANIZATIONS
   */

  if (parts[0] === "organizations") {
    add(
      "Organizations",
      "/organizations",
    );

    if (parts[1]) {
      const organization =
        await db.organization.findUnique({
          where: {
            id: parts[1],
          },
          select: {
            name: true,
          },
        });

      if (organization) {
        add(organization.name);
      }
    }

    if (
      parts[2] === "branches" &&
      parts[3]
    ) {
      const branch =
        await db.branch.findUnique({
          where: {
            id: parts[3],
          },
          select: {
            name: true,
          },
        });

      add("Branches");

      if (branch) {
        add(branch.name);
      }

      if (parts[4] === "settings") {
        add("Settings");
      }
    }

    return breadcrumbs;
  }

  /*
   * SIMPLE TOP-LEVEL PAGES
   */

  const topLevel: Record<
    string,
    string
  > = {
    accounts: "Accounts",
    analytics: "Analytics",
    communication: "Communication",
    notifications: "Notifications",
    payments: "Payments",
    schedule: "Schedule",
    settings: "Settings",
  };

  if (topLevel[parts[0]]) {
    add(
      topLevel[parts[0]],
      `/${parts[0]}`,
    );

    if (
      parts[1] === "history"
    ) {
      add("History");
    }

    if (
      parts[1] === "create"
    ) {
      add("Create");
    }

    return breadcrumbs;
  }

  return parts.map((part, index) => ({
    label: cleanSegment(part),
    href:
      index === parts.length - 1
        ? undefined
        : `/${parts
            .slice(0, index + 1)
            .join("/")}`,
  }));
}

import { db } from "@/lib/db";

export class CourseEnrollmentRepository {
  static async create(studentId: string, courseId: string) {
    return db.courseEnrollment.create({
      data: {
        studentId,
        courseId,
      },
    });
  }

  static async findByStudentAndCourse(studentId: string, courseId: string) {
    return db.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
  }

  static async findStudentCourses(studentId: string) {
    return db.courseEnrollment.findMany({
      where: {
        studentId,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
        course: {
          deletedAt: null,
        },
      },
      include: {
        course: {
          include: {
            organization: true,
            branch: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  static async findCourseStudents(courseId: string) {
    return db.courseEnrollment.findMany({
      where: {
        courseId,
        status: {
          in: ["ACTIVE", "COMPLETED", "SUSPENDED"],
        },
        student: {
          deletedAt: null,
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  static async findById(id: string) {
    return db.courseEnrollment.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  static async updateStatus(
    id: string,
    status: "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED",
  ) {
    return db.courseEnrollment.update({
      where: {
        id,
      },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });
  }

  static async delete(id: string) {
    return db.courseEnrollment.delete({
      where: {
        id,
      },
    });
  }
}

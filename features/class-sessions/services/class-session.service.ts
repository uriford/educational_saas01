import { db } from "@/lib/db";

import { ClassSessionRepository } from "../repository/class-session.repository";

export class ClassSessionService {
  static async create(data: {
    organizationId: string;
    branchId: string;
    courseId: string;
    teacherId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    room?: string;
    createdById?: string;
  }) {
    try {
      if (data.startTime >= data.endTime) {
        return {
          success: false,
          message: "Class end time must be after start time.",
        };
      }

      const course = await db.course.findFirst({
        where: {
          id: data.courseId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          deletedAt: null,
        },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found.",
        };
      }

      const teacher = await db.teacher.findFirst({
        where: {
          id: data.teacherId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          deletedAt: null,
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher not found.",
        };
      }

      if (teacher.status !== "ACTIVE") {
        return {
          success: false,
          message: "This teacher is not currently active.",
        };
      }

      const session = await ClassSessionRepository.create(data);

      return {
        success: true,
        message: "Class session created successfully.",
        session,
      };
    } catch (error) {
      console.error("CREATE CLASS SESSION ERROR:", error);

      return {
        success: false,
        message: "Failed to create class session.",
      };
    }
  }

static async update(data: {
  id: string;
  organizationId: string;
  branchId: string;
  title?: string;
  description?: string | null;
  startTime?: Date;
  endTime?: Date;
  room?: string | null;
  status?:
    | "SCHEDULED"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED";
  teacherId?: string;
  updatedById?: string;
}) {
  try {
    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        return {
          success: false,
          message: "Class end time must be after start time.",
        };
      }
    }

    const existingSession =
      await ClassSessionRepository.findById(
        data.id,
        data.organizationId,
        data.branchId,
      );

    if (!existingSession) {
      return {
        success: false,
        message: "Class session not found.",
      };
    }

    if (data.teacherId) {
      const teacher = await db.teacher.findFirst({
        where: {
          id: data.teacherId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          deletedAt: null,
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: "Teacher not found.",
        };
      }

      if (teacher.status !== "ACTIVE") {
        return {
          success: false,
          message: "This teacher is not currently active.",
        };
      }
    }

    if (data.title !== undefined && !data.title.trim()) {
      return {
        success: false,
        message: "Class title is required.",
      };
    }

    const result = await ClassSessionRepository.update(
      data.id,
      data.organizationId,
      data.branchId,
      {
        title: data.title?.trim(),
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room?.trim() || null,
        status: data.status,
        teacherId: data.teacherId,
        updatedById: data.updatedById,
      },
    );

    if (result.count === 0) {
      return {
        success: false,
        message: "Class session not found.",
      };
    }

    return {
      success: true,
      message: "Class session updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE CLASS SESSION ERROR:", error);

    return {
      success: false,
      message: "Failed to update class session.",
    };
  }
}

static async softDelete(data: {
  id: string;
  organizationId: string;
  branchId: string;
}) {
  try {
    const existingSession =
      await ClassSessionRepository.findById(
        data.id,
        data.organizationId,
        data.branchId,
      );

    if (!existingSession) {
      return {
        success: false,
        message: "Class session not found.",
      };
    }

    const result =
      await ClassSessionRepository.softDelete(
        data.id,
        data.organizationId,
        data.branchId,
      );

    if (result.count === 0) {
      return {
        success: false,
        message: "Class session not found.",
      };
    }

    return {
      success: true,
      message: "Class session deleted successfully.",
    };
  } catch (error) {
    console.error(
      "DELETE CLASS SESSION ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to delete class session.",
    };
  }
}

  static async getById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return ClassSessionRepository.findById(
      id,
      organizationId,
      branchId,
    );
  }

  static async getAll(
    organizationId: string,
    branchId?: string,
  ) {
    return ClassSessionRepository.findAll(
      organizationId,
      branchId,
    );
  }

  static async getCourseSessions(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return ClassSessionRepository.findByCourse(
      courseId,
      organizationId,
      branchId,
    );
  }

  static async getTeacherSessions(
    teacherId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return ClassSessionRepository.findByTeacher(
      teacherId,
      organizationId,
      branchId,
    );
  }

  static async getStudentSessions(
    studentId: string,
    organizationId: string,
    branchId: string,
  ) {
    return ClassSessionRepository.findByStudent(
      studentId,
      organizationId,
      branchId,
    );
  }
}
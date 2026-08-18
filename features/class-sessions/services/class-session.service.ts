import { db } from "@/lib/db";

import { ClassSessionRepository } from "../repository/class-session.repository";

type ClassSessionStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

function validateDateRange(startTime: Date, endTime: Date) {
  if (
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime())
  ) {
    return {
      success: false,
      message: "Invalid class date or time.",
    };
  }

  if (startTime >= endTime) {
    return {
      success: false,
      message: "Class end time must be after start time.",
    };
  }

  return null;
}

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
      const dateError = validateDateRange(
        data.startTime,
        data.endTime,
      );

      if (dateError) {
        return dateError;
      }

      const title = data.title.trim();

      if (!title) {
        return {
          success: false,
          message: "Class title is required.",
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

      const teacherConflict =
        await ClassSessionRepository.findTeacherConflict({
          organizationId: data.organizationId,
          branchId: data.branchId,
          teacherId: data.teacherId,
          startTime: data.startTime,
          endTime: data.endTime,
        });

      if (teacherConflict) {
        return {
          success: false,
          message: `Teacher already has a class scheduled from ${formatConflictTime(
            teacherConflict.startTime,
          )} to ${formatConflictTime(
            teacherConflict.endTime,
          )}.`,
        };
      }

      const room = data.room?.trim() || undefined;

      if (room) {
        const roomConflict =
          await ClassSessionRepository.findRoomConflict({
            organizationId: data.organizationId,
            branchId: data.branchId,
            room,
            startTime: data.startTime,
            endTime: data.endTime,
          });

        if (roomConflict) {
          return {
            success: false,
            message: `Room "${room}" is already booked from ${formatConflictTime(
              roomConflict.startTime,
            )} to ${formatConflictTime(
              roomConflict.endTime,
            )}.`,
          };
        }
      }

      const session = await ClassSessionRepository.create({
        ...data,
        title,
        room,
      });

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
    status?: ClassSessionStatus;
    teacherId?: string;
    updatedById?: string;
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

      const finalStartTime =
        data.startTime ?? existingSession.startTime;

      const finalEndTime =
        data.endTime ?? existingSession.endTime;

      const dateError = validateDateRange(
        finalStartTime,
        finalEndTime,
      );

      if (dateError) {
        return dateError;
      }

      const finalTeacherId =
        data.teacherId ?? existingSession.teacherId;

      const finalRoom =
        data.room !== undefined
          ? data.room?.trim() || null
          : existingSession.room;

      const finalStatus =
        data.status ?? existingSession.status;

      if (
        data.title !== undefined &&
        !data.title.trim()
      ) {
        return {
          success: false,
          message: "Class title is required.",
        };
      }

      const teacher = await db.teacher.findFirst({
        where: {
          id: finalTeacherId,
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

      const isCancelled =
        finalStatus === "CANCELLED";

      if (!isCancelled) {
        const teacherConflict =
          await ClassSessionRepository.findTeacherConflict({
            organizationId: data.organizationId,
            branchId: data.branchId,
            teacherId: finalTeacherId,
            startTime: finalStartTime,
            endTime: finalEndTime,
            excludeId: data.id,
          });

        if (teacherConflict) {
          return {
            success: false,
            message: `Teacher already has a class scheduled from ${formatConflictTime(
              teacherConflict.startTime,
            )} to ${formatConflictTime(
              teacherConflict.endTime,
            )}.`,
          };
        }

        if (finalRoom) {
          const roomConflict =
            await ClassSessionRepository.findRoomConflict({
              organizationId: data.organizationId,
              branchId: data.branchId,
              room: finalRoom,
              startTime: finalStartTime,
              endTime: finalEndTime,
              excludeId: data.id,
            });

          if (roomConflict) {
            return {
              success: false,
              message: `Room "${finalRoom}" is already booked from ${formatConflictTime(
                roomConflict.startTime,
              )} to ${formatConflictTime(
                roomConflict.endTime,
              )}.`,
            };
          }
        }
      }

      const result =
        await ClassSessionRepository.update(
          data.id,
          data.organizationId,
          data.branchId,
          {
            title:
              data.title !== undefined
                ? data.title.trim()
                : undefined,
            description: data.description,
            startTime: data.startTime,
            endTime: data.endTime,
            room:
              data.room !== undefined
                ? finalRoom
                : undefined,
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

function formatConflictTime(date: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

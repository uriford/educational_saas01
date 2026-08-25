import { LessonProgressRepository } from "../repository/lesson-progress.repository";

export class LessonProgressService {
  static async getCourseLessons(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    const enrollment =
      await LessonProgressRepository.findEnrollmentForStudent(
        studentId,
        courseId,
        organizationId,
        branchId,
      );

    if (!enrollment) {
      return {
        success: false,
        message: "You are not enrolled in this course.",
      };
    }

    const lessons =
      await LessonProgressRepository.findPublishedLessons(
        courseId,
        organizationId,
        branchId,
      );

    const progress =
      await LessonProgressRepository.findEnrollmentProgress(
        enrollment.id,
      );

    const progressMap = new Map(
      progress.map((item) => [
        item.lessonId,
        item,
      ]),
    );

    return {
      success: true,
      enrollment,
      lessons: lessons.map((lesson) => ({
        ...lesson,
        progress:
          progressMap.get(lesson.id) ?? null,
      })),
    };
  }

  static async getLesson(
    studentId: string,
    courseId: string,
    lessonId: string,
    organizationId: string,
    branchId?: string,
  ) {
    const enrollment =
      await LessonProgressRepository.findEnrollmentForStudent(
        studentId,
        courseId,
        organizationId,
        branchId,
      );

    if (!enrollment) {
      return {
        success: false,
        message: "You are not enrolled in this course.",
      };
    }

    const lessons =
      await LessonProgressRepository.findPublishedLessons(
        courseId,
        organizationId,
        branchId,
      );

    const lessonIndex = lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );

    if (lessonIndex === -1) {
      return {
        success: false,
        message: "Lesson not found.",
      };
    }

    const lesson = lessons[lessonIndex];

    const existingProgress =
      await LessonProgressRepository.findLessonProgress(
        enrollment.id,
        lessonId,
      );

    await LessonProgressRepository.markViewed(
      enrollment.id,
      lessonId,
    );

    return {
      success: true,
      enrollment,
      lesson,
      progress: existingProgress,
      previousLesson:
        lessonIndex > 0
          ? lessons[lessonIndex - 1]
          : null,
      nextLesson:
        lessonIndex < lessons.length - 1
          ? lessons[lessonIndex + 1]
          : null,
    };
  }

  static async markComplete(
    studentId: string,
    courseId: string,
    lessonId: string,
    organizationId: string,
    branchId?: string,
  ) {
    const enrollment =
      await LessonProgressRepository.findEnrollmentForStudent(
        studentId,
        courseId,
        organizationId,
        branchId,
      );

    if (!enrollment) {
      return {
        success: false,
        message: "You are not enrolled in this course.",
      };
    }

    const lesson =
      await LessonProgressRepository.findPublishedLesson(
        lessonId,
        courseId,
        organizationId,
        branchId,
      );

    if (!lesson) {
      return {
        success: false,
        message: "Lesson not found.",
      };
    }

    await LessonProgressRepository.markCompleted(
      enrollment.id,
      lessonId,
    );

    const totalLessons =
      await LessonProgressRepository.countPublishedLessons(
        courseId,
        organizationId,
        branchId,
      );

    const completedLessons =
      await LessonProgressRepository.countCompletedLessons(
        enrollment.id,
      );

    const progress =
      totalLessons === 0
        ? 0
        : Math.min(
            100,
            Math.round(
              (completedLessons /
                totalLessons) *
                100,
            ),
          );

    await LessonProgressRepository.updateEnrollmentProgress(
      enrollment.id,
      progress,
    );

    return {
      success: true,
      message:
        progress >= 100
          ? "Course completed successfully."
          : "Lesson marked as complete.",
      progress,
      completedLessons,
      totalLessons,
    };
  }
}

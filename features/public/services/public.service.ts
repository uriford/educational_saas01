import "server-only";

import { PublicRepository } from "../repository/public.repository";

export class PublicService {
  static async getHomePageData(slug: string) {
    const organization =
      await PublicRepository.getOrganizationBySlug(slug);

    if (!organization) {
      return null;
    }

    return {
      organization,
      stats: {
        students: organization._count.students,
        teachers: organization._count.teachers,
        courses: organization._count.courses,
      },
      branches: organization.branches,
      courses: organization.courses,
      announcements: organization.announcements,
      upcomingClasses: organization.classSessions,
    };
  }
}

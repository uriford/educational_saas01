export type AnalyticsOverview = {
  students: {
    total: number;
    active: number;
    inactive: number;
    graduated: number;
  };

  teachers: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };

  courses: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };

  announcements: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
  };
};
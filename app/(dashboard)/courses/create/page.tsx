import { requireAdmin } from "@/features/auth/authorization";
import CreateCoursePage from "@/features/courses/pages/CreateCoursePage";

export default async function Page() {
  await requireAdmin();

  return <CreateCoursePage />;
}
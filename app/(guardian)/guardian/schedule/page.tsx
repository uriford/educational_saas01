import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import GuardianScheduleBoard from "@/features/guardian-portal/components/GuardianScheduleBoard";

export default async function GuardianSchedulePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.GUARDIAN) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const children = await GuardianService.getChildren(
    session.user.id,
    organizationId,
  );

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Schedule
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            No students are currently linked to your guardian account.
          </p>
        </section>
      </div>
    );
  }

  const firstChild = children[0]?.student;

  if (!firstChild) {
    redirect("/guardian/students");
  }

  const schedule = await GuardianService.getChildSchedule(
    session.user.id,
    organizationId,
    firstChild.id,
  );

  if (!schedule) {
    redirect("/guardian/students");
  }

  const serializedSessions = schedule.sessions.map(
    (session) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      room: session.room,
      status: session.status,
      course: session.course,
      teacher: session.teacher,
    }),
  );

  return (
    <GuardianScheduleBoard
      student={schedule.student}
      sessions={serializedSessions}
    />
  );
}

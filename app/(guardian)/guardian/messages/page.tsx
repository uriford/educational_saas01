import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import { getGuardianChatConversation } from "@/features/chat/services/chat.service";
import GuardianMessages from "@/features/guardian-portal/components/GuardianMessages";

type SearchParams = {
  studentId?: string;
};

export default async function GuardianMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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
  const params = await searchParams;

  const childrenRelations = await GuardianService.getChildren(
    session.user.id,
    organizationId,
  );

  const children = childrenRelations.map((relation) => ({
    id: relation.student.id,
    studentId: relation.student.studentId,
    firstName: relation.student.firstName,
    lastName: relation.student.lastName,
    userId: relation.student.userId,
  }));

  if (!children.length) {
    return (
      <GuardianMessages
        organizationId={organizationId}
        guardianUserId={session.user.id}
        students={[]}
        initialConversation={null}
      />
    );
  }

  const selectedStudent =
    children.find((child) => child.id === params.studentId) ??
    children[0];

  let initialConversation = null;

  if (selectedStudent.userId) {
    const existingConversation = await getGuardianChatConversation(
      selectedStudent.userId,
      organizationId,
      selectedStudent.userId,
    );

    initialConversation = existingConversation;
  }

  return (
    <GuardianMessages
      organizationId={organizationId}
      guardianUserId={session.user.id}
      students={children}
      initialStudentId={selectedStudent.id}
      initialConversation={initialConversation}
    />
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";

import {
  getChatStaffMembersAction,
  getAvailableChatStaffUsersAction,
} from "@/features/chat/staff-management/actions/chat-staff-management.actions";

import ChatStaffManagement from "@/features/chat/staff-management/components/ChatStaffManagement";

export default async function ChatStaffPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    redirect("/login");
  }

  if (
    session.user.role !== "ORGANIZATION_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/chat");
  }

  const [staffResult, usersResult] =
    await Promise.all([
      getChatStaffMembersAction(),
      getAvailableChatStaffUsersAction(),
    ]);

  return (
    <ChatStaffManagement
      initialStaff={
        staffResult.success
          ? staffResult.data
          : []
      }
      initialUsers={
        usersResult.success
          ? usersResult.data
          : []
      }
    />
  );
}

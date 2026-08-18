import { auth } from "@/auth";
import { db } from "@/lib/db";

import ChatWindow from "@/features/chat/components/ChatWindow";

import {
  startChatConversation,
} from "@/features/chat/services/chat.service";


export default async function StudentChatPage() {

  const session = await auth();


  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return null;
  }


  const student = await db.student.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    return null;
  }

  const conversation =
    await startChatConversation({
      organizationId:
        session.user.organizationId,

      studentId:
        student.id,
    });



  return (

    <div className="h-[calc(100vh-120px)]">

      <ChatWindow
        organizationId={session.user.organizationId!}

        conversationId={
          conversation.id
        }

        currentUserId={
          session.user.id
        }

        messages={
          conversation.messages ?? []
        }

      />

    </div>

  );
}

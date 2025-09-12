// src/server/routers/conversation.ts
import { router, procedure } from "../trpc";
import { z } from "zod";
import { generateCareerReply } from "../utils";

export const conversationRouter = router({
  // ... (list and get procedures remain the same)
  list: procedure.query(async ({ ctx }) => {
    console.log("▶️ [Server] Fetching conversation list...");
    return await ctx.prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }),

  get: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      console.log(`▶️ [Server] Fetching conversation with ID: ${input.id}`);
      return ctx.prisma.conversation.findUnique({
        where: { id: input.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }),

  create: procedure
    .input(
      z.object({
        title: z.string().min(1, "Title cannot be empty"), // Let's make the validation explicit
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        "▶️ [Server] Received request to create conversation with input:",
        input
      );
      try {
        const newConversation = await ctx.prisma.conversation.create({
          data: { title: input.title },
        });
        console.log(
          "✅ [Server] Successfully created conversation:",
          newConversation
        );
        return newConversation;
      } catch (error) {
        console.error(
          "❌ [Server] Database error creating conversation:",
          error
        );
        throw error; // re-throw the error so tRPC can handle it
      }
    }),

  // ... (sendMessageAndGetReply remains the same)
  sendMessageAndGetReply: procedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        `▶️ [Server] Received message for convo ${input.conversationId}`
      );
      // ... rest of the function
      await ctx.prisma.message.create({
        data: {
          role: "user",
          content: input.content,
          conversationId: input.conversationId,
        },
      });
      const aiReplyContent = await generateCareerReply(input.content);
      const aiMessage = await ctx.prisma.message.create({
        data: {
          role: "assistant",
          content: aiReplyContent,
          conversationId: input.conversationId,
        },
      });
      console.log(
        `✅ [Server] Saved user message and AI reply for convo ${input.conversationId}`
      );
      return aiMessage;
    }),
});

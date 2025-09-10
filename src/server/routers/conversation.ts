// src/server/routers/conversation.ts
import { router, procedure } from "../trpc";
import { z } from "zod";

export const conversationRouter = router({
  // List conversations
  list: procedure.query(async ({ ctx }) => {
    return await ctx.prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: { messages: true },
    });
  }),

  // Create a new conversation
  create: procedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.conversation.create({
        data: { title: input.title },
      });
    }),

  // Get a single conversation by ID
  get: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.conversation.findUnique({
        where: { id: input.id },
        include: { messages: true },
      });
    }),

  // Add a message to a conversation
  addMessage: procedure
    .input(
      z.object({
        conversationId: z.number(),
        role: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.message.create({
        data: {
          role: input.role,
          content: input.content,
          conversationId: input.conversationId,
        },
      });
    }),
});

// src/server/routers/conversation.ts
import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { generateCareerReply } from "../utils";

export const conversationRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.prisma.conversation.findMany({
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return conversations;
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.prisma.conversation.findUnique({
        where: { id: input.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      return conv;
    }),

  create: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const c = await ctx.prisma.conversation.create({
        data: { title: input.title ?? "New conversation" },
      });
      return c;
    }),

  addMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Save the user message
      const message = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
        },
      });

      // If the message was from the user, call AI and save assistant reply
      if (input.role === "user") {
        const aiReply = await generateCareerReply(input.content);
        const assistant = await ctx.prisma.message.create({
          data: {
            conversationId: input.conversationId,
            role: "assistant",
            content: aiReply,
          },
        });

        // touch updatedAt on conversation
        await ctx.prisma.conversation.update({
          where: { id: input.conversationId },
          data: { updatedAt: new Date() },
        });

        return { userMessage: message, assistantMessage: assistant };
      }

      // otherwise only return message
      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      return { message };
    }),
});

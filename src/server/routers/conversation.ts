import { router, procedure } from "../trpc";
import { z } from "zod";
import { generateCareerReply, generateTitle } from "../utils";

export const conversationRouter = router({
  list: procedure.query(async ({ ctx }) => {
    return await ctx.prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }),

  get: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.conversation.findUnique({
        where: { id: input.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }),

  delete: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.deleteMany({
        where: { conversationId: input.id },
      });

      return await ctx.prisma.conversation.delete({
        where: { id: input.id },
      });
    }),

  addMessage: procedure
    .input(z.object({ conversationId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.create({
        data: {
          role: "user",
          content: input.content,
          conversationId: input.conversationId,
        },
      });
      const aiReplyContent = await generateCareerReply(input.content);
      return await ctx.prisma.message.create({
        data: {
          role: "assistant",
          content: aiReplyContent,
          conversationId: input.conversationId,
        },
      });
    }),

  startAndSendMessage: procedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const title = await generateTitle(input.content);

      const newConversation = await ctx.prisma.conversation.create({
        data: {
          title: title,
          messages: {
            create: [{ role: "user", content: input.content }],
          },
        },
      });

      const aiReplyContent = await generateCareerReply(input.content);
      await ctx.prisma.message.create({
        data: {
          role: "assistant",
          content: aiReplyContent,
          conversationId: newConversation.id,
        },
      });

      return { conversationId: newConversation.id };
    }),
});

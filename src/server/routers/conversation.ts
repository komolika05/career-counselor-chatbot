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
      // 1. Delete all messages for that conversation
      await ctx.prisma.message.deleteMany({
        where: { conversationId: input.id },
      });

      // 2. Delete the conversation itself
      return await ctx.prisma.conversation.delete({
        where: { id: input.id },
      });
    }),

  // For adding messages to an EXISTING conversation
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

  // For the FIRST message of a NEW conversation
  startAndSendMessage: procedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Generate the title from the first message
      const title = await generateTitle(input.content);

      // 2. Create the conversation with the dynamic title and the first message
      const newConversation = await ctx.prisma.conversation.create({
        data: {
          title: title, // Use the generated title here
          messages: {
            create: [{ role: "user", content: input.content }],
          },
        },
      });

      // 3. Get the AI reply
      const aiReplyContent = await generateCareerReply(input.content);
      await ctx.prisma.message.create({
        data: {
          role: "assistant",
          content: aiReplyContent,
          conversationId: newConversation.id,
        },
      });

      // 4. Return the ID of the new conversation
      return { conversationId: newConversation.id };
    }),
});

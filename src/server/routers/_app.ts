import { router } from "../trpc";
import { conversationRouter } from "./conversation";

export const appRouter = router({
  conversation: conversationRouter,
});

export type AppRouter = typeof appRouter;

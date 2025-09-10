import { conversationRouter } from "./conversation";
import { router } from "../trpc";

export const appRouter = router({
  conversation: conversationRouter,
});

export type AppRouter = typeof appRouter;

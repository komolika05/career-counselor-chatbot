import { prisma } from "@/lib/prisma";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = () => {
  return {
    prisma,
  };
};

type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;

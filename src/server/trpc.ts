import { prisma } from "@/lib/prisma";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<Context>().create();

export const createContext = () => {
  return {
    prisma,
  };
};

type Context = ReturnType<typeof createContext>;

export const router = t.router;
export const procedure = t.procedure;

import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { pokemon, vote } from "@/server/db/schema";

export const pokemonRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});

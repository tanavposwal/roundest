import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { pokemon, vote } from "@/server/db/schema";
import { db } from "@/server/db";
import { eq, sql } from "drizzle-orm";

function getTwoRandomNumbers(max: number) {
  const first = Math.floor(Math.random() * max) + 1;
  let second: number;
  do {
    second = Math.floor(Math.random() * max) + 1;
  } while (second === first);
  return [first, second] as const;
}

export const pokemonRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getPairs: publicProcedure.query(async () => {
    const [firstid, secondid] = getTwoRandomNumbers(1025);

    const poke1 = await db
      .select()
      .from(pokemon)
      .where(eq(pokemon.id, firstid));
    const poke2 = await db
      .select()
      .from(pokemon)
      .where(eq(pokemon.id, secondid));

    return [poke1, poke2] as const;
  }),
  vote: publicProcedure
    .input(z.object({ votedForId: z.number(), votedAgainstId: z.number() }))
    .mutation(async ({ input }) => {
      await db.insert(vote).values({
        votedForId: input.votedForId,
        votedAgainstId: input.votedAgainstId,
      });
      return { success: true };
    }),
  getResults: publicProcedure.query(async () => {
    const votesPerPokemon = await db
      .select({
        id: pokemon.id,
        name: pokemon.name,
        voteForCount:
          sql`COUNT(CASE WHEN vote.votedForId = ${pokemon.id} THEN 1 END)`.as(
            "voteForCount",
          ),
        voteAgainstCount:
          sql`COUNT(CASE WHEN vote.votedAgainstId = ${pokemon.id} THEN 1 END)`.as(
            "voteAgainstCount",
          ),
      })
      .from(pokemon)
      .leftJoin(
        vote,
        sql`vote.votedForId = ${pokemon.id} OR vote.votedAgainstId = ${pokemon.id}`,
      )
      .groupBy(pokemon.id, pokemon.name);

    const sortedPokemon = votesPerPokemon
      .map((pokemon) => {
        const upVotes = (pokemon.voteForCount as number) || 0; // Handle nulls from SQL counts
        const downVotes = (pokemon.voteAgainstCount as number) || 0;
        const totalVotes = upVotes + downVotes;

        return {
          dexId: pokemon.id,
          name: pokemon.name,
          upVotes,
          downVotes,
          winPercentage: totalVotes > 0 ? (upVotes / totalVotes) * 100 : 0,
        };
      })
      .sort((a, b) => {
        // Sort by win percentage first
        if (b.winPercentage !== a.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        // Break ties by upvotes
        return b.upVotes - a.upVotes;
      });

    return sortedPokemon;
  }),
});

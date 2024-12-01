import { create } from "domain";
import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

export const createTable = sqliteTableCreator((name) => `r_${name}`);

export const pokemon = createTable("pokemon", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }),
});

export const vote = createTable("vote", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: int("created_at", {
    mode: "timestamp",
  })
    .default(sql`(unixepoch())`)
    .notNull(),
  votedForId: int("votedforid", { mode: "number" })
    .notNull()
    .references(() => pokemon.id),
  votedAgainstId: int("votedagainstid", { mode: "number" })
    .notNull()
    .references(() => pokemon.id),
});

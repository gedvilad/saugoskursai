import { sql } from "drizzle-orm";
import {
  integer,
  pgTableCreator,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// Create your custom table creator with a prefix (optional)
export const createTable = pgTableCreator((name) => `pvpwebsite_${name}`);

export const users = createTable(
  "users",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    clerk_id: varchar("clerk_id", { length: 256 }).notNull().unique(), // Adjusted the column name to match
    email: varchar("email", { length: 256 }).notNull(),
    first_name: varchar("first_name", { length: 256 }).notNull(),
    last_name: varchar("last_name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    userIndex: index("user_idx").on(example.clerk_id),
  }),
);

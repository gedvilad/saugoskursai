import { sql } from "drizzle-orm";
import {
  integer,
  pgTableCreator,
  varchar,
  timestamp,
  index,
  primaryKey,
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
    role: varchar("role", { length: 50 }).default("user").notNull(),
  },
  (example) => ({
    userIndex: index("user_idx").on(example.clerk_id),
  }),
);

export const groups = createTable(
  "groups",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    // Optional:  Add a column for the group creator (user ID)
    ownerId: varchar("owner_id", { length: 256 })
      .notNull()
      .references(() => users.clerk_id),
  },
  (group) => ({
    nameIndex: index("group_name_idx").on(group.name),
  }),
);

export const userGroups = createTable(
  "user_groups",
  {
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.clerk_id),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
    role: varchar("role", { length: 50 }).default("member"), // e.g., admin, moderator, member
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.groupId] }), // Composite primary key
    userGroupIndex: index("user_group_idx").on(table.userId, table.groupId),
  }),
);

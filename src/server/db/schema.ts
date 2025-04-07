import { sql } from "drizzle-orm";
import {
  integer,
  pgTableCreator,
  varchar,
  timestamp,
  index,
  primaryKey,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { start } from "repl";

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
    pk: primaryKey({ columns: [table.userId, table.groupId] }),
    userGroupIndex: index("user_group_idx").on(table.userId, table.groupId),
  }),
);
export const notifications = createTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 50 })
      .notNull()
      .references(() => users.clerk_id),
    message: varchar("message", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    status: integer("status").default(1).notNull(),
  },
  (table) => ({
    notificationIndex: index("notification_idx").on(table.id),
  }),
);
export const tests = createTable(
  "tests",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    testNameIndex: index("testName_idx").on(table.name),
  }),
);

export const test_questions = createTable(
  "test_questions",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    testId: integer("test_id")
      .notNull()
      .references(() => tests.id),
    question: varchar("question", { length: 512 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    type: integer("type").notNull(),
  },
  (table) => ({
    testQuestionIndex: index("testQuestion_idx").on(table.testId),
  }),
);
export const test_answers = createTable(
  "test_answers",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    questionId: integer("question_id")
      .notNull()
      .references(() => test_questions.id, { onDelete: "cascade" }),
    answer: varchar("answer", { length: 512 }).notNull(),
  },
  (table) => ({
    questionAnswerIndex: index("questionAnswer_idx").on(table.questionId),
  }),
);

export const test_question_choices = createTable(
  "test_question_choices",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    testQuestionId: integer("test_question_id")
      .notNull()
      .references(() => test_questions.id),
    choice: varchar("choice", { length: 512 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    isCorrect: boolean("is_correct").notNull(),
  },
  (table) => ({
    questionChoiceIndex: index("question_choice_index").on(table.id),
  }),
);
export const user_test_responses = createTable(
  "user_test_responeses",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 50 })
      .notNull()
      .references(() => users.clerk_id),
    testId: integer("test_id")
      .notNull()
      .references(() => tests.id),
    startTime: timestamp("start_time", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    endTime: timestamp("end_time", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    score: numeric("score", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userTestResponseIndex: index("user_test_response_index").on(table.id),
  }),
);
export const user_test_answers = createTable(
  "user_test_answers",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    user_test_response_id: integer("user_test_response_id")
      .notNull()
      .references(() => user_test_responses.id),
    test_questions_id: integer("test_questions_id")
      .notNull()
      .references(() => test_questions.id),
    test_question_choices_id: integer("test_question_choices_id")
      .notNull()
      .references(() => test_question_choices.id),
    userId: varchar("user_id", { length: 50 })
      .notNull()
      .references(() => users.clerk_id),
    testId: integer("test_id")
      .notNull()
      .references(() => tests.id),
    answer: varchar("answer", { length: 512 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    isCorrect: boolean("is_correct").notNull(),
  },
  (table) => ({
    userTestAnswerIndex: index("user_test_answer_index").on(table.id),
  }),
);
export const courses = createTable(
  "courses",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    courseTest: integer("course_test")
      .notNull()
      .references(() => tests.id),
    productId: varchar("product_id", { length: 255 }).notNull(),
    productPriceNr: integer("product_price_nr").notNull(),
  },
  (course) => ({
    nameIndex: index("course_name_idx").on(course.name),
  }),
);
export const user_bought_courses = createTable(
  "user_bought_courses",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 50 })
      .notNull()
      .references(() => users.clerk_id),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
  },
  (user_bought_courses) => ({
    nameIndex: index("user_bought_course_idx").on(user_bought_courses.id),
  }),
);
export const user_assigned_courses = createTable(
  "user_assigned_courses",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 50 })
      .notNull()
      .references(() => users.clerk_id),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
    status: varchar("status", { length: 50 }).default("Priskirtas").notNull(),
  },
  (user_assigned_courses) => ({
    nameIndex: index("user_assigned_course_idx").on(user_assigned_courses.id),
  }),
);

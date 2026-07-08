import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── Booking ────────────────────────────────────────────────────────────────

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

// One row per weekday (0=Sunday..6=Saturday). Inactive or missing = not bookable.
export const availabilityConfig = pgTable("availability_config", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull().unique(),
  startTime: varchar("start_time", { length: 5 }).notNull(), // 'HH:mm'
  endTime: varchar("end_time", { length: 5 }).notNull(), // 'HH:mm'
  slotDuration: integer("slot_duration").notNull().default(60), // minutes
  isActive: boolean("is_active").notNull().default(false),
});

// Date-specific exceptions: holidays, closures, or deviating hours.
export const availabilityOverrides = pgTable("availability_overrides", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // 'YYYY-MM-DD'
  isClosed: boolean("is_closed").notNull().default(true),
  startTime: varchar("start_time", { length: 5 }),
  endTime: varchar("end_time", { length: 5 }),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// date/time as plain strings: the business operates in one timezone
// (America/Paramaribo); string comparison avoids timezone bugs entirely.
export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: varchar("date", { length: 10 }).notNull(),
    time: varchar("time", { length: 5 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    topic: varchar("topic", { length: 80 }),
    notes: text("notes"),
    locale: varchar("locale", { length: 2 }).notNull().default("nl"),
    status: appointmentStatusEnum("status").notNull().default("pending"),
    confirmedAt: timestamp("confirmed_at"),
    cancelledAt: timestamp("cancelled_at"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // Double-booking guard: at most one non-cancelled appointment per slot.
    uniqueIndex("appointments_date_time_active_uq")
      .on(table.date, table.time)
      .where(sql`${table.status} != 'cancelled'`),
  ]
);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "handled",
]);

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  organization: varchar("organization", { length: 160 }),
  message: text("message").notNull(),
  locale: varchar("locale", { length: 2 }).notNull().default("nl"),
  status: contactMessageStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── CMS ────────────────────────────────────────────────────────────────────

export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

// locale NULL = fallback row that applies to every language.
export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    locale: varchar("locale", { length: 2 }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull().default(""), // markdown
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 500 }),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("pages_slug_locale_uq").on(table.slug, table.locale).nullsNotDistinct(),
  ]
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(), // globally unique across all languages
    locale: varchar("locale", { length: 2 }).notNull(),
    translationGroupId: uuid("translation_group_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""), // markdown
    coverImage: text("cover_image"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    category: varchar("category", { length: 80 }),
    status: postStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("blog_posts_group_locale_uq").on(table.translationGroupId, table.locale),
  ]
);

// One row per locale; content is a JSON string of partial homepage overrides.
export const homepageContent = pgTable("homepage_content", {
  id: serial("id").primaryKey(),
  locale: varchar("locale", { length: 2 }).notNull().unique(),
  content: text("content").notNull(), // JSON string
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Per-service structured content overrides (keys: 6 service slugs + 'diensten-index').
export const servicesContent = pgTable(
  "services_content",
  {
    id: serial("id").primaryKey(),
    serviceKey: varchar("service_key", { length: 64 }).notNull(),
    locale: varchar("locale", { length: 2 }).notNull(),
    content: text("content").notNull(), // JSON string
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("services_content_key_locale_uq").on(table.serviceKey, table.locale),
  ]
);

export const vacancies = pgTable("vacancies", {
  id: uuid("id").defaultRandom().primaryKey(),
  locale: varchar("locale", { length: 2 }).notNull().default("nl"),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 120 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  employmentType: varchar("employment_type", { length: 80 }).notNull(),
  description: text("description").notNull().default(""),
  duties: jsonb("duties").$type<string[]>().notNull().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  offers: jsonb("offers").$type<string[]>().notNull().default([]),
  applyEmail: varchar("apply_email", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Types ──────────────────────────────────────────────────────────────────

export type AvailabilityConfig = typeof availabilityConfig.$inferSelect;
export type AvailabilityOverride = typeof availabilityOverrides.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Vacancy = typeof vacancies.$inferSelect;

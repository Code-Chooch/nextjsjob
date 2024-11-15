import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const jobsTable = pgTable("jobs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  employmentType: varchar({ length: 255 }).notNull(),
  applyUrl: varchar({ length: 255 }).notNull(),
  companyName: varchar({ length: 255 }).notNull(),
  salary: varchar({ length: 255 })
    .$type<string | null>()
    .notNull()
    .default(null),
  companyLogoUrl: varchar({ length: 255 })
    .$type<string | null>()
    .notNull()
    .default(null),
  tags: text().array().$type<string[] | null>().notNull().default(null),
  showCompanyLogo: boolean().notNull().default(false),
  showCustomColor: boolean().notNull().default(false),
  showAtTopWeekly: boolean().notNull().default(false),
  showAtTopDaily: boolean().notNull().default(false),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().defaultNow().notNull(),
  createdBy: varchar({ length: 255 }).notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  updatedBy: varchar({ length: 255 }).notNull(),
  deletedAt: timestamp().$type<Date | null>().notNull().default(null),
  deletedBy: varchar({ length: 255 })
    .$type<string | null>()
    .notNull()
    .default(null),
});

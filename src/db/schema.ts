import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const notifyTable = pgTable('notify', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  email: varchar({ length: 255 }).notNull().unique(),
  notifiedAt: timestamp('notified_at'),
})

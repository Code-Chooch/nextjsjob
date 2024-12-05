import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const notifyTable = pgTable('notify', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  email: varchar({ length: 255 }).notNull(),
  userType: varchar('user_type', { length: 50 }).notNull(),
  notifiedAt: timestamp('notified_at'),
  emailId: varchar('email_id', { length: 255 }),
})

export const emailLogTable = pgTable('email_log', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  emailId: varchar('email_id', { length: 255 }).notNull().unique(),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  clickedAt: timestamp('clicked_at'),
  deliveryDelayedAt: timestamp('delivery_delayed_at'),
  bouncedAt: timestamp('bounced_at'),
  complainedAt: timestamp('complained_at'),
})

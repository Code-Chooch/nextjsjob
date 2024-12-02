'use server'

import { db } from '@/db/db'
import { notifyTable } from '@/db/schema'
import { unauthedActionClient } from '@/lib/safe-action'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export const addToNotifyList = unauthedActionClient
  .schema(schema)
  .action(async ({ parsedInput: { email } }) => {
    // Check if email is already in the database
    const existingEmail = await db
      .select()
      .from(notifyTable)
      .where(eq(notifyTable.email, email))

    if (existingEmail) {
      return {
        success: false,
        message: 'The email you entered is already in the notify list.',
      }
    }

    // Add email to notify list
    await db.insert(notifyTable).values({ email })

    return { success: true, message: 'You have been added to the notify list!' }
  })

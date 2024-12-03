'use server'

import { db } from '@/db/db'
import { notifyTable } from '@/db/schema'
import { unauthedActionClient } from '@/lib/safe-action'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  userType: z.enum(['developer', 'employer']),
})

export const addToNotifyList = unauthedActionClient
  .metadata({
    actionName: 'addToNotifyList',
  })
  .schema(schema)
  .action(async ({ parsedInput: { email, userType } }) => {
    // Check if email is already in the database
    const existingEmail = await db
      .select()
      .from(notifyTable)
      .where(
        and(eq(notifyTable.email, email), eq(notifyTable.userType, userType))
      )

    if (existingEmail.length > 0) {
      return {
        success: false,
        message: 'The email you entered is already in the notify list.',
      }
    }

    // Add email to notify list
    await db.insert(notifyTable).values({ email, userType })

    return { success: true, message: 'You have been added to the notify list!' }
  })

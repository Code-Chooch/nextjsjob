'use server'

import { db } from '@/db/db'
import { notifyTable } from '@/db/schema'
import { authedActionClient, SafeActionError } from '@/lib/safe-action'
import { z } from 'zod'
import { NotifyUserType } from '../types'
import { resend } from '@/lib/resend'
import EmployerNotificationEmail from '@/react-email-starter/emails/employer-notification-email'
import DeveloperNotificationEmail from '@/react-email-starter/emails/developer-notification-email'
import { eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  revalidationPath: z.string(),
})

export const sendNotifyLiveEmails = authedActionClient
  .metadata({
    actionName: 'addToNotifyList',
  })
  .schema(schema)
  .action(async ({ parsedInput: { revalidationPath } }) => {
    // Get notify list
    const notifyList = await db
      .select({
        id: notifyTable.id,
        email: notifyTable.email,
        userType: notifyTable.userType,
        notifiedAt: notifyTable.notifiedAt,
      })
      .from(notifyTable)
      .where(isNull(notifyTable.notifiedAt))

    const employers = notifyList.filter(
      (u) =>
        (u.userType as NotifyUserType) === 'employer' && u.notifiedAt === null
    )

    const developers = notifyList.filter(
      (u) =>
        (u.userType as NotifyUserType) === 'developer' && u.notifiedAt === null
    )

    if (employers.length > 0) {
      try {
        for (const employer of employers) {
          const { data, error } = await resend.emails.send({
            from: 'Notify <notify@nextjsjob.com>',
            to: [employer.email],
            subject: '🚀 Lauch of NextJS Job Board!',
            react: EmployerNotificationEmail({
              url: 'https://www.nextjsjob.com',
            }),
          })

          if (error) {
            const err = error as Error
            throw new SafeActionError(err.message)
          }

          // store email id in notify table
          await db
            .update(notifyTable)
            .set({ emailId: data?.id, notifiedAt: sql`NOW()` })
            .where(eq(notifyTable.id, employer.id))
        }
      } catch (error) {
        const err = error as Error
        throw new SafeActionError(err.message)
      }
    }

    if (developers.length > 0) {
      try {
        for (const developer of developers) {
          const { data, error } = await resend.emails.send({
            from: 'Notify <notify@nextjsjob.com>',
            to: [developer.email],
            subject: '🚀 Lauch of NextJS Job Board!',
            react: DeveloperNotificationEmail({
              url: 'https://www.nextjsjob.com',
            }),
          })

          if (error) {
            const err = error as Error
            throw new SafeActionError(err.message)
          }

          // store email id in notify table
          await db
            .update(notifyTable)
            .set({ emailId: data?.id, notifiedAt: sql`NOW()` })
            .where(eq(notifyTable.id, developer.id))
        }
      } catch (error) {
        const err = error as Error
        throw new SafeActionError(err.message)
      }
    }

    if (developers.length === 0 && employers.length === 0) {
      throw new SafeActionError('No developers or employers to email.')
    }

    revalidatePath(revalidationPath)

    return { emailsSent: notifyList.length }
  })

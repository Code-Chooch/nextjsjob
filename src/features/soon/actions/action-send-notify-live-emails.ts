'use server'

import { db } from '@/db/db'
import { notifyTable } from '@/db/schema'
import { unauthedActionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { NotifyUserType } from '../types'
import { resend } from '@/lib/resend'
import EmployerNotificationEmail from '@/react-email-starter/emails/employer-notification-email'
import DeveloperNotificationEmail from '@/react-email-starter/emails/developer-notification-email'
import { eq } from 'drizzle-orm'

const schema = z.object({})

export const addToNotifyList = unauthedActionClient
  .metadata({
    actionName: 'addToNotifyList',
  })
  .schema(schema)
  .action(async () => {
    // Get notify list
    const notifyList = await db
      .select({
        id: notifyTable.id,
        email: notifyTable.email,
        userType: notifyTable.userType,
      })
      .from(notifyTable)

    const employers = notifyList.filter(
      (u) => (u.userType as NotifyUserType) === 'employer'
    )

    const developers = notifyList.filter(
      (u) => (u.userType as NotifyUserType) === 'developer'
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
            return { success: false, message: err.message }
          }

          // store email id in notify table
          await db
            .update(notifyTable)
            .set({ emailId: data?.id })
            .where(eq(notifyTable.id, employer.id))
        }
      } catch (error) {
        const err = error as Error
        return { success: false, message: err.message }
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
            return { success: false, message: err.message }
          }

          // store email id in notify table
          await db
            .update(notifyTable)
            .set({ emailId: data?.id })
            .where(eq(notifyTable.id, developer.id))
        }
      } catch (error) {
        const err = error as Error
        return { success: false, message: err.message }
      }
    }

    if (developers.length === 0 && employers.length === 0) {
      return { success: true, message: 'No developers or employers to email.' }
    }

    return {
      success: true,
      message: `Emails sent to ${notifyList.length} users!`,
    }
  })

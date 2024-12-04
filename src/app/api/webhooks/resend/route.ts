import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { sql } from 'drizzle-orm'

import { ResendWebhookEvent } from '@/lib/resend'
import { db } from '@/db/db'
import { emailLogTable } from '@/db/schema'

export async function POST(req: Request) {
  // You can find this in the Resend Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Resend Dashboard to .env or .env.local'
    )
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: ResendWebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ResendWebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Get the ID and type
  const eventType = evt.type

  switch (eventType) {
    case 'email.sent':
      await db
        .insert(emailLogTable)
        .values({ emailId: evt.data.email_id, sentAt: sql`NOW()` })
        .onConflictDoUpdate({
          target: emailLogTable.emailId,
          set: { sentAt: sql`NOW()` },
        })
      return new Response('', { status: 200 })
    case 'email.delivered':
      await db
        .insert(emailLogTable)
        .values({ emailId: evt.data.email_id, deliveredAt: sql`NOW()` })
        .onConflictDoUpdate({
          target: emailLogTable.emailId,
          set: { deliveredAt: sql`NOW()` },
        })
      return new Response('', { status: 200 })
    case 'email.delivery_delayed':
      await db
        .insert(emailLogTable)
        .values({ emailId: evt.data.email_id, deliveryDelayedAt: sql`NOW()` })
        .onConflictDoUpdate({
          target: emailLogTable.emailId,
          set: { deliveryDelayedAt: sql`NOW()` },
        })
      return new Response('', { status: 200 })
    case 'email.complained':
      await db
        .insert(emailLogTable)
        .values({ emailId: evt.data.email_id, complainedAt: sql`NOW()` })
        .onConflictDoUpdate({
          target: emailLogTable.emailId,
          set: { complainedAt: sql`NOW()` },
        })
      return new Response('', { status: 200 })
    case 'email.bounced':
      await db
        .insert(emailLogTable)
        .values({ emailId: evt.data.email_id, bouncedAt: sql`NOW()` })
        .onConflictDoUpdate({
          target: emailLogTable.emailId,
          set: { bouncedAt: sql`NOW()` },
        })
      return new Response('', { status: 200 })
    case 'email.clicked':
      await db
        .insert(emailLogTable)
        .values({ emailId: evt.data.email_id, clickedAt: sql`NOW()` })
        .onConflictDoUpdate({
          target: emailLogTable.emailId,
          set: { clickedAt: sql`NOW()` },
        })
      return new Response('', { status: 200 })
    default:
      console.error('Unknown event type:', eventType)
      return new Response('Unknown event type: '.concat(eventType), {
        status: 400,
      })
  }
}

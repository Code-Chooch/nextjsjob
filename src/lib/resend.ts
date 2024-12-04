import { Resend } from 'resend'
import { Webhook } from 'svix'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const resendWebhook = new Webhook(process.env.RESEND_WEBHOOK_SECRET!)

export type ResendEmailType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'

export interface ResendWebhookEvent {
  created_at: string
  data: {
    created_at: string
    email_id: string
    from: string
    subject: string
    to: string[]
  }
  type: ResendEmailType
}

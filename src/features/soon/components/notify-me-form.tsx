'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addToNotifyList } from '@/features/soon/actions/action-add-to-notify-list'
import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export function NotifyMeForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsVerified] = useState(false)

  const handleCaptchaSubmission = async (token: string | null) => {
    try {
      if (!token) {
        console.error('No reCAPTCHA token provided')
        setIsVerified(false)
        return
      }

      const response = await fetch('/api/recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error(`reCAPTCHA verification failed: ${response.statusText}`)
      }

      setIsVerified(true)
    } catch (e) {
      console.error('reCAPTCHA error:', e)
      setIsVerified(false)
    }
  }

  const handleChange = (token: string | null) => {
    handleCaptchaSubmission(token)
  }

  const handleExpired = () => {
    setIsVerified(false)
  }

  const { execute } = useAction(addToNotifyList, {
    onExecute: () => {
      setMessage('')
      setIsSubmitting(true)
    },
    onSettled: ({ result }) => {
      const { message } = result?.data || {}
      setIsSubmitting(false)
      setMessage(message || '')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    execute({ email })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[100dvw] max-w-md flex flex-col gap-4 items-center"
    >
      <Input
        type="email"
        placeholder="Enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />
      <Button type="submit" disabled={isSubmitting || !isVerified}>
        {isSubmitting ? 'Submitting...' : 'Notify Me'}
      </Button>
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        ref={recaptchaRef}
        onChange={handleChange}
        onExpired={handleExpired}
        onError={() => {
          console.error('reCAPTCHA error occurred')
          setIsVerified(false)
        }}
      />
      {message && (
        <p
          className={
            message.includes('error') ? 'text-red-500' : 'text-green-500'
          }
        >
          {message}
        </p>
      )}
    </form>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { ErrorDialog } from '@/components/ui/error-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { addToNotifyList } from '@/features/soon/actions/action-add-to-notify-list'
import { NotifyUserType } from '@/features/soon/types'
import { useToast } from '@/hooks/use-toast'
import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export function NotifyMeForm() {
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<NotifyUserType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const errorDesc = useRef('')
  const errorTitle = useRef('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsVerified] = useState(false)
  const { toast } = useToast()

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
      const { success, message: msg } = result?.data || {}
      setIsSubmitting(false)
      if (success) {
        setMessage(msg || '')
        toast({ title: 'Success', description: msg })
      } else {
        errorDesc.current = message || ''
        errorTitle.current = 'Unable to Add to Notification List'
        setShowError(true)
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userType === null) {
      setMessage('You must select a user type.')
      return
    }

    execute({ email, userType })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[100dvw] max-w-md flex flex-col gap-4 items-center"
    >
      {showError && (
        <ErrorDialog
          title={errorTitle.current}
          description={errorDesc.current}
          open={showError}
          onClose={() => setShowError(false)}
        />
      )}
      <Input
        type="email"
        placeholder="Enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />
      <RadioGroup
        defaultValue={userType ?? ''}
        onValueChange={(v) => setUserType(v as NotifyUserType)}
      >
        <div className="flex items-center gap-4">
          <RadioGroupItem value="developer" id="option-one" />
          <Label htmlFor="option-one">Developer</Label>
        </div>
        <div className="flex items-center gap-4">
          <RadioGroupItem value="employer" id="option-two" />
          <Label htmlFor="option-two">Employer</Label>
        </div>
      </RadioGroup>
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
      <Button
        type="submit"
        disabled={isSubmitting || !isVerified || userType === null}
      >
        {isSubmitting ? 'Submitting...' : 'Notify Me'}
      </Button>{' '}
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

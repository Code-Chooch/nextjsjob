'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { TypingHero } from '@/components/typing-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsVerified] = useState(false)
  const { theme } = useTheme()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    // TODO: Check captcha here before recording
    // TODO: Record email info if captcha check passes
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          {theme === 'dark' ? (
            <Image
              src="/logo-dark.png"
              alt="NextJobs"
              width={250}
              height={250}
            />
          ) : (
            <Image src="/logo.png" alt="NextJobs" width={250} height={250} />
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <TypingHero />
        <h2 className="text-4xl font-bold mb-4 mt-4">
          The NextJS Job Listing Website
        </h2>
        <p className="text-xl mb-8 max-w-2xl">
          Connecting Next.js developers with exciting opportunities. Be the
          first to know when we launch!
        </p>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-grow"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={isSubmitting || !isVerified}>
              {isSubmitting ? 'Submitting...' : 'Notify Me'}
            </Button>
          </div>
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
      </main>

      <footer className="p-4 border-t">
        <div className="container mx-auto text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NextJobs. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

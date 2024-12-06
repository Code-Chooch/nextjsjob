'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ErrorDialog } from '@/components/ui/error-dialog'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const { signIn, isLoaded: isSignInLoaded, setActive } = useSignIn()
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const errorDesc = useRef('')
  const errorTitle = useRef('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetStep, setResetStep] = useState<'initial' | 'reset'>('initial')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const pathName = usePathname()
  const clerk = useClerk()

  useEffect(() => {
    if (!clerk.loaded) {
      console.log('Clerk is not loaded yet')
    }
  }, [clerk.loaded])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
      setFormMessage('Authentication is currently unavailable.')
    }
  }, [])

  if (!isSignInLoaded || !isSignUpLoaded) {
    return null
  }

  const resetState = () => {
    setEmail('')
    setPassword('')
    setFormMessage('')
    setIsError(false)
    setIsLoading(false)
    setResetStep('initial')
    setResetCode('')
    setNewPassword('')
    setIsSignUp(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        console.log('Attempting to sign up with:', { email, password })
        const result = await signUp.create({
          emailAddress: email,
          password,
        })
        console.log('Sign up result:', result)

        if (result.status === 'complete') {
          await clerk.setActive({ session: result.createdSessionId })
          setOpen(false)
          router.push(pathName)
          toast({
            title: 'Account Created',
            description: 'Your account has been created successfully.',
          })
        } else if (result.status === 'missing_requirements') {
          console.log('Verification status:', result.status)
          console.log('Missing fields:', result.missingFields)

          const verificationAttempt =
            await signUp.prepareEmailAddressVerification()
          console.log('Verification attempt:', verificationAttempt)

          if (verificationAttempt.status === 'missing_requirements') {
            toast({
              title: 'Verification Required',
              description:
                'Please check your email and click the verification link to complete sign up.',
            })
            setFormMessage(
              'Verification email sent! Please check your inbox and spam folder.'
            )
            // Optionally disable the form or show a different view while waiting
            setIsLoading(false)
          }
        } else {
          console.error('Unexpected result status', result)
          throw new Error('Unexpected result status: ' + result.status)
        }
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          setOpen(false)
          router.push(pathName)
        } else {
          console.error('Unexpected result status', result)
          throw new Error('Unexpected result status: ' + result.status)
        }
      }
    } catch (error) {
      const err = error as Error
      console.error('Error during sign in/up:', err)
      if (
        err.message.includes('Request for the Private Access Token Challenge')
      ) {
        console.log('PAT challenge error detected. Clerk state:', clerk)
      }
      errorTitle.current = `Error ${isSignUp ? 'Signing Up' : 'Signing In'}`
      errorDesc.current = err.message
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setFormMessage('Please enter your email address first.')
      return
    }
    setIsLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setFormMessage('')
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox for further instructions.',
      })
      setResetStep('reset')
    } catch (error) {
      const err = error as Error
      console.error('Error during password reset:', err)
      errorTitle.current = 'Error Resetting Password'
      errorDesc.current = err.message
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormMessage('')
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setResetStep('initial')
        setOpen(false)
        router.push(pathName)
        toast({
          title: 'Password Reset Successful',
          description:
            'Your password has been reset and you are now signed in.',
        })
      } else {
        throw new Error('Unexpected result status')
      }
    } catch (error) {
      const err = error as Error
      console.error('Error during password reset:', err)
      errorTitle.current = 'Error Resetting Password'
      errorDesc.current = err.message
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (
    provider: 'oauth_google' | 'oauth_apple' | 'oauth_github'
  ) => {
    setFormMessage('')
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: pathName,
      })
    } catch (error) {
      const err = error as Error
      console.error('Error during OAuth sign in:', err)
      errorTitle.current = 'Error during OAuth Sign In'
      errorDesc.current = err.message
      setIsError(true)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          resetState()
        }
      }}
    >
      {isError && (
        <ErrorDialog
          open={isError}
          onClose={() => setIsError(false)}
          description={errorDesc.current}
          title={errorTitle.current}
        />
      )}
      <DialogTrigger asChild>
        <Button variant="outline">Sign {isSignUp ? 'up' : 'in'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto">
            {theme === 'dark' ? (
              <Icons.logoDark priority={true} className="mx-auto w-auto" />
            ) : (
              <Icons.logo priority={true} className="mx-auto w-auto" />
            )}
          </div>
          <DialogTitle className="text-2xl font-semibold text-center">
            {resetStep === 'initial'
              ? isSignUp
                ? 'Create an account'
                : 'Sign in to your account'
              : 'Reset your password'}
          </DialogTitle>
        </DialogHeader>
        {resetStep === 'initial' && (
          <>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {!isSignUp && (
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-primary hover:underline justify-self-end"
                  onClick={() => handleForgotPassword()}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Signing up...' : 'Signing in...'}
                  </>
                ) : isSignUp ? (
                  'Sign up'
                ) : (
                  'Sign in'
                )}
              </Button>
              {formMessage && (
                <p className="text-red-500 text-sm">{formMessage}</p>
              )}
            </form>
            <Button
              variant="link"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Button>
            <Separator />
            <div className="grid gap-4 py-4">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('oauth_google')}
                disabled={isLoading}
              >
                <Icons.google className="mr-2 size-4" />
                {isSignUp ? 'Sign up' : 'Sign in'} with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('oauth_apple')}
                disabled={isLoading}
              >
                <Icons.apple className="mr-4 size-4" />
                {isSignUp ? 'Sign up' : 'Sign in'} with Apple
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('oauth_github')}
                disabled={isLoading}
              >
                <Icons.gitHub className="mr-2 size-4" />
                {isSignUp ? 'Sign up' : 'Sign in'} with GitHub
              </Button>
            </div>
          </>
        )}
        {resetStep === 'reset' && (
          <form onSubmit={handleResetPassword} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resetCode">Reset Code</Label>
              <Input
                id="resetCode"
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {formMessage && (
              <p className="text-red-500 text-sm mt-2">{formMessage}</p>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary hover:underline justify-self-start"
              onClick={() => setResetStep('initial')}
              disabled={isLoading}
            >
              Back to {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
        )}
        <div id="clerk-captcha" />
      </DialogContent>
    </Dialog>
  )
}

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
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { OAuthStrategy } from '@clerk/types'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const {
    signIn,
    isLoaded: isSignInLoaded,
    setActive: setActiveSignIn,
  } = useSignIn()
  const {
    signUp,
    isLoaded: isSignUpLoaded,
    setActive: setActiveSignUp,
  } = useSignUp()
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
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const router = useRouter()
  const pathName = usePathname()

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
    setVerificationCode('')
    setShowVerificationInput(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp.create({
          emailAddress: email,
          password,
        })

        // Send the user an email with the verification code
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        })

        setShowVerificationInput(true)
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        })

        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId })
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
      errorTitle.current = `Error ${isSignUp ? 'Signing Up' : 'Signing In'}`
      errorDesc.current = err.message
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId })
        setOpen(false)
        router.push(pathName)
        toast({
          title: 'Account Verified',
          description: 'Your account has been verified successfully.',
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(result, null, 2))
        throw new Error('Verification failed')
      }
    } catch (error) {
      const err = error as Error
      console.error('Error during verification:', err)
      console.error(JSON.stringify(error, null, 2))
      errorTitle.current = 'Error Verifying Email'
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
        await setActiveSignIn({ session: result.createdSessionId })
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

  const signInWith = async (strategy: OAuthStrategy) => {
    setFormMessage('')
    try {
      await signIn.authenticateWithRedirect({
        strategy,
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

  async function handleOAuthSignIn(strategy: OAuthStrategy) {
    if (!signIn || !signUp) return null

    // If the user has an account in your application, but does not yet
    // have an OAuth account connected to it, you can transfer the OAuth
    // account to the existing user account.
    const userExistsButNeedsToSignIn =
      signUp.verifications.externalAccount.status === 'transferable' &&
      signUp.verifications.externalAccount.error?.code ===
        'external_account_exists'

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true })

      if (res.status === 'complete') {
        await setActiveSignIn({
          session: res.createdSessionId,
        })
      }
    }

    // If the user has an OAuth account but does not yet
    // have an account in your app, you can create an account
    // for them using the OAuth information.
    const userNeedsToBeCreated =
      signIn.firstFactorVerification.status === 'transferable'

    if (userNeedsToBeCreated) {
      const res = await signUp.create({
        transfer: true,
      })

      if (res.status === 'complete') {
        await setActiveSignUp({
          session: res.createdSessionId,
        })
      }
    } else {
      // If the user has an account in your application
      // and has an OAuth account connected to it, you can sign them in.
      signInWith(strategy)
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
                ? showVerificationInput
                  ? 'Verify Your Email'
                  : 'Create an account'
                : 'Sign in to your account'
              : 'Reset your password'}
          </DialogTitle>
        </DialogHeader>
        {resetStep === 'initial' && !showVerificationInput && (
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
        {resetStep === 'initial' && showVerificationInput && (
          <form onSubmit={handleVerificationSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
            {formMessage && (
              <p className="text-red-500 text-sm">{formMessage}</p>
            )}
          </form>
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

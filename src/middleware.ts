import { redirectAllPagesToComingSoon } from '@/lib/flags'
import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/recaptcha(.*)',
  '/api/webhooks/resend(.*)',
  '/consulting(.*)',
  '/consulting/new(.*)',
  '/job/new(.*)',
  '/jobs(.*)',
  '/soon(.*)',
  '/privacy(.*)',
  '/contact(.*)',
  '/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // get feature flag and redirect if enabled and no the soon page
  const goToSoon = await redirectAllPagesToComingSoon()
  if (
    goToSoon &&
    !request.nextUrl.pathname.startsWith('/soon') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.rewrite(new URL('/soon', request.url))
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}

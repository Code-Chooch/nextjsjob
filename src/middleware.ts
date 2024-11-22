import { NextResponse, type NextRequest } from 'next/server'
import { redirectAllPagesToComingSoon } from '@/lib/flags'

export async function middleware(request: NextRequest) {
  // Get redirect all feature flag
  const redirectAll = await redirectAllPagesToComingSoon()

  // Redirect if true
  if (redirectAll) {
    const nextUrl = new URL('/soon', request.url)
    return NextResponse.rewrite(nextUrl)
  }

  return NextResponse.next()
}

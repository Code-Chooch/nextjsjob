import { redirectAllPagesToComingSoon } from '@/lib/flags'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     *      * Match all request paths except for the ones starting with:
     *           * - api (API routes)
     *                * - _next/static (static files)
     *                     * - _next/image (image optimization files)
     *                          * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     *                               */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const goToSoon = await redirectAllPagesToComingSoon()

  if (goToSoon) {
    if (!request.nextUrl.pathname.startsWith('/soon')) {
      return NextResponse.rewrite(new URL('/soon', request.url))
    }
  }
}

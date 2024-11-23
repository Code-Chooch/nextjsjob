import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>{children}</NuqsAdapter>
    </ThemeProvider>
  )
}

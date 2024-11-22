import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </ThemeProvider>
  )
}

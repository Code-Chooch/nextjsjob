'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStatsProps {
  stats: {
    employers: number
    developers: number
  }
}

export function NotifyUserStats({ stats }: UserStatsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSendEmails = async () => {
    setIsLoading(true)
    try {
    } catch (error) {
      const err = error as Error
      console.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.developers}</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center">
        <Button onClick={handleSendEmails} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Launch Emails to All Users'}
        </Button>
      </div>
    </div>
  )
}

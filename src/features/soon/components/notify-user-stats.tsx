'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sendNotifyLiveEmails } from '@/features/soon/actions/action-send-notify-live-emails'
import { useAction } from 'next-safe-action/hooks'
import { usePathname } from 'next/navigation'
import { ErrorDialog } from '@/components/ui/error-dialog'
import { useToast } from '@/hooks/use-toast'

interface UserStatsProps {
  stats: {
    employersNotNotified: number
    employersNotified: number
    developersNotNotified: number
    developersNotified: number
  }
}

export function NotifyUserStats({ stats }: UserStatsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const revalidationPath = usePathname()
  const { toast } = useToast()
  const errorDesc = useRef('')
  const errorTitle = useRef('')

  const { execute } = useAction(sendNotifyLiveEmails, {
    onExecute: () => {
      setIsLoading(true)
    },
    onSettled: ({ result }) => {
      setIsLoading(false)
      const { data } = result
      if (data?.success) {
        toast({ title: 'Success', description: data?.message })
      }
      if (data === undefined || data.success === false) {
        errorDesc.current = data!.message
        errorTitle.current = 'Error Sending Launch Notification Emails'
        setShowError(true)
      }
    },
  })

  const handleSendEmails = async () => {
    execute({ revalidationPath })
  }

  return (
    <div className="gap-4 flex flex-col">
      {showError && (
        <ErrorDialog
          open={showError}
          title={errorTitle.current}
          description={errorDesc.current}
          onClose={() => setShowError(false)}
        />
      )}
      <div className="gap-4 flex flex-col">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Employers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`${stats.employersNotified}/${stats.developersNotNotified}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Developers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`${stats.developersNotified}/${stats.developersNotNotified}`}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center">
        <Button onClick={handleSendEmails} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Unsent Launch Emails'}
        </Button>
      </div>
    </div>
  )
}

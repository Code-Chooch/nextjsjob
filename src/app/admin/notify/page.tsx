import { db } from '@/db/db'
import { notifyTable } from '@/db/schema'
import { NotifyUserStats } from '@/features/soon/components/notify-user-stats'
import { NotifyUserType } from '@/features/soon/types'
import { Suspense } from 'react'
import { isUserAdmin } from '@/lib/clerk'
import { redirect } from 'next/navigation'

export default async function Page() {
  if (!isUserAdmin) {
    redirect('/')
  }

  const userData = await db
    .select({
      email: notifyTable.email,
      userType: notifyTable.userType,
      notifiedAt: notifyTable.notifiedAt,
    })
    .from(notifyTable)

  const stats = {
    employersNotNotified: userData.filter(
      (u) =>
        (u.userType as NotifyUserType) === 'employer' && u.notifiedAt === null
    ).length,
    employersNotified: userData.filter(
      (u) =>
        (u.userType as NotifyUserType) === 'employer' && u.notifiedAt !== null
    ).length,
    developersNotNotified: userData.filter(
      (u) =>
        (u.userType as NotifyUserType) === 'developer' && u.notifiedAt === null
    ).length,
    developersNotified: userData.filter(
      (u) =>
        (u.userType as NotifyUserType) === 'developer' && u.notifiedAt !== null
    ).length,
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Go Live Notifications Sent</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <NotifyUserStats stats={stats} />
      </Suspense>
    </div>
  )
}

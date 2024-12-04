import { db } from '@/db/db'
import { notifyTable } from '@/db/schema'
import { NotifyUserStats } from '@/features/soon/components/notify-user-stats'
import { NotifyUserType } from '@/features/soon/types'
import { Suspense } from 'react'

export default async function Page() {
  const userData = await db
    .select({ email: notifyTable.email, userType: notifyTable.userType })
    .from(notifyTable)

  const stats = {
    employers: userData.filter(
      (u) => (u.userType as NotifyUserType) === 'employer'
    ).length,
    developers: userData.filter(
      (u) => (u.userType as NotifyUserType) === 'developer'
    ).length,
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Go Live Notification Requests</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <NotifyUserStats stats={stats} />
      </Suspense>
    </div>
  )
}

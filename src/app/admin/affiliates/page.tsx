import { isUserAdmin } from '@/lib/clerk'
import { redirect } from 'next/navigation'

export default function Page() {
  if (!isUserAdmin) {
    redirect('/')
  }
  return <h1>Admin Affiliates Page</h1>
}

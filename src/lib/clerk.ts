import { auth, clerkClient } from '@clerk/nextjs/server'

export async function isUserAdmin() {
  const { userId } = await auth()
  const client = await clerkClient()
  const { privateMetadata } = await client.users.getUser(userId!)
  const isAdmin = privateMetadata as { isAdmin: boolean | undefined }

  return isAdmin ? true : false
}

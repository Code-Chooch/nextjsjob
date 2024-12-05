import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
      <SignUp />
    </main>
  )
}

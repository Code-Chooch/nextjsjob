import { NotifyMeForm } from '@/features/soon/components/notify-me-form'

export default function Page() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
      <h2 className="text-4xl font-bold mb-4 mt-4">
        The NextJS Job Listing Website
      </h2>
      <p className="text-xl mb-8 max-w-2xl">
        Connecting Next.js developers with exciting opportunities. Be the first
        to know when we launch!
      </p>
      <NotifyMeForm />
    </main>
  )
}

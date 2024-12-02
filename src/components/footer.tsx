export function Footer() {
  return (
    <footer className="p-4 border-t">
      <div className="container mx-auto text-center text-sm text-gray-500">
        © {new Date().getFullYear()} NextJS Job. All rights reserved.
      </div>
    </footer>
  )
}

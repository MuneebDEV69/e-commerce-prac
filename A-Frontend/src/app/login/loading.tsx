/** Instant login-card skeleton shown during navigation to /login. */
export default function LoginLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-offwhite px-4 py-16">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm p-8 sm:p-10 animate-pulse">
        <p className="text-center text-sm tracking-wider text-gray-400 mb-6">Login page is loading…</p>
        <div className="h-6 w-40 bg-gray-200 rounded mx-auto" />
        <div className="h-3 w-32 bg-gray-200 rounded mx-auto mt-3 mb-8" />
        <div className="space-y-4">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-11 w-full bg-gray-200 rounded mt-2" />
        </div>
      </div>
    </div>
  )
}

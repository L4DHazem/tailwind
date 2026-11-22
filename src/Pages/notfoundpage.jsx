import { Link } from 'react-router-dom'

export default function Notfoundpage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 p-6 text-center bg-gray-100 dark:bg-neutral-950">
      <p className="text-sm font-medium uppercase tracking-widest text-amber-600 dark:text-amber-300">
        Error
      </p>

      <h1 className="text-7xl font-bold text-gray-900 dark:text-white sm:text-8xl">
        404
      </h1>

      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Page not found
      </h2>

      <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
        The page you are looking for does not exist, was moved, or the URL is incorrect.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

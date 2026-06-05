export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6F2] p-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">404 error</p>
      <h1 className="mt-3 text-4xl font-display font-light text-slate-950">Page not found</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600 max-w-sm">
        The gallery album or page you are looking for does not exist, or has been moved by the administrator.
      </p>
      <a href="/" className="mt-8 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50">
        Return home
      </a>
    </div>
  )
}

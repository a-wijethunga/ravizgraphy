import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | RavizGraphy',
  description: 'Secure admin dashboard for managing gallery, content, and projects.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F6F2] text-slate-800 selection:bg-rose-500/10 selection:text-rose-900 antialiased font-sans">
      {children}
    </div>
  )
}

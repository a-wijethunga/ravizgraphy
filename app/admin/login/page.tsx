'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { supabase } from '../../../src/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be 8 characters or more'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    // Check if the user is already authenticated
    const sessionStr = localStorage.getItem('admin_session')
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr)
        if (session && session.authenticated && session.role === 'admin') {
          router.replace('/admin/dashboard')
        }
      } catch (e) {
        localStorage.removeItem('admin_session')
      }
    }
  }, [router])

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setLoading(false)
      toast.error(error.message || 'Invalid email or password')
      return
    }

    // Save session in localStorage
    localStorage.setItem(
      'admin_session',
      JSON.stringify({ authenticated: true, role: 'admin', user: data.user })
    )
    // Set the session cookie so the middleware and server-side routes recognize it
    document.cookie = 'admin_authenticated=true; path=/; max-age=86400; SameSite=Lax'
    if (data.session?.access_token) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`
    }
    
    setLoading(false)
    toast.success('Welcome back')
    router.push('/admin/dashboard')
  }

  const inputClasses =
    'w-full rounded-[2rem] border border-slate-200 bg-white/95 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-rose-100'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.09),_transparent_25%),#F8F6F2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/90 p-10 shadow-[0_35px_120px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Admin access</p>
          <h1 className="mt-4 text-4xl font-display font-semibold tracking-tight text-slate-950">Luxury dashboard sign in</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Sign in to manage your gallery, uploads, and premium brand content with secure local authentication.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input type="email" {...register('email')} className={inputClasses} aria-invalid={errors.email ? 'true' : 'false'} />
          </label>
          {errors.email && <p className="text-sm text-rose-500">{errors.email.message}</p>}

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input type="password" {...register('password')} className={inputClasses} aria-invalid={errors.password ? 'true' : 'false'} />
          </label>
          {errors.password && <p className="text-sm text-rose-500">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="button-cinematic w-full justify-center bg-cream-100 text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Continue to dashboard'}
          </button>
        </form>

        <div className="mt-10 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-600 shadow-sm shadow-slate-200/40">
          <p className="font-medium text-slate-900">RavizGraphy Admin</p>
          <p className="mt-2">Secure panel for gallery uploads, brand management and luxury content updates.</p>
        </div>
      </div>
    </main>
  )
}

console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("KEY EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

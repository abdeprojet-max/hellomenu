'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HmLogo } from '@/components/hm-logo'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : error.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="hm-auth-bg">
      <div className="hm-card" style={{ width: 400, padding: '36px 36px 32px', boxShadow: '0 20px 60px rgba(28,25,23,.10),0 4px 16px rgba(28,25,23,.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <HmLogo href="/" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1c1917', margin: '16px 0 6px', letterSpacing: -0.4 }}>
            Bon retour !
          </h2>
          <p style={{ fontSize: 14, color: '#78716c', margin: 0 }}>
            Connectez-vous à votre compte HelloMenu
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="hm-label">Adresse e-mail</label>
            <input
              className="hm-input"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label className="hm-label" style={{ marginBottom: 0 }}>Mot de passe</label>
              <a href="#" style={{ fontSize: 12.5, color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>Oublié ?</a>
            </div>
            <input
              className="hm-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="hm-btn hm-btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px 0', fontSize: 15, borderRadius: 11, marginTop: 4, fontWeight: 600, justifyContent: 'center' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <hr className="hm-divider" style={{ flex: 1 }} />
          <span style={{ fontSize: 12.5, color: '#a8a29e', flexShrink: 0 }}>ou continuer avec</span>
          <hr className="hm-divider" style={{ flex: 1 }} />
        </div>

        <button className="hm-btn hm-btn-outline" style={{ width: '100%', padding: '11px 0', fontSize: 14, borderRadius: 11, justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#78716c', margin: '24px 0 0' }}>
          Pas encore de compte ?{' '}
          <Link href="/auth/register" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HmLogo } from '@/components/hm-logo'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Compte créé avec succès !')
    router.refresh()
    router.push('/onboarding')
  }

  return (
    <div className="hm-auth-bg">
      <div className="hm-card" style={{ width: 400, padding: '36px 36px 32px', boxShadow: '0 20px 60px rgba(28,25,23,.10),0 4px 16px rgba(28,25,23,.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <HmLogo href="/" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1c1917', margin: '16px 0 6px', letterSpacing: -0.4 }}>
            Créer votre compte
          </h2>
          <p style={{ fontSize: 14, color: '#78716c', margin: 0 }}>
            Gratuit · Sans carte bancaire
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="hm-label">Prénom</label>
            <input
              className="hm-input"
              type="text"
              autoComplete="given-name"
              placeholder="Votre prénom"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
            <label className="hm-label">Mot de passe</label>
            <input
              className="hm-input"
              type="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            className="hm-btn hm-btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px 0', fontSize: 15, borderRadius: 11, marginTop: 4, fontWeight: 600, justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            {loading ? 'Création…' : 'Créer mon compte gratuit'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12.5, color: '#a8a29e', margin: '16px 0 0', lineHeight: 1.6 }}>
          En vous inscrivant, vous acceptez nos{' '}
          <a href="#" style={{ color: '#16a34a', textDecoration: 'none' }}>CGU</a>
          {' '}et notre{' '}
          <a href="#" style={{ color: '#16a34a', textDecoration: 'none' }}>Politique de confidentialité</a>
        </p>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#78716c', margin: '16px 0 0' }}>
          Déjà un compte ?{' '}
          <Link href="/auth/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

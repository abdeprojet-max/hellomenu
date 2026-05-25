'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HmLogo } from '@/components/hm-logo'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp, Leaf, Zap } from 'lucide-react'
import type { DietaryPreference, Goal } from '@/lib/types'

const DIET_TYPES: { value: DietaryPreference; label: string }[] = [
  { value: 'equilibre', label: 'Équilibré' },
  { value: 'sain', label: 'Sain' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'sportif', label: 'Sportif' },
  { value: 'gourmand', label: 'Gourmand' },
]

const GOALS: { value: Goal; label: string; desc: string; Icon: React.ElementType }[] = [
  { value: 'maintien', label: 'Maintien', desc: 'Garder mon poids actuel', Icon: TrendingUp },
  { value: 'perte_poids', label: 'Perte de poids', desc: 'Manger léger et sain', Icon: Leaf },
  { value: 'prise_masse', label: 'Prise de masse', desc: 'Développer ma musculature', Icon: Zap },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [nbPersons, setNbPersons] = useState(2)
  const [diet, setDiet] = useState<DietaryPreference>('equilibre')
  const [goal, setGoal] = useState<Goal>('maintien')
  const [loading, setLoading] = useState(false)

  const totalSteps = 3

  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      nb_persons: nbPersons,
      dietary_preference: diet,
      goal,
      onboarding_done: true,
    })

    if (error) { toast.error('Erreur lors de la sauvegarde'); setLoading(false); return }

    toast.success('Profil configuré ! Bienvenue sur HelloMenu.')
    router.push('/dashboard')
  }

  return (
    <div className="hm-auth-bg">
      <div className="hm-card" style={{ width: 460, padding: '36px 36px 32px', boxShadow: '0 20px 60px rgba(28,25,23,.10),0 4px 16px rgba(28,25,23,.06)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <HmLogo size="sm" />
          <span style={{ fontSize: 13, color: '#a8a29e', fontWeight: 500 }}>Étape {step} sur {totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: '#e7e5e4', borderRadius: 3, margin: '16px 0 28px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: '#16a34a', width: `${(step / totalSteps) * 100}%`, transition: 'width .35s ease' }} />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#1c1917', margin: '0 0 6px', letterSpacing: -0.4 }}>
              Faisons connaissance 👋
            </h2>
            <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 24px' }}>
              Quelques informations pour personnaliser vos menus.
            </p>
            <div style={{ marginBottom: 24 }}>
              <label className="hm-label">Comment vous appelez-vous ?</label>
              <input
                className="hm-input"
                type="text"
                autoComplete="given-name"
                placeholder="Votre prénom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="hm-label" style={{ marginBottom: 12 }}>Combien de personnes à nourrir ?</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button key={n} className={`hm-circle-btn${n === nbPersons ? ' active' : ''}`} onClick={() => setNbPersons(n)}>{n}</button>
                ))}
                <button className={`hm-circle-btn${nbPersons > 6 ? ' active' : ''}`} onClick={() => setNbPersons(7)}>6+</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#1c1917', margin: '0 0 6px', letterSpacing: -0.4 }}>
              Quel est votre régime alimentaire ?
            </h2>
            <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 24px' }}>
              Choisissez le profil qui correspond le mieux à vos habitudes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {DIET_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setDiet(value)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${diet === value ? '#16a34a' : '#e7e5e4'}`,
                    background: diet === value ? '#f0fdf4' : '#fff',
                    color: diet === value ? '#15803d' : '#44403c',
                    fontFamily: 'inherit',
                    fontSize: 14.5,
                    fontWeight: diet === value ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all .12s',
                    textAlign: 'left',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#1c1917', margin: '0 0 6px', letterSpacing: -0.4 }}>
              Quel est votre objectif ?
            </h2>
            <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 24px' }}>
              Cela nous aide à adapter vos apports nutritionnels.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value)}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 13,
                    border: `2px solid ${goal === value ? '#16a34a' : '#e7e5e4'}`,
                    background: goal === value ? '#f0fdf4' : '#fff',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'all .12s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: goal === value ? '#dcfce7' : '#f5f4ec',
                    color: goal === value ? '#16a34a' : '#78716c',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={18} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 15, color: goal === value ? '#15803d' : '#1c1917' }}>{label}</span>
                    <span style={{ display: 'block', fontSize: 13, color: '#78716c', marginTop: 2 }}>{desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 1 && (
            <button className="hm-btn hm-btn-outline" style={{ flex: 1, padding: '12px 0', borderRadius: 11, justifyContent: 'center' }} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={15} /> Retour
            </button>
          )}
          <button
            className="hm-btn hm-btn-primary"
            style={{ flex: 1, padding: '12px 0', fontSize: 15.5, borderRadius: 11, fontWeight: 600, justifyContent: 'center' }}
            onClick={step < totalSteps ? () => setStep((s) => s + 1) : handleFinish}
            disabled={loading}
          >
            {step < totalSteps ? (
              <>Continuer <ArrowRight size={15} /></>
            ) : loading ? 'Sauvegarde…' : (
              <><Sparkles size={16} /> Commencer !</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

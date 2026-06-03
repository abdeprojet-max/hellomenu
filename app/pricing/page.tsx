'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { HmLogo } from '@/components/hm-logo'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: '',
    description: 'Pour découvrir HelloMenu',
    popular: false,
    features: [
      '5 générations de menus par mois',
      '1 menu sauvegardé',
      'Toutes les options de régime',
      'Édition des menus générés',
      'Valeurs nutritionnelles',
    ],
    cta: 'Commencer gratuitement',
    href: '/auth/register',
    plan: null as string | null,
  },
  {
    id: 'medium',
    name: 'Medium',
    price: '9,99€',
    period: '/mois',
    description: 'Pour une planification régulière',
    popular: true,
    features: [
      '15 générations de menus par mois',
      '20 menus sauvegardés',
      'Toutes les options de régime',
      'Édition des menus générés',
      'Valeurs nutritionnelles',
      'Liste de courses imprimable',
      'Partage de menus (5 partages)',
    ],
    cta: 'Choisir Medium',
    href: null,
    plan: 'medium',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '19,99€',
    period: '/mois',
    description: 'Pour les familles et les passionnés',
    popular: false,
    features: [
      '30 générations par mois',
      'Menus sauvegardés illimités',
      'Génération mensuelle (4 semaines)',
      'Recettes détaillées pour chaque repas',
      'Partage illimité jour par jour',
      'Partage du menu complet',
      'Accès en avant-première aux nouveautés',
    ],
    cta: 'Choisir Premium',
    href: null,
    plan: 'premium',
  },
]

function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled') === 'true'

  async function handleSubscribe(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (res.status === 401) { window.location.href = '/auth/login'; return }
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Erreur lors de la création de la session de paiement')
    } catch {
      toast.error('Erreur lors de la connexion au service de paiement')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf5' }}>
      {/* Header */}
      <header className="hm-marketing-header">
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HmLogo size="sm" />
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/auth/login">
              <button className="hm-btn hm-btn-outline hm-btn-sm">Connexion</button>
            </Link>
            <Link href="/auth/register">
              <button className="hm-btn hm-btn-primary hm-btn-sm">Essai gratuit</button>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 28px 80px' }}>
        {canceled && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: '14px 18px', marginBottom: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#854d0e', margin: 0 }}>Paiement annulé — aucun montant n&apos;a été débité. Choisissez un plan quand vous êtes prêt.</p>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1c1917', margin: '0 0 12px', letterSpacing: -1 }}>
            Des tarifs simples et transparents
          </h1>
          <p style={{ fontSize: 16, color: '#78716c', margin: 0 }}>
            Commencez gratuitement, évoluez quand vous êtes prêt
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, alignItems: 'start' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="hm-card"
              style={{
                padding: '28px 28px 26px',
                border: plan.popular ? '2px solid #16a34a' : '1px solid #e7e5e4',
                position: 'relative',
                marginTop: plan.popular ? 0 : 0,
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: '#16a34a', color: '#fff',
                  fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 100,
                  whiteSpace: 'nowrap', letterSpacing: .3,
                }}>
                  Populaire
                </div>
              )}

              <div style={{ marginBottom: 22 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1c1917', margin: '0 0 4px' }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: '#78716c', margin: '0 0 16px' }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#1c1917', letterSpacing: -.8 }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 14, color: '#78716c' }}>{plan.period}</span>}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: '#44403c', lineHeight: 1.4 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={11} color="#16a34a" strokeWidth={2.5} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link href={plan.href}>
                  <button className="hm-btn hm-btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '11px 0', borderRadius: 11 }}>
                    {plan.cta}
                  </button>
                </Link>
              ) : (
                <button
                  className={`hm-btn ${plan.popular ? 'hm-btn-primary' : 'hm-btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'center', padding: '11px 0', borderRadius: 11 }}
                  onClick={() => handleSubscribe(plan.plan!)}
                  disabled={loading === plan.plan}
                >
                  {loading === plan.plan ? 'Redirection…' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Crown, Sparkles, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { DIET_LABELS, GOAL_LABELS, PLAN_LIMITS, type DietaryPreference, type Goal, type Profile } from '@/lib/types'

const DIET_OPTIONS: DietaryPreference[] = ['equilibre', 'sain', 'vegan', 'sportif', 'gourmand']
const GOAL_OPTIONS: Goal[] = ['maintien', 'perte_poids', 'prise_masse']

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [nbPersons, setNbPersons] = useState(2)
  const [diet, setDiet] = useState<DietaryPreference>('equilibre')
  const [goal, setGoal] = useState<Goal>('maintien')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data: Profile = await res.json()
        setProfile(data)
        setFullName(data.full_name ?? '')
        setNbPersons(data.nb_persons ?? 2)
        setDiet((data.dietary_preference as DietaryPreference) ?? 'equilibre')
        setGoal((data.goal as Goal) ?? 'maintien')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Erreur lors de l\'ouverture du portail')
    } catch { toast.error('Erreur de connexion') }
    finally { setPortalLoading(false) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, nb_persons: nbPersons, dietary_preference: diet, goal }),
    })
    if (res.ok) toast.success('Profil mis à jour !')
    else toast.error('Erreur lors de la mise à jour')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="hm-page-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <span style={{ color: '#a8a29e', fontSize: 14 }}>Chargement…</span>
      </div>
    )
  }
  if (!profile) return null

  const planType = profile.plan_type ?? 'free'
  const planLimits = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free
  const planLabel: Record<string, string> = { free: 'Gratuit', medium: 'Medium', premium: 'Premium ✦' }
  const planBadgeClass: Record<string, string> = {
    free: 'hm-badge',
    medium: 'hm-badge hm-badge-blue',
    premium: 'hm-badge hm-badge-blue',
  }

  return (
    <div className="hm-page-inner">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', margin: '0 0 4px', letterSpacing: -.5 }}>
          Mon profil
        </h1>
        <p style={{ fontSize: 14.5, color: '#78716c', margin: 0 }}>
          Vos préférences alimentaires personnalisent vos menus
        </p>
      </div>

      {/* Subscription card */}
      <div className="hm-card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <Crown size={17} />
          </span>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Mon abonnement</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: planType === 'free' ? 14 : 0 }}>
          <span className={planBadgeClass[planType] ?? 'hm-badge'}>{planLabel[planType] ?? planType}</span>
          <span style={{ fontSize: 13.5, color: '#78716c' }}>
            {planLimits.generations === Infinity ? 'Générations illimitées' : `${planLimits.generations} génération${planLimits.generations > 1 ? 's' : ''}/mois`}
            {' · '}
            {planLimits.savedMenus === Infinity ? 'Menus illimités' : `${planLimits.savedMenus} menus sauvegardés`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {planType === 'free' ? (
            <Link href="/pricing">
              <button className="hm-btn hm-btn-primary hm-btn-sm">
                <Sparkles size={13} /> Passer à Premium
              </button>
            </Link>
          ) : (
            <>
              <Link href="/pricing">
                <button className="hm-btn hm-btn-outline hm-btn-sm">
                  <Sparkles size={13} /> Changer de plan
                </button>
              </Link>
              <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={handlePortal} disabled={portalLoading}>
                <Settings size={13} /> {portalLoading ? 'Redirection…' : 'Gérer l\'abonnement'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preferences card */}
      <div className="hm-card" style={{ padding: '22px 24px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: '0 0 4px' }}>Mes préférences</h2>
        <p style={{ fontSize: 13, color: '#78716c', margin: '0 0 22px' }}>
          Ces informations pré-remplissent automatiquement le générateur de menus
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="hm-label">Prénom</label>
            <input
              className="hm-input"
              type="text"
              autoComplete="given-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre prénom"
            />
          </div>

          <div>
            <label className="hm-label">Nombre de personnes habituel</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`hm-circle-btn${nbPersons === n ? ' active' : ''}`}
                  onClick={() => setNbPersons(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className={`hm-circle-btn${nbPersons > 6 ? ' active' : ''}`}
                onClick={() => setNbPersons(7)}
              >
                6+
              </button>
            </div>
          </div>

          <div>
            <label className="hm-label">Type d&apos;alimentation préféré</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIET_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`hm-pill${d === diet ? ' active' : ''}`}
                  onClick={() => setDiet(d)}
                >
                  {DIET_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="hm-label">Objectif nutritionnel</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`hm-pill${g === goal ? ' active' : ''}`}
                  onClick={() => setGoal(g)}
                >
                  {GOAL_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button type="submit" className="hm-btn hm-btn-primary" disabled={saving}
              style={{ padding: '11px 24px', fontSize: 14.5, borderRadius: 11 }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

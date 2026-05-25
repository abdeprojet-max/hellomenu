'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, RefreshCw, Star, Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { PLAN_LIMITS, DIET_LABELS, GOAL_LABELS, DAYS_OF_WEEK, WEEK_KEYS, type DietaryPreference, type Goal, type Period, type WeekMenus, type Profile, type ShoppingList, type MealRating, type UserRatings } from '@/lib/types'
import { MenuCard } from '@/components/menu-card'
import { ShoppingListCard } from '@/components/shopping-list'
import { NutritionSummary } from '@/components/nutrition-summary'
import Link from 'next/link'
import { Share2 } from 'lucide-react'

const DIET_OPTIONS: DietaryPreference[] = ['equilibre', 'sain', 'vegan', 'sportif', 'gourmand']
const GOAL_OPTIONS: Goal[] = ['maintien', 'perte_poids', 'prise_masse']

export default function GeneratePage() {
  const [period, setPeriod] = useState<Period>('semaine')
  const [nbPersons, setNbPersons] = useState(2)
  const [diet, setDiet] = useState<DietaryPreference>('equilibre')
  const [goal, setGoal] = useState<Goal>('maintien')
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedMeals, setGeneratedMeals] = useState<WeekMenus | null>(null)
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [menuTitle, setMenuTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMenuId, setSavedMenuId] = useState<string | null>(null)
  const [planType, setPlanType] = useState<'free' | 'medium' | 'premium'>('free')
  const [userRatings, setUserRatings] = useState<UserRatings>({})

  const allowMonthly = PLAN_LIMITS[planType].allowMonthly

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, ratingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        fetch('/api/ratings'),
      ])

      if (profile) {
        const p = profile as Profile
        if (p.dietary_preference) setDiet(p.dietary_preference as DietaryPreference)
        if (p.goal) setGoal(p.goal as Goal)
        if (p.nb_persons) setNbPersons(p.nb_persons)
        if (p.plan_type) setPlanType(p.plan_type as 'free' | 'medium' | 'premium')
      }
      if (ratingsRes.ok) setUserRatings(await ratingsRes.json())
    }
    loadData()
  }, [])

  async function handleGenerate() {
    setLoading(true)
    setGeneratedMeals(null)
    setShoppingList(null)
    setSavedMenuId(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, nb_persons: nbPersons, diet_type: diet, goal, free_text: freeText }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        if (data.upgrade) setTimeout(() => window.location.href = '/pricing', 2000)
        return
      }
      setGeneratedMeals(data.meals)
      setShoppingList(data.shopping_list ?? null)
      setMenuTitle(`Menu ${period === 'semaine' ? 'semaine' : 'mensuel'} — ${DIET_LABELS[diet]}`)
      toast.success('Menu généré avec succès !')
    } catch { toast.error('Erreur lors de la génération') }
    finally { setLoading(false) }
  }

  async function handleSave(isFavorite = false) {
    if (!generatedMeals) return
    setSaving(true)
    try {
      // Embed shopping list in meals under reserved key
      const mealsToSave = shoppingList
        ? { ...generatedMeals, _liste_courses: shoppingList }
        : generatedMeals
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: menuTitle, period, nb_persons: nbPersons, diet_type: diet, goal, meals: mealsToSave, is_favorite: isFavorite }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      if (data.id) setSavedMenuId(data.id)
      toast.success(isFavorite ? 'Menu sauvegardé en favori !' : 'Menu sauvegardé !')
    } catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  async function handleRate(mealName: string, rating: MealRating) {
    setUserRatings(prev => ({ ...prev, [mealName]: rating }))
    await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_name: mealName, rating }),
    })
  }

  function updateMeal(dayKey: string, mealTime: string, field: 'nom' | 'description', value: string) {
    if (!generatedMeals) return
    setGeneratedMeals({
      ...generatedMeals,
      [dayKey]: {
        ...generatedMeals[dayKey],
        [mealTime]: { ...generatedMeals[dayKey]?.[mealTime as keyof typeof generatedMeals[typeof dayKey]], [field]: value },
      },
    })
  }

  const displayDays = period === 'semaine'
    ? WEEK_KEYS.map((k, i) => ({ key: k, label: DAYS_OF_WEEK[i] }))
    : Array.from({ length: 28 }, (_, i) => ({ key: `jour_${i + 1}`, label: `Jour ${i + 1}` }))

  return (
    <div className="hm-page-inner">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', margin: '0 0 4px', letterSpacing: -.5 }}>
          Générer des menus
        </h1>
        <p style={{ fontSize: 14.5, color: '#78716c', margin: 0 }}>
          Personnalisez vos préférences et laissez l&apos;IA faire le reste.
        </p>
      </div>

      <div className="hm-card" style={{ padding: '26px 28px', marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1c1917', margin: '0 0 22px' }}>Vos préférences</h2>

        {/* Period toggle */}
        <div style={{ marginBottom: 20 }}>
          <label className="hm-label">Période</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="hm-segment">
              <button
                onClick={() => setPeriod('semaine')}
                className={`hm-segment-btn${period === 'semaine' ? ' active' : ''}`}
              >
                À la semaine
              </button>
              <button
                onClick={() => allowMonthly ? setPeriod('mois') : undefined}
                className={`hm-segment-btn${period === 'mois' ? ' active' : ''}${!allowMonthly ? '' : ''}`}
                style={!allowMonthly ? { opacity: .45, cursor: 'default' } : undefined}
                title={!allowMonthly ? 'Disponible en plan Premium' : undefined}
              >
                Au mois
              </button>
            </div>
            {!allowMonthly && (
              <Link href="/pricing">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#78716c', background: '#fef9c3', padding: '4px 10px', borderRadius: 100, cursor: 'pointer', textDecoration: 'none' }}>
                  <Lock size={11} /> Premium uniquement
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Persons */}
        <div style={{ marginBottom: 20 }}>
          <label className="hm-label">Nombre de personnes</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} className={`hm-circle-btn${n === nbPersons ? ' active' : ''}`} onClick={() => setNbPersons(n)}>{n}</button>
            ))}
            <button className={`hm-circle-btn${nbPersons > 6 ? ' active' : ''}`} onClick={() => setNbPersons(7)}>6+</button>
          </div>
        </div>

        {/* Diet */}
        <div style={{ marginBottom: 20 }}>
          <label className="hm-label">Type de régime</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DIET_OPTIONS.map((d) => (
              <button key={d} className={`hm-pill${d === diet ? ' active' : ''}`} onClick={() => setDiet(d)}>
                {DIET_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div style={{ marginBottom: 22 }}>
          <label className="hm-label">Objectif</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GOAL_OPTIONS.map((g) => (
              <button key={g} className={`hm-pill${g === goal ? ' active' : ''}`} onClick={() => setGoal(g)}>
                {GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        {/* Free text */}
        <div style={{ marginBottom: 24 }}>
          <label className="hm-label">
            Idées ou envies du moment{' '}
            <span style={{ color: '#a8a29e', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <textarea
            className="hm-textarea"
            placeholder="Ex: j'ai envie de pasta cette semaine, pas de poisson..."
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="hm-btn hm-btn-primary-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', flexShrink: 0 }} className="hm-spin" />
              Génération en cours…
            </>
          ) : (
            <><Sparkles size={18} /> Générer mes menus</>
          )}
        </button>
      </div>

      {/* Generated results */}
      {generatedMeals && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0 }}>Vos menus générés</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={handleGenerate} disabled={loading}>
                <RefreshCw size={13} /> Régénérer
              </button>
              <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => handleSave(true)} disabled={saving}>
                <Star size={13} style={{ color: '#f97316' }} /> Favori
              </button>
              <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => handleSave(false)} disabled={saving}>
                <Check size={13} strokeWidth={2.5} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
              {savedMenuId && (
                <Link href={`/menus/${savedMenuId}`}>
                  <button className="hm-btn hm-btn-outline hm-btn-sm">
                    <Share2 size={13} /> Voir & Partager
                  </button>
                </Link>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 22 }}>
            {displayDays.map(({ key, label }) =>
              generatedMeals[key] ? (
                <MenuCard key={key} dayLabel={label} dayKey={key} meals={generatedMeals[key]} onUpdate={updateMeal} onRate={handleRate} userRatings={userRatings} />
              ) : null
            )}
          </div>

          {shoppingList && Object.keys(shoppingList).length > 0 && (
            <ShoppingListCard shoppingList={shoppingList} period={period} nbPersons={nbPersons} />
          )}

          <NutritionSummary meals={generatedMeals} period={period} />
        </div>
      )}
    </div>
  )
}

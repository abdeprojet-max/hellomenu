'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { MenuCard } from '@/components/menu-card'
import { NutritionSummary } from '@/components/nutrition-summary'
import { ArrowLeft, Star, Save, Trash2, Share2, X, Link2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { DIET_LABELS, GOAL_LABELS, WEEK_KEYS, DAYS_OF_WEEK, PLAN_LIMITS, type Menu, type WeekMenus, type ShoppingList, type MealRating, type UserRatings } from '@/lib/types'
import { ShoppingListCard } from '@/components/shopping-list'
import { createClient } from '@/lib/supabase/client'

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [meals, setMeals] = useState<WeekMenus | null>(null)
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [userRatings, setUserRatings] = useState<UserRatings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [sharingDay, setSharingDay] = useState<string | null>(null)
  const [shareCount, setShareCount] = useState(0)
  const [planType, setPlanType] = useState<'free' | 'medium' | 'premium'>('free')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan_type').eq('id', user.id).single()
        if (profile?.plan_type) setPlanType(profile.plan_type as 'free' | 'medium' | 'premium')
      }

      const [menuRes, ratingsRes, sharesRes] = await Promise.all([
        fetch(`/api/menus/${id}`),
        fetch('/api/ratings'),
        fetch(`/api/menus/${id}/share`),
      ])
      if (!menuRes.ok) { router.push('/menus'); return }
      const data: Menu = await menuRes.json()
      setMenu(data)
      const raw = data.meals as WeekMenus & { _liste_courses?: ShoppingList }
      const { _liste_courses, ...cleanMeals } = raw
      setMeals(cleanMeals as WeekMenus)
      if (_liste_courses && Object.keys(_liste_courses).length > 0) setShoppingList(_liste_courses)
      if (ratingsRes.ok) setUserRatings(await ratingsRes.json())
      if (sharesRes.ok) {
        const shares = await sharesRes.json()
        setShareCount(Array.isArray(shares) ? shares.length : 0)
      }
      setLoading(false)
    }
    load()
  }, [id, router])

  function updateMeal(dayKey: string, mealTime: string, field: 'nom' | 'description', value: string) {
    if (!meals) return
    setMeals({
      ...meals,
      [dayKey]: {
        ...meals[dayKey],
        [mealTime]: { ...meals[dayKey]?.[mealTime as keyof typeof meals[typeof dayKey]], [field]: value },
      },
    })
  }

  async function handleSave() {
    if (!menu || !meals) return
    setSaving(true)
    const res = await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meals }),
    })
    if (res.ok) toast.success('Menu mis à jour !')
    else toast.error('Erreur lors de la sauvegarde')
    setSaving(false)
  }

  async function toggleFavorite() {
    if (!menu) return
    const res = await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !menu.is_favorite }),
    })
    if (res.ok) {
      setMenu({ ...menu, is_favorite: !menu.is_favorite })
      toast.success(menu.is_favorite ? 'Retiré des favoris' : 'Ajouté aux favoris')
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Menu supprimé'); router.push('/menus') }
  }

  async function handleRate(mealName: string, rating: MealRating) {
    setUserRatings(prev => ({ ...prev, [mealName]: rating }))
    await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_name: mealName, rating }),
    })
  }

  async function shareDay(dayKey: string | null) {
    const loadKey = dayKey ?? '__full__'
    setSharingDay(loadKey)
    try {
      const res = await fetch(`/api/menus/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_key: dayKey }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      const url = `${window.location.origin}/m/${data.token}`
      await navigator.clipboard.writeText(url)
      setShareCount(c => c + 1)
      toast.success('Lien copié dans le presse-papiers !')
    } catch { toast.error('Erreur lors du partage') }
    finally { setSharingDay(null) }
  }

  if (loading) {
    return (
      <div className="hm-page-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <span style={{ color: '#a8a29e', fontSize: 14 }}>Chargement…</span>
      </div>
    )
  }
  if (!menu || !meals) return null

  const shareLimit = PLAN_LIMITS[planType].shareLimit
  const canShare = shareLimit === Infinity || shareCount < shareLimit
  const shareLimitLabel = shareLimit === Infinity ? 'illimité' : `${shareCount}/${shareLimit} utilisé${shareCount > 1 ? 's' : ''}`

  const displayDays = menu.period === 'semaine'
    ? WEEK_KEYS.map((k, i) => ({ key: k, label: DAYS_OF_WEEK[i] }))
    : Array.from({ length: 28 }, (_, i) => ({ key: `jour_${i + 1}`, label: `Jour ${i + 1}` }))

  return (
    <div className="hm-page-inner">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <button
          className="hm-btn hm-btn-ghost hm-btn-sm"
          onClick={() => router.push('/menus')}
          style={{ marginBottom: 14, marginLeft: -6 }}
        >
          <ArrowLeft size={14} /> Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1c1917', margin: '0 0 10px', letterSpacing: -.4 }}>
              {menu.title}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span className="hm-badge hm-badge-green" style={{ textTransform: 'capitalize' }}>{menu.period}</span>
              <span className="hm-badge">{menu.nb_persons} pers.</span>
              {menu.diet_type && DIET_LABELS[menu.diet_type] && (
                <span className="hm-badge">{DIET_LABELS[menu.diet_type]}</span>
              )}
              {menu.goal && GOAL_LABELS[menu.goal] && (
                <span className="hm-badge">{GOAL_LABELS[menu.goal]}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              className="hm-btn hm-btn-outline hm-btn-sm"
              onClick={() => setShowSharePanel(p => !p)}
              style={showSharePanel ? { background: '#f0fdf4', borderColor: '#86efac' } : undefined}
            >
              <Share2 size={13} /> Partager
            </button>
            <button
              className="hm-btn hm-btn-outline hm-btn-sm"
              onClick={toggleFavorite}
              style={menu.is_favorite ? { color: '#f97316', borderColor: '#fdba74' } : undefined}
            >
              <Star size={13} fill={menu.is_favorite ? '#f97316' : 'none'} />
              {menu.is_favorite ? 'Favori' : 'Favoris'}
            </button>
            <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={handleSave} disabled={saving}>
              <Save size={13} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
            <button className="hm-btn hm-btn-danger-ghost hm-btn-sm" onClick={handleDelete} style={{ padding: '0 10px' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Share panel */}
      {showSharePanel && (
        <div className="hm-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>Partager un jour</span>
              <span style={{ fontSize: 12, color: '#a8a29e', marginLeft: 10 }}>{shareLimitLabel}</span>
            </div>
            <button className="hm-btn-icon" onClick={() => setShowSharePanel(false)}><X size={14} /></button>
          </div>

          {!canShare && (
            <p style={{ fontSize: 12.5, color: '#ef4444', marginBottom: 12 }}>
              Limite de partage atteinte pour votre plan. Passez à un plan supérieur pour continuer.
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {displayDays.filter(({ key }) => !!meals[key]).map(({ key, label }) => (
              <button
                key={key}
                className="hm-btn hm-btn-outline hm-btn-sm"
                onClick={() => shareDay(key)}
                disabled={!canShare || sharingDay !== null}
                style={{ fontSize: 12 }}
              >
                <Link2 size={11} />
                {sharingDay === key ? 'Copie…' : label}
              </button>
            ))}

            {planType === 'premium' && (
              <button
                className="hm-btn hm-btn-outline hm-btn-sm"
                onClick={() => shareDay(null)}
                disabled={sharingDay !== null}
                style={{ fontSize: 12, color: '#7c3aed', borderColor: '#c4b5fd' }}
              >
                <Globe size={11} />
                {sharingDay === '__full__' ? 'Copie…' : 'Menu complet'}
              </button>
            )}
          </div>

          <p style={{ fontSize: 11.5, color: '#a8a29e', marginTop: 12, margin: '12px 0 0' }}>
            Chaque clic génère un lien unique copié dans le presse-papiers. Le destinataire voit le jour sélectionné en lecture seule.
          </p>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#a8a29e', marginBottom: 18 }}>Cliquez sur un repas pour le modifier</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: shoppingList ? 22 : 0 }}>
        {displayDays.map(({ key, label }) =>
          meals[key] ? (
            <MenuCard key={key} dayLabel={label} dayKey={key} meals={meals[key]} onUpdate={updateMeal} onRate={handleRate} userRatings={userRatings} />
          ) : null
        )}
      </div>

      {shoppingList && (
        <ShoppingListCard shoppingList={shoppingList} period={menu.period} nbPersons={menu.nb_persons} />
      )}

      <NutritionSummary meals={meals} period={menu.period} />
    </div>
  )
}

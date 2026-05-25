import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HmLogo } from '@/components/hm-logo'
import { MenuCard } from '@/components/menu-card'
import { ShoppingListCard } from '@/components/shopping-list'
import { DIET_LABELS, GOAL_LABELS, WEEK_KEYS, DAYS_OF_WEEK, type Menu, type WeekMenus, type ShoppingList } from '@/lib/types'
import Link from 'next/link'

export default async function PublicMenuPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Look up share record
  const { data: share } = await supabase
    .from('menu_shares')
    .select('menu_id, day_key')
    .eq('token', token)
    .single()

  // Fallback: legacy share_token on menus table
  let menu: Menu | null = null
  let dayKey: string | null = null

  if (share) {
    dayKey = share.day_key
    const { data } = await supabase.from('menus').select('*').eq('id', share.menu_id).single() as { data: Menu | null }
    menu = data
  } else {
    const { data } = await supabase.from('menus').select('*').eq('share_token', token).single() as { data: Menu | null }
    menu = data
  }

  if (!menu) notFound()

  const raw = menu.meals as WeekMenus & { _liste_courses?: ShoppingList }
  const { _liste_courses, ...cleanMeals } = raw
  const shoppingList = _liste_courses && Object.keys(_liste_courses).length > 0 ? _liste_courses : null

  // Build display days depending on share scope
  const allDays = menu.period === 'semaine'
    ? WEEK_KEYS.map((k, i) => ({ key: k, label: DAYS_OF_WEEK[i] }))
    : Array.from({ length: 28 }, (_, i) => ({ key: `jour_${i + 1}`, label: `Jour ${i + 1}` }))

  const displayDays = dayKey
    ? allDays.filter(d => d.key === dayKey)
    : allDays

  const dayLabel = dayKey
    ? allDays.find(d => d.key === dayKey)?.label ?? dayKey
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf5' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e7e5e4', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <HmLogo href="/" size="sm" />
        <Link href="/auth/register">
          <button className="hm-btn hm-btn-primary hm-btn-sm">
            Créer mon compte gratuit
          </button>
        </Link>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 48px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1c1917', margin: '0 0 10px', letterSpacing: -.4 }}>
            {dayLabel ? `Menu du ${dayLabel}` : (menu.title || 'Menu partagé')}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {!dayLabel && <span className="hm-badge hm-badge-green" style={{ textTransform: 'capitalize' }}>{menu.period}</span>}
            {dayLabel && <span className="hm-badge hm-badge-green">{dayLabel}</span>}
            <span className="hm-badge">{menu.nb_persons} pers.</span>
            {menu.diet_type && DIET_LABELS[menu.diet_type] && <span className="hm-badge">{DIET_LABELS[menu.diet_type]}</span>}
            {menu.goal && GOAL_LABELS[menu.goal] && <span className="hm-badge">{GOAL_LABELS[menu.goal]}</span>}
          </div>
          <p style={{ fontSize: 13, color: '#a8a29e', margin: 0 }}>Menu en lecture seule · partagé via HelloMenu</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: displayDays.length === 1 ? '1fr' : 'repeat(2,1fr)', gap: 14, marginBottom: 22 }}>
          {displayDays.map(({ key, label }) =>
            (cleanMeals as WeekMenus)[key] ? (
              <MenuCard
                key={key}
                dayLabel={label}
                dayKey={key}
                meals={(cleanMeals as WeekMenus)[key]}
                readOnly
              />
            ) : null
          )}
        </div>

        {!dayKey && shoppingList && (
          <ShoppingListCard shoppingList={shoppingList} period={menu.period} nbPersons={menu.nb_persons} />
        )}

        <div className="hm-card" style={{ padding: '24px 28px', marginTop: 28, textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1c1917', margin: '0 0 6px' }}>
            Générez vos propres menus avec HelloMenu
          </p>
          <p style={{ fontSize: 13.5, color: '#78716c', margin: '0 0 18px' }}>
            IA · Liste de courses · Valeurs nutritionnelles · Gratuit pour commencer
          </p>
          <Link href="/auth/register">
            <button className="hm-btn hm-btn-primary">
              Essayer gratuitement
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

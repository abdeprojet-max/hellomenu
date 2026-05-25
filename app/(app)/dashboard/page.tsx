import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PLAN_LIMITS, type Profile, type Menu } from '@/lib/types'
import { Sparkles, Eye, Crown, Bookmark, ChefHat } from 'lucide-react'

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f97316' }}>
      <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 18.4l-6.2 3.2L7 14.7 2 9.8l6.9-1z"/>
    </svg>
  )
}

function StatCard({ icon, iconBg, label, value, badgeLabel, badgeColor, actionLabel, actionHref }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  badgeLabel?: string
  badgeColor?: string
  actionLabel?: React.ReactNode
  actionHref?: string
}) {
  return (
    <div className="hm-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
          {icon}
        </span>
        <span style={{ fontSize: 13, color: '#78716c', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: '#1c1917', letterSpacing: -.8 }}>{value}</span>
        {badgeLabel && actionHref && (
          <Link href={actionHref}>
            <span className={`hm-badge${badgeColor ? ` hm-badge-${badgeColor}` : ''}`} style={{ cursor: 'pointer', textDecoration: 'none' }}>{badgeLabel}</span>
          </Link>
        )}
        {badgeLabel && !actionHref && (
          <span className={`hm-badge${badgeColor ? ` hm-badge-${badgeColor}` : ''}`}>{badgeLabel}</span>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <button className="hm-btn hm-btn-green-soft hm-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single() as { data: Profile | null }
  if (profile && !profile.onboarding_done) redirect('/onboarding')

  const { data: recentMenus } = await supabase.from('menus').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3) as { data: Menu[] | null }

  const { data: genCount } = await supabase.from('generation_counts').select('count').eq('user_id', user.id).single()

  const planType = profile?.plan_type ?? 'free'
  const limits = PLAN_LIMITS[planType]
  const usedGen = genCount?.count ?? 0
  const genDisplay = limits.generations === Infinity ? 'Illimité' : `${usedGen} / ${limits.generations}`
  const savedDisplay = `${recentMenus?.length ?? 0}${limits.savedMenus !== Infinity ? ` / ${limits.savedMenus}` : ''}`

  const planBadge: Record<string, { label: string; color: string }> = {
    free: { label: 'Passer à Medium', color: 'orange' },
    medium: { label: 'Medium', color: 'blue' },
    premium: { label: 'Premium ✦', color: 'blue' },
  }

  return (
    <div className="hm-page-inner">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1c1917', margin: '0 0 4px', letterSpacing: -.6 }}>
          Bonjour{profile?.full_name ? `, ${profile.full_name}` : ''} 👋
        </h1>
        <p style={{ fontSize: 14.5, color: '#78716c', margin: 0 }}>Que mangeons-nous cette semaine ?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard
          icon={<Crown size={18} />}
          iconBg="#fef9c3"
          label="Plan actuel"
          value={planType.charAt(0).toUpperCase() + planType.slice(1)}
          badgeLabel={planType === 'free' ? planBadge.free.label : undefined}
          badgeColor={planType === 'free' ? planBadge.free.color : undefined}
          actionHref={planType === 'free' ? '/pricing' : undefined}
        />
        <StatCard
          icon={<Sparkles size={18} />}
          iconBg="#f0fdf4"
          label="Générations ce mois"
          value={genDisplay}
          actionLabel={<><Sparkles size={13} /> Générer</>}
          actionHref="/generate"
        />
        <StatCard
          icon={<Bookmark size={18} />}
          iconBg="#f0fdf4"
          label="Menus sauvegardés"
          value={savedDisplay}
          actionLabel={<><Eye size={13} /> Voir tout</>}
          actionHref="/menus"
        />
      </div>

      <div className="hm-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1c1917', margin: 0 }}>Menus récents</h2>
          <Link href="/menus">
            <button className="hm-btn hm-btn-ghost hm-btn-sm" style={{ fontSize: 13 }}>
              Voir tout →
            </button>
          </Link>
        </div>

        {recentMenus && recentMenus.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentMenus.map((menu, i) => (
              <Link key={menu.id} href={`/menus/${menu.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
                  borderTop: i > 0 ? '1px solid #f0efeb' : 'none',
                  cursor: 'pointer',
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChefHat size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: '#1c1917' }}>{menu.title || 'Menu sans titre'}</span>
                      {menu.is_favorite && <StarIcon />}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#78716c', marginTop: 2 }}>
                      {menu.period} · {menu.nb_persons} pers. · {new Date(menu.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <button className="hm-btn hm-btn-outline hm-btn-sm" style={{ fontSize: 12.5 }}>Voir</button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f5f4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#a8a29e' }}>
              <ChefHat size={28} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#44403c', margin: '0 0 4px' }}>Aucun menu pour le moment</p>
            <p style={{ fontSize: 13.5, color: '#78716c', margin: '0 0 16px' }}>Générez votre premier menu et sauvegardez-le</p>
            <Link href="/generate">
              <button className="hm-btn hm-btn-primary hm-btn-sm">
                <Sparkles size={13} /> Générer mon premier menu
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

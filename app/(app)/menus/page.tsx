'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Star, Trash2, Eye, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { DIET_LABELS, GOAL_LABELS, type Menu } from '@/lib/types'

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMenus() }, [])

  async function fetchMenus() {
    const res = await fetch('/api/menus')
    if (res.ok) setMenus(await res.json())
    setLoading(false)
  }

  async function toggleFavorite(menu: Menu) {
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !menu.is_favorite }),
    })
    if (res.ok) {
      setMenus(menus.map((m) => m.id === menu.id ? { ...m, is_favorite: !m.is_favorite } : m))
      toast.success(menu.is_favorite ? 'Retiré des favoris' : 'Ajouté aux favoris')
    }
  }

  async function deleteMenu(id: string) {
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
    if (res.ok) { setMenus(menus.filter((m) => m.id !== id)); toast.success('Menu supprimé') }
  }

  const filtered = filter === 'favorites' ? menus.filter((m) => m.is_favorite) : menus
  const favCount = menus.filter((m) => m.is_favorite).length

  if (loading) {
    return (
      <div className="hm-page-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <span style={{ color: '#a8a29e', fontSize: 14 }}>Chargement…</span>
      </div>
    )
  }

  return (
    <div className="hm-page-inner">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', margin: '0 0 4px', letterSpacing: -.5 }}>
            Mes menus
          </h1>
          <p style={{ fontSize: 14.5, color: '#78716c', margin: 0 }}>
            {menus.length} menu{menus.length > 1 ? 's' : ''} sauvegardé{menus.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/generate">
          <button className="hm-btn hm-btn-primary hm-btn-sm">
            <Sparkles size={13} /> Nouveau menu
          </button>
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="hm-segment" style={{ display: 'inline-flex' }}>
          <button className={`hm-segment-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            Tous ({menus.length})
          </button>
          <button className={`hm-segment-btn${filter === 'favorites' ? ' active' : ''}`} onClick={() => setFilter('favorites')}>
            Favoris ({favCount})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f5f4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#a8a29e' }}>
            <ChefHat size={28} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#44403c', margin: '0 0 4px' }}>
            {filter === 'favorites' ? 'Aucun favori pour le moment' : 'Aucun menu sauvegardé'}
          </p>
          <p style={{ fontSize: 13.5, color: '#78716c', margin: '0 0 18px' }}>
            {filter === 'favorites'
              ? 'Marquez vos menus préférés avec une étoile'
              : 'Générez votre premier menu et sauvegardez-le'}
          </p>
          {filter === 'all' && (
            <Link href="/generate">
              <button className="hm-btn hm-btn-primary hm-btn-sm">
                <Sparkles size={13} /> Générer un menu
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {filtered.map((menu) => (
            <div key={menu.id} className="hm-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChefHat size={17} />
                  </div>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: '#1c1917', lineHeight: 1.3 }}>
                    {menu.title || 'Menu sans titre'}
                  </span>
                </div>
                {menu.is_favorite && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 18.4l-6.2 3.2L7 14.7 2 9.8l6.9-1z"/>
                  </svg>
                )}
              </div>

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

              <p style={{ fontSize: 12, color: '#a8a29e', margin: 0 }}>
                {new Date(menu.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
                <Link href={`/menus/${menu.id}`} style={{ flex: 1 }}>
                  <button className="hm-btn hm-btn-outline hm-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    <Eye size={13} /> Voir
                  </button>
                </Link>
                <button
                  className="hm-btn-icon"
                  onClick={() => toggleFavorite(menu)}
                  title={menu.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  style={{ color: menu.is_favorite ? '#f97316' : undefined }}
                >
                  <Star size={14} fill={menu.is_favorite ? '#f97316' : 'none'} />
                </button>
                <button
                  className="hm-btn hm-btn-danger-ghost hm-btn-sm"
                  onClick={() => deleteMenu(menu.id)}
                  title="Supprimer"
                  style={{ padding: '0 10px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HmLogo } from '@/components/hm-logo'
import { toast } from 'sonner'
import { LayoutDashboard, Sparkles, Bookmark, User, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Générer des menus', icon: Sparkles },
  { href: '/menus', label: 'Mes menus', icon: Bookmark },
  { href: '/profile', label: 'Mon profil', icon: User },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hm-sidebar">
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0efeb' }}>
        <HmLogo href="/dashboard" />
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard')
          return (
            <Link
              key={href}
              href={href}
              className={`hm-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid #f0efeb' }}>
        <button
          onClick={handleLogout}
          className="hm-nav-item"
          style={{ width: '100%', background: 'none', border: 'none', color: '#78716c', cursor: 'pointer' }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

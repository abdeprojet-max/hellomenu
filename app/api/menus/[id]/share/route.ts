import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data } = await supabase
    .from('menu_shares')
    .select('id, token, day_key, created_at')
    .eq('menu_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan_type').eq('id', user.id).single()
  const planType = (profile?.plan_type ?? 'free') as keyof typeof PLAN_LIMITS
  const limit = PLAN_LIMITS[planType].shareLimit

  // Ownership check
  const { data: menu } = await supabase.from('menus').select('id').eq('id', id).eq('user_id', user.id).single()
  if (!menu) return NextResponse.json({ error: 'Menu introuvable' }, { status: 404 })

  const { day_key } = await request.json() as { day_key: string | null }

  // Premium only for full-menu share
  if (!day_key && planType !== 'premium') {
    return NextResponse.json({ error: 'Le partage du menu complet est réservé au plan Premium.' }, { status: 403 })
  }

  // Check share count limit
  if (limit !== Infinity) {
    const { count } = await supabase
      .from('menu_shares')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (count !== null && count >= limit) {
      return NextResponse.json({
        error: `Limite de ${limit} partage${limit > 1 ? 's' : ''} atteinte pour votre plan.`,
        upgrade: true,
      }, { status: 403 })
    }
  }

  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const { data: share, error } = await supabase
    .from('menu_shares')
    .insert({ menu_id: id, user_id: user.id, token, day_key: day_key ?? null })
    .select('token, day_key')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(share)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { token } = await request.json() as { token: string }
  await supabase.from('menu_shares').delete().eq('token', token).eq('user_id', user.id).eq('menu_id', id)
  return NextResponse.json({ ok: true })
}

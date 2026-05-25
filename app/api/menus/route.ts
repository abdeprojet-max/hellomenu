import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan_type').eq('id', user.id).single()
  const planType = (profile?.plan_type ?? 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[planType]

  if (limits.savedMenus !== Infinity) {
    const { count } = await supabase.from('menus').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count !== null && count >= limits.savedMenus) {
      return NextResponse.json({
        error: `Limite de ${limits.savedMenus} menus sauvegardés atteinte. Passez à un plan supérieur.`,
        upgrade: true,
      }, { status: 403 })
    }
  }

  const body = await request.json()
  const { title, period, nb_persons, diet_type, goal, meals, is_favorite } = body

  const { data, error } = await supabase.from('menus').insert({
    user_id: user.id,
    title,
    period,
    nb_persons,
    diet_type,
    goal,
    meals,
    is_favorite: is_favorite ?? false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

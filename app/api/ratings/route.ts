import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data } = await supabase
    .from('meal_ratings')
    .select('meal_name, rating')
    .eq('user_id', user.id)

  const ratings: Record<string, string> = {}
  for (const row of data ?? []) ratings[row.meal_name] = row.rating

  return NextResponse.json(ratings)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { meal_name, rating } = await request.json()
  if (!meal_name || !['like', 'dislike'].includes(rating)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  await supabase.from('meal_ratings').upsert(
    { user_id: user.id, meal_name, rating },
    { onConflict: 'user_id,meal_name' }
  )

  return NextResponse.json({ ok: true })
}

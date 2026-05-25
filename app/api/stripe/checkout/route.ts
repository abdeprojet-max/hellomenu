import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string> = {
  medium: process.env.STRIPE_MEDIUM_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { plan } = await request.json() as { plan: 'medium' | 'premium' }

  if (!PRICE_IDS[plan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, full_name').eq('id', user.id).single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${appUrl}/dashboard?success=true`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    metadata: { supabase_user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}

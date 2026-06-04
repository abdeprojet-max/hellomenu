import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id
    const plan = session.metadata?.plan

    if (userId && plan) {
      await supabase.from('profiles').update({ plan_type: plan }).eq('id', userId)

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        plan,
        status: 'active',
        current_period_end: null,
      })
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const status = subscription.status
    const periodEndTimestamp = (subscription as unknown as { current_period_end: number }).current_period_end
    const periodEnd = periodEndTimestamp ? new Date(periodEndTimestamp * 1000).toISOString() : null

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (sub) {
      await supabase.from('subscriptions').update({
        status,
        current_period_end: periodEnd,
      }).eq('stripe_subscription_id', subscription.id)

      if (status === 'canceled' || status === 'unpaid') {
        await supabase.from('profiles').update({ plan_type: 'free' }).eq('id', sub.user_id)
      }
    }
  }

  return NextResponse.json({ received: true })
}

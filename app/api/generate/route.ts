import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PLAN_LIMITS, WEEK_KEYS, type DietaryPreference, type Goal, type Period } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan_type').eq('id', user.id).single()
  const planType = (profile?.plan_type ?? 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[planType]

  const body = await request.json()
  const { period, nb_persons, diet_type, goal, free_text } = body as {
    period: Period; nb_persons: number; diet_type: DietaryPreference; goal: Goal; free_text: string
  }

  // Block monthly for non-premium
  if (period === 'mois' && !limits.allowMonthly) {
    return NextResponse.json({
      error: 'La génération mensuelle est réservée au plan Premium.',
      upgrade: true,
    }, { status: 403 })
  }

  // Generation credit check (monthly = 4 credits)
  const creditCost = period === 'mois' ? 4 : 1

  const now = new Date()
  const { data: genCount } = await supabase
    .from('generation_counts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (genCount) {
    const resetAt = new Date(genCount.reset_at)
    if (now > resetAt) {
      await supabase.from('generation_counts')
        .update({ count: 0, reset_at: getNextMonthStart() })
        .eq('user_id', user.id)
    } else if (limits.generations !== Infinity && genCount.count + creditCost > limits.generations) {
      return NextResponse.json({
        error: `Crédits insuffisants. Il vous reste ${limits.generations - genCount.count} crédit(s) ce mois.`,
        upgrade: true,
      }, { status: 403 })
    }
  }

  // Fetch user ratings to personalize generation
  const { data: ratingsData } = await supabase
    .from('meal_ratings')
    .select('meal_name, rating')
    .eq('user_id', user.id)
    .limit(40)

  const liked = ratingsData?.filter(r => r.rating === 'like').map(r => r.meal_name) ?? []
  const disliked = ratingsData?.filter(r => r.rating === 'dislike').map(r => r.meal_name) ?? []

  const nbDays = period === 'semaine' ? 7 : 28
  const days = period === 'semaine' ? WEEK_KEYS : Array.from({ length: 28 }, (_, i) => `jour_${i + 1}`)

  const recipeNote = planType === 'premium'
    ? '\nChaque repas inclut une clé "recette" avec 5 à 8 étapes de préparation numérotées.'
    : planType === 'medium'
    ? '\nInclus une clé "recette" (5 à 8 étapes numérotées) UNIQUEMENT pour les 3 repas du premier jour (matin, midi, soir). Tous les autres repas ne doivent PAS avoir de clé "recette".'
    : ''

  const recipeExample = (planType === 'premium' || planType === 'medium')
    ? ', "recette": "1. Faire bouillir l\'eau...\\n2. Ajouter les pâtes...\\n3. ..."'
    : ''

  const systemPrompt = `Tu es un nutritionniste expert francophone. Tu génères des plans de repas structurés en JSON.
Réponds UNIQUEMENT avec du JSON valide, sans markdown ni explication.
Le JSON doit avoir cette structure exacte :
{
  "menus": {
    "lundi": {
      "matin": { "nom": "...", "description": "..."${recipeExample}, "nutrition": {"kcal": 350, "prot": 12, "gluc": 45, "lip": 8} },
      "midi":  { "nom": "...", "description": "..."${recipeExample}, "nutrition": {"kcal": 650, "prot": 35, "gluc": 80, "lip": 22} },
      "soir":  { "nom": "...", "description": "..."${recipeExample}, "nutrition": {"kcal": 550, "prot": 28, "gluc": 65, "lip": 18} }
    }
  },
  "liste_courses": {
    "Fruits & Légumes": ["Carottes (500g)", "..."],
    "Viandes & Poissons": ["Poulet fermier (1kg)", "..."],
    "Féculents & Pains": ["Pâtes (500g)", "..."],
    "Produits laitiers": ["Yaourts nature (x6)", "..."],
    "Épicerie & Condiments": ["Huile d'olive", "..."]
  }
}
Les valeurs nutritionnelles sont des estimations par portion (pour le nombre de personnes indiqué, par repas).
La liste de courses est consolidée (sans doublons, quantités cumulées) pour toute la période.${recipeNote}`

  const ratingsHint = [
    liked.length ? `Repas appréciés par l'utilisateur (à réutiliser si pertinent) : ${liked.join(', ')}` : '',
    disliked.length ? `Repas à éviter absolument : ${disliked.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  const userPrompt = `Génère un plan de repas pour ${period === 'semaine' ? 'une semaine' : 'un mois'} (${nbDays} jours).
- Régime : ${diet_type}
- Objectif : ${goal}
- Nombre de personnes : ${nb_persons}
${free_text ? `- Envies / contraintes : ${free_text}` : ''}
${ratingsHint}
Jours à couvrir : ${days.join(', ')}
Génère des repas variés et savoureux. Inclus les valeurs nutritionnelles estimées pour chaque repas et une liste de courses complète.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const result = JSON.parse(completion.choices[0].message.content ?? '{}')
  const mealsJson = result.menus ?? result
  const shoppingList = result.liste_courses ?? {}

  // Deduct credits
  if (genCount) {
    await supabase.from('generation_counts')
      .update({ count: (genCount.count || 0) + creditCost })
      .eq('user_id', user.id)
  } else {
    await supabase.from('generation_counts')
      .insert({ user_id: user.id, count: creditCost, reset_at: getNextMonthStart() })
  }

  return NextResponse.json({ meals: mealsJson, shopping_list: shoppingList, period, nb_persons, diet_type, goal })
}

function getNextMonthStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}

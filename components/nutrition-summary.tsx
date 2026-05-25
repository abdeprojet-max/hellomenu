import type { WeekMenus } from '@/lib/types'

interface NutritionSummaryProps {
  meals: WeekMenus
  period: 'semaine' | 'mois'
}

const MACROS = [
  { key: 'kcal' as const, label: 'Calories', unit: 'kcal', color: '#16a34a', bg: '#f0fdf4' },
  { key: 'prot' as const, label: 'Protéines', unit: 'g', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'gluc' as const, label: 'Glucides', unit: 'g', color: '#f97316', bg: '#fff7ed' },
  { key: 'lip'  as const, label: 'Lipides',  unit: 'g', color: '#a855f7', bg: '#faf5ff' },
]

export function NutritionSummary({ meals, period }: NutritionSummaryProps) {
  const days = Object.entries(meals).filter(([k]) => !k.startsWith('_'))

  let totalKcal = 0, totalProt = 0, totalGluc = 0, totalLip = 0
  let daysWithData = 0

  for (const [, dayMeals] of days) {
    if (!dayMeals) continue
    let dayKcal = 0, dayProt = 0, dayGluc = 0, dayLip = 0
    let hasMealData = false
    for (const meal of Object.values(dayMeals)) {
      if (!meal?.nutrition) continue
      dayKcal += meal.nutrition.kcal
      dayProt += meal.nutrition.prot
      dayGluc += meal.nutrition.gluc
      dayLip  += meal.nutrition.lip
      hasMealData = true
    }
    if (hasMealData) {
      totalKcal += dayKcal
      totalProt += dayProt
      totalGluc += dayGluc
      totalLip  += dayLip
      daysWithData++
    }
  }

  if (daysWithData === 0) return null

  const avg = {
    kcal: Math.round(totalKcal / daysWithData),
    prot: Math.round(totalProt / daysWithData),
    gluc: Math.round(totalGluc / daysWithData),
    lip:  Math.round(totalLip  / daysWithData),
  }

  const total = { kcal: Math.round(totalKcal), prot: Math.round(totalProt), gluc: Math.round(totalGluc), lip: Math.round(totalLip) }
  const periodLabel = period === 'semaine' ? 'la semaine' : 'le mois'

  return (
    <div className="hm-card" style={{ padding: '22px 24px', marginTop: 22 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1c1917', margin: '0 0 18px' }}>
        Récapitulatif nutritionnel
      </h2>

      {/* Macro cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {MACROS.map(({ key, label, unit, color, bg }) => (
          <div key={key} style={{ background: bg, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: -.5 }}>
              {avg[key]}<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 2 }}>{unit}</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#a8a29e', marginTop: 4 }}>moy. / jour</div>
          </div>
        ))}
      </div>

      {/* Total row */}
      <div style={{ background: '#fafaf5', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: '#78716c', fontWeight: 600, marginRight: 4 }}>Total pour {periodLabel} :</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{total.kcal.toLocaleString('fr-FR')} kcal</span>
        <span style={{ fontSize: 12, color: '#d4d0cb' }}>·</span>
        <span style={{ fontSize: 13, color: '#44403c' }}>{total.prot}g prot.</span>
        <span style={{ fontSize: 12, color: '#d4d0cb' }}>·</span>
        <span style={{ fontSize: 13, color: '#44403c' }}>{total.gluc}g glucides</span>
        <span style={{ fontSize: 12, color: '#d4d0cb' }}>·</span>
        <span style={{ fontSize: 13, color: '#44403c' }}>{total.lip}g lipides</span>
        <span style={{ fontSize: 11.5, color: '#a8a29e', marginLeft: 'auto' }}>sur {daysWithData} jours</span>
      </div>
    </div>
  )
}

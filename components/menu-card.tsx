'use client'

import { useState } from 'react'
import { Check, X, Coffee, UtensilsCrossed, Moon, Pencil, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react'
import type { DayMeals, MealRating, UserRatings } from '@/lib/types'

interface MenuCardProps {
  dayLabel: string
  dayKey: string
  meals: DayMeals
  onUpdate?: (dayKey: string, mealTime: string, field: 'nom' | 'description', value: string) => void
  onRate?: (mealName: string, rating: MealRating) => void
  userRatings?: UserRatings
  readOnly?: boolean
}

const MEAL_CONFIG = [
  { key: 'matin', label: 'Matin', Icon: Coffee },
  { key: 'midi',  label: 'Midi',  Icon: UtensilsCrossed },
  { key: 'soir',  label: 'Soir',  Icon: Moon },
] as const

export function MenuCard({ dayLabel, dayKey, meals, onUpdate, onRate, userRatings = {}, readOnly = false }: MenuCardProps) {
  const [editing, setEditing] = useState<{ meal: string; field: 'nom' | 'description' } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null)

  function startEdit(mealTime: string, field: 'nom' | 'description', currentValue: string) {
    if (readOnly) return
    setEditing({ meal: mealTime, field })
    setEditValue(currentValue)
  }

  function confirmEdit() {
    if (!editing) return
    onUpdate?.(dayKey, editing.meal, editing.field, editValue)
    setEditing(null)
  }

  function cancelEdit() { setEditing(null) }

  const nutrition = MEAL_CONFIG.reduce((acc, { key }) => {
    const n = meals[key as keyof DayMeals]?.nutrition
    if (!n) return acc
    return { kcal: acc.kcal + n.kcal, prot: acc.prot + n.prot, gluc: acc.gluc + n.gluc, lip: acc.lip + n.lip }
  }, { kcal: 0, prot: 0, gluc: 0, lip: 0 })
  const hasNutrition = MEAL_CONFIG.some(({ key }) => !!meals[key as keyof DayMeals]?.nutrition)

  return (
    <div className="hm-card" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 12, letterSpacing: -.2 }}>
        {dayLabel}
      </div>

      {MEAL_CONFIG.map(({ key: mealTime, label, Icon }, idx) => {
        const meal = meals[mealTime as keyof DayMeals]
        if (!meal) return null
        const isLast = idx === MEAL_CONFIG.length - 1
        const currentRating = userRatings[meal.nom]

        return (
          <div key={mealTime} style={{ padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid #f0efeb', position: 'relative' }}>
            <div className="hm-meal-label">
              <Icon size={13} style={{ color: '#a8a29e' }} />
              {label}
            </div>

            {editing?.meal === mealTime && editing.field === 'nom' ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
                  className="hm-input" style={{ fontSize: 13.5, padding: '6px 10px' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit() }}
                />
                <button onClick={confirmEdit} className="hm-btn hm-btn-primary hm-btn-sm" style={{ padding: '6px 8px', borderRadius: 7 }}><Check size={13} strokeWidth={2.5} /></button>
                <button onClick={cancelEdit} className="hm-btn-icon" style={{ borderRadius: 7 }}><X size={13} strokeWidth={2.5} /></button>
              </div>
            ) : (
              <div className="hm-meal-content"
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}
                onClick={() => !readOnly && startEdit(mealTime, 'nom', meal.nom)}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1c1917', cursor: readOnly ? 'default' : 'text', flex: 1 }}>{meal.nom}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {onRate && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onRate(meal.nom, 'like') }} title="J'aime"
                        style={{ width: 22, height: 22, borderRadius: 5, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentRating === 'like' ? '#dcfce7' : 'transparent', color: currentRating === 'like' ? '#16a34a' : '#a8a29e', transition: 'all .12s' }}>
                        <ThumbsUp size={11} strokeWidth={2} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onRate(meal.nom, 'dislike') }} title="Je n'aime pas"
                        style={{ width: 22, height: 22, borderRadius: 5, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentRating === 'dislike' ? '#fef2f2' : 'transparent', color: currentRating === 'dislike' ? '#ef4444' : '#a8a29e', transition: 'all .12s' }}>
                        <ThumbsDown size={11} strokeWidth={2} />
                      </button>
                    </>
                  )}
                  {!readOnly && <button className="hm-edit-btn" onClick={(e) => { e.stopPropagation(); startEdit(mealTime, 'nom', meal.nom) }}><Pencil size={12} /></button>}
                </div>
              </div>
            )}

            {editing?.meal === mealTime && editing.field === 'description' ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
                  className="hm-input" style={{ fontSize: 12.5, padding: '5px 10px' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit() }}
                />
                <button onClick={confirmEdit} className="hm-btn hm-btn-primary hm-btn-sm" style={{ padding: '6px 8px', borderRadius: 7 }}><Check size={13} strokeWidth={2.5} /></button>
                <button onClick={cancelEdit} className="hm-btn-icon" style={{ borderRadius: 7 }}><X size={13} strokeWidth={2.5} /></button>
              </div>
            ) : (
              <div className="hm-meal-content"
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}
                onClick={() => !readOnly && startEdit(mealTime, 'description', meal.description)}
              >
                <span style={{ fontSize: 12, color: '#78716c', cursor: readOnly ? 'default' : 'text', flex: 1 }}>{meal.description}</span>
                {!readOnly && <button className="hm-edit-btn" onClick={(e) => { e.stopPropagation(); startEdit(mealTime, 'description', meal.description) }}><Pencil size={12} /></button>}
              </div>
            )}

            {/* Nutrition par repas */}
            {meal.nutrition && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 5, paddingLeft: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: 4 }}>{meal.nutrition.kcal} kcal</span>
                <span style={{ fontSize: 11, color: '#a8a29e', padding: '1px 6px', borderRadius: 4, background: '#fafaf5' }}>{meal.nutrition.prot}g prot.</span>
                <span style={{ fontSize: 11, color: '#a8a29e', padding: '1px 6px', borderRadius: 4, background: '#fafaf5' }}>{meal.nutrition.gluc}g gluc.</span>
                <span style={{ fontSize: 11, color: '#a8a29e', padding: '1px 6px', borderRadius: 4, background: '#fafaf5' }}>{meal.nutrition.lip}g lip.</span>
              </div>
            )}

            {/* Recette détaillée */}
            {meal.recette && (
              <div style={{ marginTop: 6 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedRecipe(expandedRecipe === mealTime ? null : mealTime) }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {expandedRecipe === mealTime ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  {expandedRecipe === mealTime ? 'Masquer la recette' : 'Voir la recette'}
                </button>
                {expandedRecipe === mealTime && (
                  <div style={{ marginTop: 6, background: '#f9faf5', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#44403c', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {meal.recette}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {hasNutrition && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0efeb' }}>
          <div style={{ fontSize: 11, color: '#a8a29e', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Total jour</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>~{nutrition.kcal} kcal</span>
            <span style={{ fontSize: 11, color: '#d4d0cb' }}>·</span>
            <span style={{ fontSize: 12, color: '#44403c' }}>{nutrition.prot}g prot.</span>
            <span style={{ fontSize: 11, color: '#d4d0cb' }}>·</span>
            <span style={{ fontSize: 12, color: '#44403c' }}>{nutrition.gluc}g glucides</span>
            <span style={{ fontSize: 11, color: '#d4d0cb' }}>·</span>
            <span style={{ fontSize: 12, color: '#44403c' }}>{nutrition.lip}g lipides</span>
          </div>
        </div>
      )}
    </div>
  )
}

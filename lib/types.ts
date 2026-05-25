export type PlanType = 'free' | 'medium' | 'premium'
export type DietaryPreference = 'equilibre' | 'sain' | 'vegan' | 'sportif' | 'gourmand'
export type Goal = 'prise_masse' | 'perte_poids' | 'maintien'
export type Period = 'semaine' | 'mois'

export interface Profile {
  id: string
  full_name: string | null
  nb_persons: number
  dietary_preference: DietaryPreference | null
  goal: Goal | null
  plan_type: PlanType
  stripe_customer_id: string | null
  onboarding_done: boolean
  created_at: string
}

export interface NutritionInfo {
  kcal: number
  prot: number
  gluc: number
  lip: number
}

export interface Meal {
  nom: string
  description: string
  nutrition?: NutritionInfo
  recette?: string
}

export type MealRating = 'like' | 'dislike'
export type UserRatings = Record<string, MealRating>

export interface DayMeals {
  matin: Meal
  midi: Meal
  soir: Meal
}

export interface WeekMenus {
  [day: string]: DayMeals
}

export type ShoppingList = Record<string, string[]>

export interface Menu {
  id: string
  user_id: string
  title: string
  period: Period
  nb_persons: number
  diet_type: DietaryPreference | null
  goal: Goal | null
  meals: WeekMenus | WeekMenus[]
  is_favorite: boolean
  share_token: string | null
  created_at: string
}

export interface GenerationCount {
  user_id: string
  count: number
  reset_at: string
}

export const PLAN_LIMITS = {
  free:    { generations: 5,        savedMenus: 1,        allowMonthly: false, shareLimit: 1        },
  medium:  { generations: 15,       savedMenus: 20,       allowMonthly: false, shareLimit: 5        },
  premium: { generations: 30,       savedMenus: Infinity, allowMonthly: true,  shareLimit: Infinity },
}

export const DIET_LABELS: Record<DietaryPreference, string> = {
  equilibre: 'Équilibré',
  sain: 'Sain',
  vegan: 'Vegan',
  sportif: 'Sportif',
  gourmand: 'Gourmand',
}

export const GOAL_LABELS: Record<Goal, string> = {
  prise_masse: 'Prise de masse',
  perte_poids: 'Perte de poids',
  maintien: 'Maintien',
}

export const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
export const WEEK_KEYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

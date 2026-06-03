import Link from 'next/link'
import { HmLogo } from '@/components/hm-logo'
import { Sparkles, ChefHat, BookOpen, Star, ArrowRight, Check } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Génération par IA',
    description: 'Décrivez vos envies, notre IA crée des menus complets et variés en quelques secondes.',
  },
  {
    icon: ChefHat,
    title: 'Adapté à vos besoins',
    description: 'Équilibré, vegan, sportif, gourmand, prise de masse, perte de poids… tout est personnalisable.',
  },
  {
    icon: BookOpen,
    title: 'Sauvegardez vos favoris',
    description: 'Conservez vos meilleurs menus et réutilisez-les quand vous le souhaitez.',
  },
  {
    icon: Star,
    title: 'Édition à la carte',
    description: 'Modifiez chaque repas généré directement, avant ou après sauvegarde.',
  },
]

const testimonials = [
  {
    name: 'Marie L.',
    role: 'Maman de 3 enfants',
    text: 'Je ne savais plus quoi cuisiner chaque semaine. Avec HelloMenu je génère mon planning en 10 secondes !',
  },
  {
    name: 'Karim B.',
    role: 'Sportif amateur',
    text: 'Le mode « prise de masse » est parfait. Les repas sont vraiment adaptés à mon entraînement.',
  },
  {
    name: 'Sophie M.',
    role: 'Végétalienne',
    text: 'Enfin une app qui propose des menus vegan vraiment variés et gourmands. Je recommande.',
  },
]

const freeFeatures = [
  '5 générations de menus par mois',
  '3 menus sauvegardés',
  'Tous les types de régime',
  'Édition des menus',
  'Menus à la semaine ou au mois',
  'Pour 1 à 6+ personnes',
  'Idées libres en texte',
  'Profil personnalisable',
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf5', fontFamily: 'inherit' }}>
      {/* Header */}
      <header className="hm-marketing-header">
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', width: '100%' }}>
          <HmLogo href="/" size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto' }}>
            <Link href="/auth/register">
              <button className="hm-btn hm-btn-primary hm-btn-sm">Essai gratuit</button>
            </Link>
            <Link href="/auth/login" style={{ fontSize: 14, fontWeight: 500, color: '#78716c', textDecoration: 'none' }}>
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #fafaf5 50%, #fff7ed 100%)', padding: '80px 28px 96px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', marginBottom: 24,
            background: '#dcfce7', color: '#15803d',
            fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 100,
            letterSpacing: .2,
          }}>
            Propulsé par l&apos;IA
          </span>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#1c1917', lineHeight: 1.12, letterSpacing: -1.5, margin: '0 0 20px' }}>
            Vos menus de la semaine,<br />
            <span style={{ color: '#16a34a' }}>générés en 10 secondes</span>
          </h1>
          <p style={{ fontSize: 18, color: '#78716c', margin: '0 0 36px', lineHeight: 1.65, maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
            Équilibré, vegan, sportif ou gourmand. HelloMenu génère des plans de repas personnalisés grâce à l&apos;IA, à la semaine ou au mois.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <button className="hm-btn hm-btn-primary" style={{ padding: '14px 28px', fontSize: 15.5, borderRadius: 13, fontWeight: 600 }}>
                Commencer gratuitement <ArrowRight size={17} style={{ marginLeft: 4 }} />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="hm-btn hm-btn-outline" style={{ padding: '14px 28px', fontSize: 15.5, borderRadius: 13 }}>
                Voir les tarifs
              </button>
            </Link>
          </div>
          <p style={{ marginTop: 14, fontSize: 13, color: '#a8a29e' }}>Gratuit pour commencer · Sans carte bancaire</p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 28px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1c1917', margin: '0 0 10px', letterSpacing: -.6 }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ fontSize: 15, color: '#78716c', margin: 0 }}>Une app simple, puissante, et vraiment utile au quotidien</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="hm-card" style={{ padding: '22px 24px', display: 'flex', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#16a34a' }}>
                  <Icon size={19} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: '0 0 5px' }}>{title}</h3>
                  <p style={{ fontSize: 13.5, color: '#78716c', margin: 0, lineHeight: 1.55 }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: '#f5f4ec', padding: '80px 28px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1c1917', margin: 0, letterSpacing: -.6 }}>
              Ils adorent HelloMenu
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {testimonials.map(({ name, role, text }) => (
              <div key={name} className="hm-card" style={{ padding: '22px 24px' }}>
                <div className="hm-stars" style={{ marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 13.5, color: '#44403c', margin: '0 0 16px', lineHeight: 1.6 }}>&ldquo;{text}&rdquo;</p>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1c1917', margin: '0 0 2px' }}>{name}</p>
                  <p style={{ fontSize: 12, color: '#a8a29e', margin: 0 }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free plan CTA */}
      <section style={{ padding: '80px 28px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1c1917', margin: '0 0 10px', letterSpacing: -.6 }}>
            Commencez gratuitement
          </h2>
          <p style={{ fontSize: 15, color: '#78716c', margin: '0 0 36px' }}>5 générations par mois offertes, sans carte bancaire</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 36, textAlign: 'left' }}>
            {freeFeatures.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#44403c' }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#16a34a" strokeWidth={2.5} />
                </span>
                {f}
              </div>
            ))}
          </div>
          <Link href="/auth/register">
            <button className="hm-btn hm-btn-primary" style={{ padding: '14px 32px', fontSize: 15.5, borderRadius: 13, fontWeight: 600 }}>
              Créer mon compte gratuit <ArrowRight size={17} style={{ marginLeft: 4 }} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e7e5e4', padding: '28px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <HmLogo size="sm" />
        </div>
        <p style={{ fontSize: 13, color: '#a8a29e', margin: '0 0 12px' }}>&copy; 2026 HelloMenu. Tous droits réservés.</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <Link href="/pricing" style={{ fontSize: 13, color: '#78716c', textDecoration: 'none' }}>Tarifs</Link>
          <Link href="/auth/login" style={{ fontSize: 13, color: '#78716c', textDecoration: 'none' }}>Connexion</Link>
          <Link href="/auth/register" style={{ fontSize: 13, color: '#78716c', textDecoration: 'none' }}>Inscription</Link>
        </div>
      </footer>
    </div>
  )
}

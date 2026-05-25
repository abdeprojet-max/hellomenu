import Link from 'next/link'

interface HmLogoProps {
  size?: 'sm' | 'md'
  href?: string
}

export function HmLogo({ size = 'md', href = '/' }: HmLogoProps) {
  const iconSize = size === 'sm' ? 28 : 32
  const fontSize = size === 'sm' ? 16 : 18

  return (
    <Link href={href} className="hm-logo" style={{ fontSize }}>
      <span className="hm-logo-icon" style={{ width: iconSize, height: iconSize, borderRadius: 8 }}>
        <svg
          width={iconSize * 0.6}
          height={iconSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-3H7v3M6 18a5 5 0 0 1-1-9.9V8a5 5 0 0 1 9-3 5 5 0 0 1 9 3v.1A5 5 0 0 1 18 18" />
        </svg>
      </span>
      <span>HelloMenu</span>
    </Link>
  )
}

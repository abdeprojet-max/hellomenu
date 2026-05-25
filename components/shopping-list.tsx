'use client'

import { useState } from 'react'
import { Printer, Download, ShoppingCart } from 'lucide-react'
import type { ShoppingList } from '@/lib/types'

interface ShoppingListCardProps {
  shoppingList: ShoppingList
  period: 'semaine' | 'mois'
  nbPersons: number
}

export function ShoppingListCard({ shoppingList, period, nbPersons }: ShoppingListCardProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggle(key: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Liste de courses — HelloMenu</title>
<style>
  body{font-family:Arial,sans-serif;max-width:640px;margin:40px auto;padding:0 24px;color:#1c1917}
  h1{font-size:19px;color:#16a34a;margin:0 0 6px}
  p{font-size:13px;color:#78716c;margin:0 0 28px}
  h2{font-size:13px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:.6px;margin:20px 0 8px;padding-bottom:5px;border-bottom:1px solid #e7e5e4}
  ul{list-style:none;padding:0;margin:0 0 4px}
  li{display:flex;align-items:center;gap:10px;padding:4px 0;font-size:14px}
  .box{width:15px;height:15px;border:1.5px solid #a8a29e;border-radius:3px;flex-shrink:0}
  @media print{.noprint{display:none}}
</style></head><body>
<h1>🛒 Liste de courses — HelloMenu</h1>
<p>${period === 'semaine' ? 'Semaine' : 'Mois'} · ${nbPersons} personne${nbPersons > 1 ? 's' : ''}</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px">
${Object.entries(shoppingList).map(([cat, items]) => `
<div>
<h2>${cat}</h2>
<ul>${items.map(i => `<li><div class="box"></div>${i}</li>`).join('')}</ul>
</div>`).join('')}
</div>
<p style="margin-top:32px;font-size:12px;color:#a8a29e">Généré par HelloMenu — hellomenu.app</p>
<script>window.onload=()=>{window.print()}</script>
</body></html>`)
    win.document.close()
  }

  function handleDownload() {
    const header = `LISTE DE COURSES — HELLOMENU\n${period === 'semaine' ? 'Semaine' : 'Mois'} · ${nbPersons} personne${nbPersons > 1 ? 's' : ''}\n${'─'.repeat(40)}\n`
    const body = Object.entries(shoppingList)
      .map(([cat, items]) => `\n${cat.toUpperCase()}\n${items.map(i => `  ☐  ${i}`).join('\n')}`)
      .join('\n')
    const footer = `\n\n${'─'.repeat(40)}\nGénéré par HelloMenu`
    const blob = new Blob([header + body + footer], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `liste-courses-hellomenu.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const allItems = Object.values(shoppingList).flat()
  const total = allItems.length
  const checkedCount = checked.size
  const entries = Object.entries(shoppingList)

  return (
    <div className="hm-card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingCart size={17} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1c1917', margin: 0 }}>Liste de courses</h2>
            <p style={{ fontSize: 12.5, color: '#78716c', margin: 0 }}>
              {checkedCount > 0 ? `${checkedCount}/${total} cochés` : `${total} articles`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={handlePrint}>
            <Printer size={13} /> Imprimer
          </button>
          <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={handleDownload}>
            <Download size={13} /> Télécharger
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 28px' }}>
        {entries.map(([category, items]) => (
          <div key={category}>
            <h3 style={{ fontSize: 11.5, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '.7px', margin: '0 0 8px', paddingBottom: 5, borderBottom: '1px solid #f0efeb' }}>
              {category}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map((item, i) => {
                const key = `${category}-${i}`
                const done = checked.has(key)
                return (
                  <li
                    key={key}
                    onClick={() => toggle(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `2px solid ${done ? '#16a34a' : '#d4d0cb'}`,
                      background: done ? '#16a34a' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all .12s',
                    }}>
                      {done && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: 13.5, color: done ? '#a8a29e' : '#44403c',
                      textDecoration: done ? 'line-through' : 'none', transition: 'all .12s',
                    }}>
                      {item}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {checkedCount > 0 && checkedCount === total && (
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#16a34a', fontWeight: 600, marginTop: 8 }}>
          ✓ Courses complètes !
        </p>
      )}
    </div>
  )
}

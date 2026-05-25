'use client'
import { useRef, useEffect } from 'react'
import Icon from './Icon'
import { SORTS } from '@/lib/data'
import type { SortKey } from '@/types'

interface Props {
  q:           string
  setQ:        (v: string) => void
  searching:   boolean
  sortKey:     SortKey
  setSortKey:  (k: SortKey) => void
  sortOpen:    boolean
  setSortOpen: (v: boolean) => void
}

export default function TopBar({ q, setQ, searching, sortKey, setSortKey, sortOpen, setSortOpen }: Props) {
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [setSortOpen])

  const currentLabel = SORTS.find(s => s.key === sortKey)?.label || 'Sort'

  return (
    <header className="flex items-center gap-4 px-8 py-5 border-b border-border
      bg-white/92 backdrop-blur-[20px] sticky top-0 z-30
      shadow-[0_1px_12px_rgba(0,80,40,.06)]">
      {/* Search */}
      <div className="flex-1 max-w-[440px] relative">
        <Icon name="search" className="absolute left-[17px] top-1/2 -translate-y-1/2 stroke-ink4" />
        {searching && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2
            w-4 h-4 border-2 border-border border-t-green-primary rounded-full animate-spin" />
        )}
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-[46px] pr-4 py-[11px] border border-border rounded-full
            text-[13px] font-[Jost,sans-serif] bg-bg3 text-ink outline-none tracking-[.3px]
            placeholder:text-ink4
            focus:border-green-primary focus:shadow-[0_0_0_3px_rgba(5,150,105,.15)]
            transition-all duration-200"
        />
      </div>

      {/* Sort */}
      <div className="ml-auto" ref={sortRef}>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-1.5 px-[18px] py-2.5 border border-border rounded-full
            text-[12px] font-medium tracking-[.5px] uppercase text-ink3 bg-bg3
            hover:border-border2 hover:text-ink2 transition-all duration-200 relative"
        >
          <Icon name="sort" size={13} />
          {currentLabel}
          <Icon name="chevron-down" size={13} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />

          {sortOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 bg-card2 border border-border
              rounded-[12px] shadow-[0_16px_40px_rgba(0,80,40,.12)] z-40 min-w-[200px] overflow-hidden
              animate-fadeIn">
              {SORTS.map(s => (
                <button
                  key={s.key}
                  onClick={e => { e.stopPropagation(); setSortKey(s.key as SortKey); setSortOpen(false) }}
                  className={`w-full text-left px-[18px] py-3 text-[13px] font-normal tracking-[.3px]
                    flex items-center justify-between text-ink2
                    hover:bg-bg3 transition-all duration-150
                    ${sortKey === s.key ? 'text-green-primary font-semibold' : ''}`}
                >
                  {s.label}
                  {sortKey === s.key && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </button>
      </div>
    </header>
  )
}

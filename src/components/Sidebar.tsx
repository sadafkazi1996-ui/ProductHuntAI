'use client'
import Icon from './Icon'
import type { Section } from '@/types'

interface Props {
  sec:      Section
  navTo:    (s: Section) => void
  gaps:     number
  picks:    number
  stats:    { total: number; gaps: number; avgMarkup: number; productsScanned: number }
}

const links = [
  { sec: 'home'    as Section, icon: 'home'    as const, label: 'Overview'          },
  { sec: 'gaps'    as Section, icon: 'zap'     as const, label: 'Opportunities'     },
  { sec: 'exists'  as Section, icon: 'check'   as const, label: 'Competitive Intel' },
  { sec: 'picks'   as Section, icon: 'heart'   as const, label: 'My Picks'          },
]
const bottomLinks = [
  { sec: 'insights' as Section, icon: 'insight'  as const, label: 'Insights'         },
  { sec: 'finder'   as Section, icon: 'sparkle'  as const, label: 'Winning Finder', badge: 'NEW' },
  { sec: 'scan'     as Section, icon: 'scan'     as const, label: 'Scan Products'    },
]

export default function Sidebar({ sec, navTo, gaps, picks, stats }: Props) {
  return (
    <aside className="w-[256px] bg-bg2 border-r border-border fixed inset-y-0 left-0 z-50
      flex flex-col overflow-y-auto overflow-x-hidden shadow-[2px_0_20px_rgba(0,80,40,.06)]">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-[300px]
        bg-[radial-gradient(ellipse_at_top_left,rgba(5,150,105,0.15)_0%,transparent_70%)]
        pointer-events-none" />

      {/* Brand */}
      <div className="px-6 py-8 border-b border-border relative">
        <div className="flex items-center gap-3.5">
          <div className="w-[46px] h-[46px] rounded-[14px] flex-shrink-0 flex items-center justify-center
            bg-gradient-to-br from-green-dark to-emerald
            text-white font-bold text-base font-display italic
            shadow-[0_4px_20px_rgba(5,150,105,.35)]">
            SF
          </div>
          <div>
            <h2 className="font-display text-[20px] font-semibold leading-[1.1] tracking-[.3px] text-ink">
              Sadaf Finds
            </h2>
            <p className="text-[11px] text-ink3 font-normal tracking-[1.5px] uppercase mt-0.5">
              Arbitrage Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-4 pt-6 pb-2">
        <div className="text-[10px] font-semibold text-ink4 uppercase tracking-[2px] px-3 pb-3">
          Intelligence
        </div>
        {links.map(l => (
          <SbLink
            key={l.sec}
            active={sec === l.sec}
            onClick={() => navTo(l.sec)}
            icon={l.icon}
            label={l.label}
            badge={l.sec === 'gaps' && gaps > 0 ? String(gaps) : l.sec === 'picks' && picks > 0 ? String(picks) : undefined}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <nav className="px-4 pt-4 pb-2">
        <div className="text-[10px] font-semibold text-ink4 uppercase tracking-[2px] px-3 pb-3">
          Tools
        </div>
        {bottomLinks.map(l => (
          <SbLink
            key={l.sec}
            active={sec === l.sec}
            onClick={() => navTo(l.sec)}
            icon={l.icon}
            label={l.label}
            badge={l.badge}
            badgeStyle={l.badge === 'NEW' ? 'bg-gradient-to-r from-amber-500 to-red-500 text-[8px]' : undefined}
          />
        ))}
      </nav>

      {/* Stats */}
      <div className="mt-auto p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          {[
            { n: stats.gaps,             l: 'Gaps',    cls: 'text-rose',          onClick: () => navTo('gaps') },
            { n: stats.total,            l: 'Matches', cls: 'text-green-primary', onClick: () => navTo('exists') },
            { n: stats.avgMarkup ? `${stats.avgMarkup.toFixed(1)}x` : '—', l: 'Avg Markup', cls: '', onClick: () => navTo('home') },
            { n: stats.productsScanned,  l: 'Scanned', cls: '',                   onClick: () => navTo('scan') },
          ].map(s => (
            <button key={s.l} onClick={s.onClick}
              className="bg-bg3 border border-border rounded-[10px] py-3.5 px-2.5 text-center
                cursor-pointer transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]
                hover:border-border2 hover:bg-card2 hover:-translate-y-px active:scale-[.97]">
              <div className={`font-display text-2xl leading-none font-semibold ${s.cls}`}>{s.n}</div>
              <div className="text-[9px] text-ink4 font-medium uppercase tracking-[1.5px] mt-1">{s.l}</div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

function SbLink({
  active, onClick, icon, label, badge, badgeStyle
}: {
  active: boolean; onClick: () => void; icon: Parameters<typeof Icon>[0]['name']
  label: string; badge?: string; badgeStyle?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-[11px] rounded-[12px] mb-0.5
        text-[13px] font-medium tracking-[.3px] relative overflow-hidden
        transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]
        before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
        before:w-[3px] before:rounded-r-[4px]
        before:bg-gradient-to-b before:from-green-dark before:to-emerald
        before:transition-transform before:duration-200
        ${active
          ? 'bg-gradient-to-r from-green-light to-transparent text-green-dark before:scale-y-100'
          : 'text-ink3 hover:bg-bg3 hover:text-ink2 before:scale-y-0'
        }`}
    >
      <Icon
        name={icon}
        className={active ? 'stroke-green-primary' : 'stroke-ink4 group-hover:stroke-ink2'}
      />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold rounded-full px-[9px] py-[2px] tracking-[.3px]
          ${badgeStyle || (active
            ? 'bg-green-primary/18 text-green-dark'
            : 'bg-green-primary text-white'
          )}`}>
          {badge}
        </span>
      )}
    </button>
  )
}

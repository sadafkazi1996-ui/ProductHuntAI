'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import ProductCard from '@/components/ProductCard'
import DetailPanel from '@/components/DetailPanel'
import Icon from '@/components/Icon'
import {
  MOCK_PRODUCTS, WPF_PRODUCTS, SORTS, WPF_CATS, WPF_SORTS,
  buildAmzUrl, validateTemuUrl, openUrl, calcProfit
} from '@/lib/data'
import { api } from '@/lib/api'
import type { Product, WpfProduct, Section, SortKey, ApiStats, ScanJob } from '@/types'

export default function Dashboard() {
  // ── State ────────────────────────────────────────────────────────────
  const [sec,      setSec]      = useState<Section>('home')
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [picks,    setPicks]    = useState<Product[]>([])
  const [skips,    setSkips]    = useState<Record<string, boolean>>({})
  const [det,      setDet]      = useState<Product | null>(null)
  const [q,        setQ]        = useState('')
  const [cat,      setCat]      = useState('all')
  const [sortKey,  setSortKey]  = useState<SortKey>('markup_desc')
  const [sortOpen, setSortOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [stats,    setStats]    = useState<ApiStats>({ total: 16, gaps: 11, avgMarkup: 2.8, avgMargin: 60, productsScanned: 284 })

  // WPF state
  const [wpfCat,    setWpfCat]    = useState('all')
  const [wpfQ,      setWpfQ]      = useState('')
  const [wpfSort,   setWpfSort]   = useState('margin_desc')
  const [wpfSortOpen, setWpfSortOpen] = useState(false)
  const [wpfTab,    setWpfTab]    = useState<'products'|'analytics'|'calculator'>('products')
  const [calcSell,  setCalcSell]  = useState('')
  const [calcCost,  setCalcCost]  = useState('')
  const [calcFees,  setCalcFees]  = useState('15')

  // Scan state
  const [scSt,     setScSt]     = useState<ScanJob | null>(null)
  const [scLoading, setScLoading] = useState(false)
  const [scCat,    setScCat]    = useState('')
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Insights AI
  const [insActive, setInsActive] = useState<string | null>(null)
  const [insText,   setInsText]   = useState<string>('')
  const [insLoading, setInsLoading] = useState(false)

  // ── Load from API ────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.get<Product[]>('/verified'),
      api.get<ApiStats>('/verified/stats'),
      api.get('/scan/pool'),
      api.get<Product[]>('/picks'),
      api.get<string[]>('/skips'),
    ]).then(([prods, apiStats, , apiPicks, apiSkips]) => {
      if (prods?.length)    setProducts(prods)
      if (apiStats)         setStats(apiStats)
      if (apiPicks?.length) setPicks(apiPicks)
      if (apiSkips?.length) { const m: Record<string,boolean> = {}; apiSkips.forEach(id => m[id]=true); setSkips(m) }
    })
    api.get<ScanJob>('/scan/status').then(s => { if (s) { setScSt(s); if (s.running) poll() } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function poll() {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      const s = await api.get<ScanJob>('/scan/status')
      if (s) { setScSt(s); if (!s.running) { clearInterval(pollRef.current!); pollRef.current = null } }
    }, 1000)
  }

  // ── Search ────────────────────────────────────────────────────────────
  const searchTimer = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!q.trim()) { setSearchResults(null); setSearching(false); return }
    setSearching(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      const r = await api.get<{ results: Product[] }>(`/search?q=${encodeURIComponent(q.trim())}&limit=50`)
      if (r?.results) {
        setSearchResults(r.results)
      } else {
        const lq = q.toLowerCase()
        setSearchResults(products.filter(p =>
          p.amz_com_title.toLowerCase().includes(lq) ||
          p.temu_title.toLowerCase().includes(lq) ||
          p.temu_category.toLowerCase().includes(lq)
        ))
      }
      setSearching(false)
    }, 300)
  }, [q, products])

  // ── Derived lists ─────────────────────────────────────────────────────
  const visible = products.filter(p => !skips[p.id])
  const gaps    = visible.filter(p => p.amz_ae_status === 'GAP')
  const exists  = visible.filter(p => p.amz_ae_status === 'EXISTS')
  const pickIds = Object.fromEntries(picks.map(p => [p.id || (p as any).opportunity_id, true]))

  function sortList(list: Product[]) {
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'markup_desc':     return b.markup_com - a.markup_com
        case 'markup_asc':      return a.markup_com - b.markup_com
        case 'margin_desc':     return b.margin_potential - a.margin_potential
        case 'confidence_desc': return b.vision_confidence - a.vision_confidence
        case 'price_asc':       return a.amz_com_price - b.amz_com_price
        case 'sold_desc':       return b.temu_sold - a.temu_sold
        default: return 0
      }
    })
  }

  function filterByCat(list: Product[]) {
    return cat === 'all' ? list : list.filter(p => p.temu_category === cat)
  }

  const isSearching = !!(q.trim() && searchResults !== null)
  const rawList = isSearching ? searchResults! : sec === 'picks' ? picks : sec === 'exists' ? exists : gaps
  const catMap  = Object.fromEntries(
    Object.entries(
      rawList.reduce((m, p) => { m[p.temu_category] = (m[p.temu_category]||0)+1; return m }, {} as Record<string,number>)
    )
  )
  const catList = Object.keys(catMap).sort((a,b) => catMap[b]-catMap[a])
  const sorted  = sortList(filterByCat(rawList))
  const allCount = rawList.length

  function navTo(s: Section) { setSec(s); setCat('all'); setQ(''); setSearchResults(null); setSortOpen(false) }

  async function togglePick(d: Product) {
    const id = d.id
    const has = !!pickIds[id]
    if (has) { await api.delete(`/picks/${id}`); setPicks(p => p.filter(x => (x.id||(x as any).opportunity_id) !== id)) }
    else     { await api.post('/picks', { opportunityId: id }); setPicks(p => [...p, d]) }
  }

  async function skip(id: string) {
    await api.post('/skips', { opportunityId: id })
    setSkips(s => ({ ...s, [id]: true }))
    picks.some(p => (p.id||(p as any).opportunity_id) === id) && setPicks(p => p.filter(x => (x.id||(x as any).opportunity_id) !== id))
    if (det?.id === id) setDet(null)
  }

  async function startScan() {
    setScLoading(true)
    const r = await api.post<{ ok: boolean }>('/scan', { category: scCat || undefined, limit: 40 })
    setScLoading(false)
    if (r?.ok) poll()
  }

  async function runInsight(type: string) {
    if (insActive === type) { setInsActive(null); setInsText(''); return }
    setInsActive(type); setInsLoading(true); setInsText('')
    const r = await api.post<{ ok: boolean; text: string }>('/agent', { type })
    setInsText(r?.text || 'No response. Make sure your API key is configured.')
    setInsLoading(false)
  }

  // ── WPF helpers ──────────────────────────────────────────────────────
  const effectiveStats = { total: products.length, gaps: gaps.length, avgMarkup: stats.avgMarkup, productsScanned: stats.productsScanned }
  const wpfFiltered = WPF_PRODUCTS
    .filter(p => wpfCat === 'all' || p.category === wpfCat)
    .filter(p => !wpfQ.trim() || p.amz_title.toLowerCase().includes(wpfQ.toLowerCase()) || p.temu_title.toLowerCase().includes(wpfQ.toLowerCase()))
    .sort((a, b) => {
      switch (wpfSort) {
        case 'demand_desc': return b.demand - a.demand
        case 'match_desc':  return b.match_score - a.match_score
        case 'price_asc':   return a.temu_price - b.temu_price
        case 'reviews_desc': return b.amz_reviews - a.amz_reviews
        default: return b.margin - a.margin
      }
    })

  const wpfTotalGaps   = WPF_PRODUCTS.filter(p => !p.ae_price).length
  const wpfAvgMargin   = Math.round(WPF_PRODUCTS.reduce((s,p) => s+p.margin, 0) / WPF_PRODUCTS.length)
  const wpfTopDemand   = WPF_PRODUCTS.filter(p => p.demand === 5).length
  const wpfTotalReviews = WPF_PRODUCTS.reduce((s,p) => s+p.amz_reviews, 0)

  const calcResult = useCallback(() => {
    const sell = parseFloat(calcSell) || 0
    const cost = parseFloat(calcCost) || 0
    const fees = parseFloat(calcFees) || 15
    const { gross, margin } = calcProfit(sell, cost, fees)
    return { gross: Math.max(0, gross), margin: Math.max(0, margin) }
  }, [calcSell, calcCost, calcFees])

  // ── Grid helper ──────────────────────────────────────────────────────
  function ProductGrid({ list }: { list: Product[] }) {
    return (
      <div className="px-8 pb-5">
        {list.length > 0 ? (
          <div className="product-grid">
            {list.map(d => (
              <ProductCard key={d.id} d={d} picked={!!pickIds[d.id]}
                onTap={() => { setDet(d) }} onPick={() => togglePick(d)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-ink4 text-[14px] tracking-[.3px]">
            <div className="text-4xl mb-4 opacity-40">✦</div>
            No products match
          </div>
        )}
      </div>
    )
  }

  function CategoryChips({ list, count }: { list: Product[]; count: number }) {
    const cm = list.reduce((m, p) => { m[p.temu_category]=(m[p.temu_category]||0)+1; return m }, {} as Record<string,number>)
    const cl = Object.keys(cm).sort((a,b) => cm[b]-cm[a])
    return (
      <div className="flex gap-2 px-8 py-4 pb-5 overflow-x-auto scrollbar-hide">
        {[{ c: 'all', n: count }, ...cl.map(c => ({ c, n: cm[c] }))].map(({ c, n }) => (
          <button key={c} onClick={() => setCat(c)}
            className={`flex items-center gap-1.5 px-[18px] py-2 rounded-full text-[12px] font-medium tracking-[.5px] uppercase
              cursor-pointer whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]
              ${cat === c
                ? 'bg-gradient-to-r from-green-dark to-emerald text-white shadow-[0_4px_16px_rgba(5,150,105,.28)] border-transparent'
                : 'border border-border text-ink3 hover:border-border2 hover:text-ink2'
              } active:scale-[.96]`}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center
              ${cat === c ? 'bg-white/20 text-white' : 'bg-white/8 text-inherit'}`}>{n}</span>
          </button>
        ))}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Sidebar sec={sec} navTo={navTo} gaps={gaps.length} picks={picks.length} stats={effectiveStats} />

      {/* Main content */}
      <main className={`ml-[256px] min-h-screen transition-[margin-right] duration-300 ease-[cubic-bezier(.4,0,.2,1)]
        ${det ? 'mr-[400px]' : ''}`}
        onClick={() => sortOpen && setSortOpen(false)}>

        <TopBar q={q} setQ={setQ} searching={searching}
          sortKey={sortKey} setSortKey={setSortKey}
          sortOpen={sortOpen} setSortOpen={setSortOpen} />

        {/* ── HOME ── */}
        {sec === 'home' && !isSearching && (
          <>
            {/* Hero cards */}
            <div className="mx-8 mt-7 grid grid-cols-[1.4fr_1fr] gap-4">
              {/* Gap card */}
              <div onClick={() => navTo('gaps')} className="rounded-[16px] overflow-hidden relative p-10 min-h-[200px]
                flex flex-col justify-end cursor-pointer transition-transform duration-300 hover:scale-[1.01]
                bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857]
                before:content-[''] before:absolute before:inset-0
                before:bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,.35)_0%,transparent_60%)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
                <div className="absolute top-7 right-8 text-right z-[1]">
                  <div className="font-display text-[52px] leading-none font-semibold text-white">{gaps.length}</div>
                  <div className="text-[11px] opacity-60 mt-0.5 tracking-[1px] uppercase">Gap Products</div>
                </div>
                <h3 className="font-display text-[30px] font-medium mb-1.5 leading-[1.15] tracking-[.5px] text-white relative z-[1]">
                  Untapped Opportunities
                </h3>
                <p className="text-[13px] opacity-75 mb-5 max-w-[300px] relative z-[1] leading-relaxed tracking-[.2px]">
                  Products trending on Amazon.com not yet listed on Amazon.ae — your first-mover advantage.
                </p>
                <button className="self-start relative z-[1] flex items-center gap-2 px-6 py-[11px] rounded-full
                  text-[12px] font-semibold tracking-[1px] uppercase
                  bg-gradient-to-r from-green-dark to-emerald text-white
                  shadow-[0_4px_20px_rgba(5,150,105,.35)] hover:scale-[1.03] hover:shadow-[0_6px_28px_rgba(5,150,105,.5)]
                  transition-all duration-200">
                  Explore Gaps <Icon name="arrow-right" size={14} />
                </button>
              </div>

              {/* Intel card */}
              <div onClick={() => navTo('exists')} className="rounded-[16px] overflow-hidden relative p-10 min-h-[200px]
                flex flex-col justify-end cursor-pointer transition-transform duration-300 hover:scale-[1.01]
                bg-gradient-to-br from-bg to-green-light to-green-mid border border-border
                before:content-[''] before:absolute before:inset-0
                before:bg-[radial-gradient(circle_at_20%_80%,rgba(5,150,105,.1)_0%,transparent_60%)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/0 pointer-events-none" />
                <div className="absolute top-7 right-8 text-right z-[1]">
                  <div className="font-display text-[52px] leading-none font-semibold text-green-dark">{exists.length}</div>
                  <div className="text-[11px] text-ink3 mt-0.5 tracking-[1px] uppercase">Tracked</div>
                </div>
                <h3 className="font-display text-[30px] font-medium mb-1.5 leading-[1.15] tracking-[.5px] text-ink relative z-[1]">
                  Competitive Intel
                </h3>
                <p className="text-[13px] text-ink3 mb-5 max-w-[300px] relative z-[1] leading-relaxed tracking-[.2px]">
                  Monitor products already live on Amazon.ae to understand pricing and competition.
                </p>
                <button className="self-start relative z-[1] flex items-center gap-2 px-6 py-[11px] rounded-full
                  text-[12px] font-semibold tracking-[1px] uppercase
                  bg-gradient-to-r from-green-dark to-emerald text-white
                  shadow-[0_4px_16px_rgba(5,150,105,.3)] hover:scale-[1.03] transition-all duration-200">
                  View Intel <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>

            {/* Exists preview */}
            {exists.length > 0 && (
              <>
                <div className="flex items-baseline justify-between px-8 pt-9 pb-2.5">
                  <div>
                    <h2 className="font-display text-[26px] font-medium tracking-[.5px] text-ink">Latest Competitive Intel</h2>
                    <p className="text-[12px] text-ink3 mt-1 tracking-[.5px]">{exists.length} products tracked on Amazon.ae</p>
                  </div>
                  <button onClick={() => navTo('exists')} className="text-[11px] text-green-primary font-semibold
                    tracking-[1.5px] uppercase hover:text-green-dark transition-colors">View All →</button>
                </div>
                <div className="px-8 pb-5">
                  <div className="product-grid">
                    {exists.slice(0, 4).map(d => (
                      <ProductCard key={d.id} d={d} picked={!!pickIds[d.id]}
                        onTap={() => setDet(d)} onPick={() => togglePick(d)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── SEARCH RESULTS ── */}
        {isSearching && (
          <>
            <div className="flex items-baseline justify-between px-8 pt-9 pb-2.5">
              <div>
                <h2 className="font-display text-[26px] font-medium tracking-[.5px] text-ink">Search Results</h2>
                <p className="text-[12px] text-ink3 mt-1">{sorted.length} result{sorted.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;</p>
              </div>
            </div>
            <CategoryChips list={rawList} count={allCount} />
            <ProductGrid list={sorted} />
          </>
        )}

        {/* ── GAPS ── */}
        {!isSearching && sec === 'gaps' && (
          <>
            {/* Summary hero */}
            <div className="mx-8 mt-7 mb-5 rounded-[16px] overflow-hidden relative p-10
              flex items-center justify-between
              bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857]
              before:content-[''] before:absolute before:inset-0
              before:bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,.35)_0%,transparent_55%)]">
              <div className="relative z-[1]">
                <div className="font-display text-[80px] leading-none font-semibold text-white tracking-[-2px]">
                  {gaps.length}
                </div>
                <div className="text-[13px] font-semibold tracking-[2px] uppercase text-white/60 mt-1.5">
                  Gap Opportunities
                </div>
                <p className="text-[14px] text-white/75 mt-2.5 max-w-[340px] leading-relaxed">
                  Products on Amazon.com not yet listed on Amazon.ae — each one is a first-mover advantage.
                </p>
              </div>
              <div className="flex flex-col gap-3 relative z-[1] min-w-[200px]">
                {[
                  { l: 'Avg Markup', v: `${effectiveStats.avgMarkup.toFixed(1)}x` },
                  { l: 'Avg Margin', v: `${Math.round(gaps.reduce((s,p)=>s+p.margin_potential,0)/Math.max(gaps.length,1))}%` },
                  { l: 'AI Confidence', v: `${Math.round(gaps.reduce((s,p)=>s+p.vision_confidence,0)/Math.max(gaps.length,1))}%` },
                ].map(s => (
                  <div key={s.l} className="flex items-center justify-between
                    bg-white/8 rounded-[10px] px-4 py-3 gap-6 border border-white/10">
                    <span className="text-[11px] text-white/55 tracking-[.8px] uppercase whitespace-nowrap">{s.l}</span>
                    <span className="text-[18px] font-bold text-white font-display">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="px-8 mb-5">
              <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-ink4 mb-3">
                Breakdown by Category
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                {Object.entries(
                  gaps.reduce((m,p) => { m[p.temu_category]=(m[p.temu_category]||{count:0,markup:0}); m[p.temu_category].count++; m[p.temu_category].markup+=p.markup_com; return m }, {} as Record<string,{count:number;markup:number}>)
                ).sort((a,b) => b[1].count - a[1].count).map(([c, info]) => {
                  const catIcons: Record<string,string> = { kitchen:'🍳',electronics:'📱',health:'💊',automotive:'🚗',home:'🏠',beauty:'💄',fitness:'💪',pets:'🐾',garden:'🌱' }
                  return (
                    <div key={c} className="bg-card border border-border rounded-[12px] px-5 py-[18px]
                      flex items-center gap-3.5 hover:shadow-card hover:border-border2 transition-all duration-200">
                      <span className="text-[22px] leading-none flex-shrink-0">{catIcons[c] || '🛍'}</span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold tracking-[.5px] capitalize text-ink2 mb-0.5">{c}</div>
                        <div className="text-[22px] font-bold font-display text-green-primary leading-none">{info.count}</div>
                        <div className="text-[11px] text-ink4 mt-0.5">{(info.markup/info.count).toFixed(1)}x avg markup</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA to Finder */}
            <div className="mx-8 mb-7 bg-green-light border border-green-mid rounded-[12px] px-6 py-5
              flex items-center justify-between gap-4">
              <div className="text-[13px] text-green-deeper leading-relaxed">
                <strong className="block text-[14px] font-bold mb-0.5">Ready to act on these opportunities?</strong>
                Use Winning Finder to explore each product with matched Temu sources and margin analysis.
              </div>
              <button onClick={() => navTo('finder')}
                className="px-5 py-2.5 rounded-full text-[12px] font-bold tracking-[.8px] uppercase
                  bg-gradient-to-r from-green-dark to-emerald text-white flex-shrink-0 cursor-pointer
                  hover:opacity-88 transition-opacity border-none">
                Open Winning Finder →
              </button>
            </div>
          </>
        )}

        {/* ── EXISTS / PICKS ── */}
        {!isSearching && (sec === 'exists' || sec === 'picks') && (
          <>
            <div className="flex items-baseline justify-between px-8 pt-9 pb-2.5">
              <div>
                <h2 className="font-display text-[26px] font-medium tracking-[.5px] text-ink">
                  {sec === 'exists' ? 'Competitive Intel' : 'My Picks'}
                </h2>
                <p className="text-[12px] text-ink3 mt-1 tracking-[.5px]">
                  {sec === 'exists' ? 'Already listed on Amazon.ae' : 'Your saved products'}
                </p>
              </div>
            </div>
            <CategoryChips list={rawList} count={allCount} />
            <ProductGrid list={sorted} />
          </>
        )}

        {/* ── INSIGHTS ── */}
        {sec === 'insights' && (
          <div className="px-8 pb-10">
            <div className="pt-9 pb-2.5">
              <h2 className="font-display text-[26px] font-medium tracking-[.5px] text-ink">AI Insights</h2>
              <p className="text-[12px] text-ink3 mt-1 tracking-[.5px]">Claude-powered market intelligence</p>
            </div>

            <div className="grid grid-cols-3 gap-3.5 mb-6">
              {[
                { t: 'Gap Analysis',      d: 'Rank all gap opportunities by launch priority', type: 'gap_analysis' },
                { t: 'Category Recs',     d: 'Which categories to scan next for best ROI',    type: 'category_rec' },
                { t: 'Portfolio Summary', d: 'Analyse your saved picks portfolio',             type: 'portfolio_summary' },
              ].map(c => (
                <button key={c.type}
                  onClick={() => runInsight(c.type)}
                  className={`text-left p-6 rounded-[16px] border cursor-pointer
                    relative overflow-hidden flex flex-col gap-2.5
                    transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]
                    hover:border-green-primary/30 hover:shadow-[0_4px_24px_rgba(0,80,40,.08)] hover:-translate-y-0.5
                    ${insActive === c.type
                      ? 'border-green-primary/40 bg-green-light'
                      : 'bg-card border-border'}`}>
                  <div className="w-[42px] h-[42px] rounded-[12px] bg-green-primary/10
                    flex items-center justify-center text-xl">
                    {c.type === 'gap_analysis' ? '🎯' : c.type === 'category_rec' ? '📊' : '💼'}
                  </div>
                  <div className="font-semibold text-[14px] text-ink">{c.t}</div>
                  <div className="text-[12px] text-ink3 leading-relaxed">{c.d}</div>
                  {insActive === c.type && insLoading && (
                    <div className="flex items-center gap-2 text-[12px] text-green-primary font-medium mt-1">
                      <span className="w-3.5 h-3.5 border-2 border-green-primary/30 border-t-green-primary rounded-full animate-spin" />
                      Analysing…
                    </div>
                  )}
                </button>
              ))}
            </div>

            {insText && (
              <div className="bg-card border border-border rounded-[16px] p-7
                text-[14px] text-ink2 leading-[1.75] max-h-[400px] overflow-y-auto
                [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-medium [&_h1]:text-ink [&_h1]:my-3
                [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-ink [&_h2]:my-3
                [&_h3]:font-display [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-ink [&_h3]:my-2
                [&_strong]:text-ink [&_strong]:font-semibold
                [&_li]:ml-4 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: insText.replace(/\n/g, '<br/>') }}
              />
            )}
          </div>
        )}

        {/* ── SCAN ── */}
        {sec === 'scan' && (
          <div className="px-8 pb-10">
            <div className="pt-9 pb-6">
              <h2 className="font-display text-[26px] font-medium tracking-[.5px] text-ink">Scan Products</h2>
              <p className="text-[12px] text-ink3 mt-1 tracking-[.5px]">Discover new Temu→Amazon.ae opportunities</p>
            </div>

            <div className="bg-card border border-border rounded-[16px] p-8 mb-5 max-w-[640px]">
              <h3 className="font-display text-[20px] font-medium mb-1.5 text-ink">Configure Scan</h3>
              <p className="text-[12px] text-ink3 mb-6 tracking-[.2px]">
                Select a category and minimum sales threshold to focus the scan.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-semibold text-ink4 uppercase tracking-[1.2px] mb-1.5">Category</label>
                  <select value={scCat} onChange={e => setScCat(e.target.value)}
                    className="w-full px-3.5 py-[11px] border border-border rounded-[10px]
                      text-[14px] font-semibold font-sans text-ink bg-bg3 outline-none
                      focus:border-green-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(5,150,105,.15)]
                      transition-all duration-200">
                    <option value="">All Categories</option>
                    {WPF_CATS.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-ink4 uppercase tracking-[1.2px] mb-1.5">Mode</label>
                  <div className="px-3.5 py-[11px] border border-border rounded-[10px] bg-bg3 text-[14px] font-semibold text-ink3">
                    Standard (40 products)
                  </div>
                </div>
              </div>
              <button
                onClick={startScan}
                disabled={scLoading || scSt?.running}
                className="flex items-center gap-2 px-6 py-3 rounded-full
                  bg-gradient-to-r from-green-dark to-emerald text-white
                  text-[12px] font-semibold tracking-[1px] uppercase
                  shadow-[0_4px_20px_rgba(5,150,105,.35)]
                  hover:shadow-[0_6px_28px_rgba(5,150,105,.5)] hover:-translate-y-px
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200">
                {scLoading || scSt?.running
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scanning…</>
                  : <><Icon name="scan" size={14} className="stroke-white" />Start Scan</>
                }
              </button>
            </div>

            {/* Scan progress */}
            {scSt && (
              <div className="bg-card border border-border rounded-[16px] p-8 max-w-[640px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-[18px] font-medium text-ink">Scan Progress</h3>
                  <span className={`text-[11px] font-semibold tracking-[1px] uppercase px-3 py-1 rounded-full
                    ${scSt.running
                      ? 'bg-green-primary/10 text-green-dark border border-green-primary/20'
                      : 'bg-bg3 text-ink4 border border-border'}`}>
                    {scSt.running ? 'Running' : 'Complete'}
                  </span>
                </div>
                <div className="h-2 bg-bg3 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-dark to-emerald transition-all duration-500"
                    style={{ width: scSt.total > 0 ? `${(scSt.processed/scSt.total)*100}%` : '0%' }} />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  {[
                    { n: scSt.processed, l: 'Processed' },
                    { n: scSt.matches,   l: 'Matches'   },
                    { n: scSt.gaps,      l: 'New Gaps'  },
                  ].map(s => (
                    <div key={s.l} className="bg-bg3 rounded-[10px] py-3 border border-border">
                      <div className="font-display text-2xl font-semibold text-green-primary leading-none mb-1">{s.n}</div>
                      <div className="text-[10px] text-ink4 uppercase tracking-[1px]">{s.l}</div>
                    </div>
                  ))}
                </div>
                {scSt.log && (
                  <pre className="bg-bg3 border border-border rounded-[10px] p-4 text-[11px] text-ink3
                    font-mono leading-relaxed max-h-[200px] overflow-y-auto tracking-[.2px]">
                    {scSt.log}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── WINNING FINDER ── */}
        {sec === 'finder' && (
          <div className="pb-10">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3.5 px-8 pt-7">
              {[
                { icon: '🎯', n: wpfTotalGaps,                         l: 'Gap Opportunities', sub: 'Not on Amazon.ae',   cls: 'text-green-primary', bg: 'bg-green-primary/10' },
                { icon: '💰', n: `${wpfAvgMargin}%`,                   l: 'Avg Profit Margin',  sub: 'After Amazon fees',  cls: 'text-gold',          bg: 'bg-gold/10' },
                { icon: '📦', n: wpfTopDemand,                         l: 'High-Demand Items',  sub: 'Demand score 5/5',   cls: 'text-rose',          bg: 'bg-rose/8' },
                { icon: '⭐', n: `${(wpfTotalReviews/1000).toFixed(0)}K+`, l: 'Total Reviews',  sub: 'Across all products', cls: 'text-[#6366f1]',    bg: 'bg-[#6366f1]/8' },
              ].map(s => (
                <div key={s.l} className="bg-card border border-border rounded-[16px] p-5 relative overflow-hidden
                  hover:shadow-card hover:-translate-y-px transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]">
                  <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full opacity-[.06]
                    bg-current" />
                  <div className={`w-9 h-9 rounded-[10px] ${s.bg} flex items-center justify-center text-base mb-3.5`}>
                    {s.icon}
                  </div>
                  <div className={`font-display text-[30px] font-semibold leading-none mb-1 ${s.cls}`}>{s.n}</div>
                  <div className="text-[11px] text-ink4 font-medium tracking-[1px] uppercase">{s.l}</div>
                  <div className="text-[11px] text-green-primary font-medium mt-1">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap px-8 pt-5">
              <div className="flex-1 min-w-[200px] max-w-[380px] relative">
                <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 stroke-ink4" />
                <input type="text" value={wpfQ} onChange={e => setWpfQ(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-[44px] pr-4 py-[11px] border border-border rounded-full
                    text-[13px] font-sans bg-card text-ink outline-none
                    focus:border-green-primary focus:shadow-[0_0_0_3px_rgba(5,150,105,.15)]
                    transition-all duration-200" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {WPF_CATS.map(c => (
                  <button key={c} onClick={() => setWpfCat(c)}
                    className={`px-4 py-[9px] rounded-full border text-[11px] font-semibold tracking-[.8px] uppercase
                      cursor-pointer whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]
                      ${wpfCat === c
                        ? 'bg-gradient-to-r from-green-dark to-emerald text-white border-transparent shadow-[0_4px_14px_rgba(5,150,105,.28)]'
                        : 'border-border text-ink3 hover:border-border2 hover:text-ink2 hover:bg-bg3'}`}>
                    {c === 'all' ? 'All' : c.charAt(0).toUpperCase()+c.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between px-8 pt-4">
              <div className="flex gap-1 bg-bg3 border border-border rounded-full p-1">
                {(['products','analytics','calculator'] as const).map(t => (
                  <button key={t} onClick={() => setWpfTab(t)}
                    className={`px-5 py-2 rounded-full text-[12px] font-semibold tracking-[.5px] capitalize
                      transition-all duration-200
                      ${wpfTab === t
                        ? 'bg-gradient-to-r from-green-dark to-emerald text-white shadow-[0_2px_8px_rgba(5,150,105,.3)]'
                        : 'text-ink3 hover:text-ink2'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* WPF Products grid */}
            {wpfTab === 'products' && (
              <div className="px-8 pt-5 grid grid-cols-3 gap-[18px]">
                {wpfFiltered.map(prod => <WpfCard key={prod.id} prod={prod} />)}
              </div>
            )}

            {/* Calculator tab */}
            {wpfTab === 'calculator' && (
              <div className="px-8 pt-5">
                <div className="bg-card border border-border rounded-[16px] p-8 max-w-[640px] relative overflow-hidden">
                  <div className="absolute top-[-40px] right-[-40px] w-40 h-40
                    bg-[radial-gradient(circle,rgba(5,150,105,.15)_0%,transparent_70%)] pointer-events-none" />
                  <h3 className="font-display text-[22px] font-medium mb-1 text-ink">Profit Calculator</h3>
                  <p className="text-[12px] text-ink3 mb-6 tracking-[.2px]">Estimate margin before you order</p>
                  <div className="grid grid-cols-4 gap-4 items-end">
                    {[
                      { l: 'Sell Price (USD)', v: calcSell, set: setCalcSell, ph: '34.99' },
                      { l: 'Source Cost (USD)', v: calcCost, set: setCalcCost, ph: '9.99' },
                      { l: 'Amazon Fees %', v: calcFees, set: setCalcFees, ph: '15' },
                    ].map(f => (
                      <div key={f.l}>
                        <label className="block text-[10px] font-semibold text-ink4 uppercase tracking-[1.2px] mb-1.5">{f.l}</label>
                        <input type="number" value={f.v} onChange={e => f.set(e.target.value)}
                          placeholder={f.ph}
                          className="w-full px-3.5 py-[11px] border border-border rounded-[10px]
                            text-[14px] font-semibold font-sans text-ink bg-bg3 outline-none
                            focus:border-green-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(5,150,105,.15)]
                            transition-all duration-200" />
                      </div>
                    ))}
                    <div className="bg-gradient-to-r from-green-dark to-emerald rounded-[10px] px-4 py-[11px]
                      flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-white/75">
                        Net Profit
                      </span>
                      <span className="font-display text-[22px] font-semibold text-white whitespace-nowrap">
                        ${calcResult().gross.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-[12px] text-ink3">
                    Margin: <strong className="text-green-primary">{calcResult().margin.toFixed(1)}%</strong>
                    &nbsp;· ROI: <strong className="text-green-primary">
                      {calcCost ? ((calcResult().gross / (parseFloat(calcCost)+1.5))*100).toFixed(0) : '—'}%
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile spacer */}
        <div className="h-[76px] md:hidden" />
      </main>

      {/* Detail panel */}
      <DetailPanel
        det={det}
        picked={!!det && !!pickIds[det.id]}
        onClose={() => setDet(null)}
        onPick={() => det && togglePick(det)}
        onSkip={() => det && skip(det.id)}
      />

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden
        bg-white/97 backdrop-blur-[20px] border-t border-border
        pb-[env(safe-area-inset-bottom,8px)] pt-2 z-[45]
        flex justify-around shadow-[0_-2px_20px_rgba(0,80,40,.08)]">
        {([
          { s:'home'   as Section, icon:'home'    as const, l:'Home'      },
          { s:'gaps'   as Section, icon:'zap'     as const, l:'Gaps'      },
          { s:'exists' as Section, icon:'check'   as const, l:'Intel'     },
          { s:'picks'  as Section, icon:'heart'   as const, l:'Picks'     },
          { s:'finder' as Section, icon:'sparkle' as const, l:'Finder'    },
        ]).map(b => (
          <button key={b.s} onClick={() => navTo(b.s)}
            className={`flex flex-col items-center gap-[3px] text-[10px] font-medium
              px-4 py-2 rounded-[14px] tracking-[.5px] transition-colors duration-200
              ${sec === b.s ? 'text-green-primary' : 'text-ink4'}`}>
            <Icon name={b.icon} size={20} className={sec === b.s ? 'stroke-green-primary' : 'stroke-ink4'} />
            {b.l}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ── WPFCard sub-component ─────────────────────────────────────────────
function WpfCard({ prod }: { prod: WpfProduct }) {
  const BADGE_STYLES: Record<string, string> = {
    trending:    'bg-red-500/10 text-red-600 border border-red-500/20',
    hot:         'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    gap:         'bg-rose/8 text-[#b91c1c] border border-rose/18',
    opportunity: 'bg-green-primary/10 text-green-dark border border-green-primary/20',
    new:         'bg-[#6366f1]/8 text-[#4f46e5] border border-[#6366f1]/18',
  }

  const [amzSrc, setAmzSrc] = useState(prod.amz_img)
  const [temuSrc, setTemuSrc] = useState(prod.temu_img)

  function goImport() {
    openUrl(buildAmzUrl(prod.amz_asin, prod.amz_title))
  }

  return (
    <div className="bg-card border border-border rounded-[16px] overflow-hidden flex flex-col
      transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] animate-fade-in
      hover:border-green-primary/30 hover:shadow-[0_10px_40px_rgba(0,80,40,.1),0_0_0_1px_rgba(5,150,105,.08)]
      hover:-translate-y-1">

      {/* Header */}
      <div className="px-[18px] py-4 border-b border-border flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {prod.badges.map(b => (
            <span key={b} className={`text-[9px] font-bold tracking-[1px] uppercase px-2.5 py-[3px] rounded-full
              ${BADGE_STYLES[b] || 'bg-bg3 text-ink4'}`}>
              {b}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-ink4 font-medium tracking-[.5px] uppercase">Demand</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-[5px] h-[14px] rounded-[2px]
                ${i <= prod.demand ? (prod.demand >= 4 ? 'bg-green-primary' : prod.demand >= 3 ? 'bg-amber-500' : 'bg-rose') : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 border-b border-border">
        {[
          { src: amzSrc, setSrc: setAmzSrc, label: 'Amazon.com', cls: 'bg-amber-500/15 text-amber-800 border-amber-500/25', badge: prod.ae_price ? undefined : 'Not on .ae', side: 'amz' },
          { src: temuSrc, setSrc: setTemuSrc, label: 'Temu Match', cls: 'bg-orange-500/10 text-orange-700 border-orange-500/20', badge: undefined, side: 'temu' },
        ].map(({ src, setSrc, label, cls, badge, side }) => (
          <div key={side} className={`relative aspect-square bg-bg3 flex items-center justify-center overflow-hidden
            ${side === 'amz' ? 'border-r border-border' : ''}`}>
            {src ? (
              <img src={src} alt="" onError={() => setSrc('')}
                className="w-[76%] h-[76%] object-contain object-center
                  transition-transform duration-[400ms] ease-[cubic-bezier(.4,0,.2,1)]
                  group-hover:scale-[1.07]" />
            ) : (
              <span className="text-3xl opacity-40">📦</span>
            )}
            <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-[1px] uppercase
              px-2.5 py-1 rounded-full whitespace-nowrap border ${cls}`}>
              {label}
            </span>
            {badge && (
              <span className="absolute top-2 right-2 text-[9px] font-bold tracking-[.8px] uppercase
                px-2 py-1 rounded-[6px] bg-rose/90 text-white">{badge}</span>
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-[18px] py-4 flex-1 flex flex-col">
        <div className="text-[13px] font-semibold leading-[1.35] text-ink mb-1
          line-clamp-2">{prod.amz_title_short}</div>

        {/* Pricing grid */}
        <div className="grid grid-cols-3 bg-bg3 rounded-[10px] overflow-hidden border border-border mb-3.5">
          {[
            { v: `$${prod.temu_price.toFixed(2)}`, k: 'Temu' },
            { v: `$${prod.amz_price.toFixed(2)}`,  k: 'Amazon' },
            { v: `${prod.margin}%`,                 k: 'Margin', cls: 'text-green-primary' },
          ].map((c, i) => (
            <div key={c.k} className={`px-3 py-2.5 text-center ${i < 2 ? 'border-r border-border' : ''}`}>
              <div className={`text-[15px] font-bold tracking-[-0.3px] text-ink ${c.cls || ''}`}>{c.v}</div>
              <div className="text-[9px] text-ink4 font-medium tracking-[.8px] uppercase mt-0.5">{c.k}</div>
            </div>
          ))}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className="flex gap-[1.5px]">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-[11px] ${i <= Math.round(prod.amz_rating) ? 'text-amber-500' : 'text-border2'}`}>★</span>
            ))}
          </div>
          <span className="text-[11px] text-ink4 tracking-[.2px]">
            {prod.amz_rating.toFixed(1)} ({prod.amz_reviews >= 1000 ? `${(prod.amz_reviews/1000).toFixed(0)}K` : prod.amz_reviews})
          </span>
          <span className="ml-auto text-[10px] font-bold text-green-dark bg-green-light border border-green-mid
            rounded-full px-2.5 py-[2px]">{prod.match_score}% match</span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => openUrl(buildAmzUrl(prod.amz_asin, prod.amz_title))}
              className="px-3 py-2.5 rounded-[10px] text-[11px] font-semibold tracking-[.8px] uppercase
                flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200
                bg-amber-500/8 text-amber-800 border border-amber-500/25
                hover:bg-amber-500/16 hover:border-amber-500/40">
              <Icon name="link" size={12} /> Amazon
            </button>
            <button onClick={() => openUrl(validateTemuUrl(prod.temu_url, prod.temu_title))}
              className="px-3 py-2.5 rounded-[10px] text-[11px] font-semibold tracking-[.8px] uppercase
                flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200
                bg-orange-500/6 text-orange-700 border border-orange-500/20
                hover:bg-orange-500/12 hover:border-orange-500/35">
              <Icon name="link" size={12} /> Temu
            </button>
          </div>
          <button onClick={goImport}
            className="w-full py-2.5 rounded-[10px] text-[11px] font-semibold tracking-[.8px] uppercase
              flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200
              bg-gradient-to-r from-green-dark to-emerald text-white
              shadow-[0_3px_12px_rgba(5,150,105,.25)] hover:shadow-[0_5px_20px_rgba(5,150,105,.38)]
              hover:-translate-y-px">
            <Icon name="plus" size={12} className="stroke-white" /> Add to Picks
          </button>
        </div>
      </div>
    </div>
  )
}

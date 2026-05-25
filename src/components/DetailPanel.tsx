'use client'
import { useCallback, useState } from 'react'
import type { Product } from '@/types'
import { getProductImg, CAT_META, buildAmzUrl, buildAmzAeUrl, validateTemuUrl, openUrl, md2h } from '@/lib/data'
import { api } from '@/lib/api'
import Icon from './Icon'

interface Props {
  det:        Product | null
  picked:     boolean
  onClose:    () => void
  onPick:     () => void
  onSkip:     () => void
}

export default function DetailPanel({ det, picked, onClose, onPick, onSkip }: Props) {
  const [agent,    setAgent]    = useState<string | null>(null)
  const [agLoading, setAgLoading] = useState(false)

  const runAnalysis = useCallback(async () => {
    if (!det) return
    setAgLoading(true)
    const r = await api.post<{ ok: boolean; text: string }>('/agent', {
      type: 'product_analysis', opportunityId: det.id,
    })
    setAgent(r?.text || null)
    setAgLoading(false)
  }, [det])

  if (!det) return null

  const isGap  = det.amz_ae_status === 'GAP'
  const catM   = CAT_META[det.temu_category] || { icon: '🛍', bg: '#f0fdf4' }
  const gross  = Math.max(0, det.amz_com_price - det.temu_price_usd - det.amz_com_price * 0.15 - 1.5)
  const margin = Math.max(0, Math.round((gross / det.amz_com_price) * 100))

  const ImgCell = ({ side }: { side: 'amz' | 'temu' }) => {
    const src0 = getProductImg(det.id, side) || (side === 'temu' ? det.temu_image : det.amz_com_image)
    const [src, setSrc] = useState(src0)
    return (
      <div className="aspect-square bg-white flex items-center justify-center relative overflow-hidden">
        {src ? (
          <img src={src} alt="" onError={() => setSrc('')}
            className="w-[80%] h-[80%] object-contain object-center" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
            style={{ background: catM.bg }}>
            <span className="text-4xl leading-none opacity-55">{catM.icon}</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 text-[9px] font-bold tracking-[1px] uppercase
          px-2 py-1 rounded-full
          ${side === 'temu'
            ? 'bg-orange-500/10 text-orange-700 border border-orange-500/20'
            : 'bg-amber-500/12 text-amber-800 border border-amber-500/25'
          }`}>
          {side === 'temu' ? 'Temu' : 'Amazon'}
        </span>
      </div>
    )
  }

  return (
    <aside className={`fixed top-0 right-0 bottom-0 w-[400px] bg-bg2 border-l border-border
      z-40 overflow-y-auto shadow-[-4px_0_30px_rgba(0,80,40,.1)]
      transition-transform duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]
      ${det ? 'translate-x-0' : 'translate-x-full'}`}>

      {/* Ambient */}
      <div className="sticky top-0 left-0 right-0 h-[200px] pointer-events-none -mb-[200px]
        bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,.15)_0%,transparent_70%)] z-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-7 py-6 border-b border-border
        sticky top-0 bg-white/95 backdrop-blur-[16px] z-[2]">
        <div>
          <h2 className="font-display text-[18px] font-medium tracking-[.5px]">Product Detail</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-[7px] h-[7px] rounded-full inline-block
              ${isGap ? 'bg-rose' : 'bg-green-primary'}`} />
            <span className="text-[11px] text-ink4 tracking-[.4px]">
              {isGap ? 'Gap — Opportunity' : `Listed · ${det.amz_ae_price || ''}`}
            </span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-[10px] border border-border flex items-center justify-center
            hover:bg-bg3 hover:border-border2 transition-all duration-200">
          <Icon name="x" size={15} className="stroke-ink3" />
        </button>
      </div>

      {/* Product match */}
      <div className="p-7 border-b border-border">
        <div className="grid grid-cols-2 gap-2.5">
          {(['temu','amz'] as const).map(side => (
            <div key={side} className="rounded-[12px] border border-border overflow-hidden bg-bg3">
              <ImgCell side={side} />
              <div className="p-2.5">
                <div className="text-[10px] font-semibold text-ink4 uppercase tracking-[1.5px] mb-1">
                  {side === 'temu' ? 'Temu Source' : 'Amazon Match'}
                </div>
                <div className="text-[13px] font-medium truncate">
                  {side === 'temu' ? det.temu_title : det.amz_com_title}
                </div>
                <div className="text-[16px] font-semibold text-ink mt-0.5">
                  ${side === 'temu' ? det.temu_price_usd.toFixed(2) : det.amz_com_price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data rows */}
      <div className="px-7 py-5 border-b border-border space-y-0">
        {[
          { k: 'Status',        v: isGap ? 'Gap — Opportunity' : 'Listed on .ae', cls: isGap ? 'text-rose' : 'text-green-primary' },
          { k: 'Markup',        v: `${det.markup_com}x` },
          { k: 'AI Confidence', v: `${det.vision_confidence}%` },
          { k: 'Temu Sales',    v: det.temu_sold >= 1000 ? `${(det.temu_sold/1000).toFixed(0)}K sold` : `${det.temu_sold} sold` },
          det.amz_ae_price ? { k: '.ae Price', v: `AED ${det.amz_ae_price}` } : null,
          { k: 'Margin Potential', v: `${det.margin_potential}%`, bold: true },
        ].filter(Boolean).map((row) => {
          const r = row!
          return (
            <div key={r.k}
              className={`flex justify-between py-[9px] text-[13px] border-b border-black/[.04] last:border-none
                ${r.bold ? 'font-bold text-[15px] pt-3.5 mt-1.5 border-t border-border' : ''}`}>
              <span className={`${r.bold ? 'text-ink' : 'text-ink3'} tracking-[.3px]`}>{r.k}</span>
              <span className={`font-semibold text-ink ${r.cls || ''}`}>{r.v}</span>
            </div>
          )
        })}
      </div>

      {/* Vision reason */}
      {det.vision_reason && (
        <div className="mx-7 my-4 p-4 bg-green-primary/4 border border-green-primary/12 rounded-[10px]
          text-[15px] text-ink2 italic leading-relaxed font-display">
          &ldquo;{det.vision_reason}&rdquo;
        </div>
      )}

      {/* Profit calc */}
      <div className="px-7 pb-2">
        <div className="rounded-[12px] overflow-hidden border border-border">
          <div className="bg-gradient-to-br from-green-deeper to-green-dark px-4 py-3
            flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-white/60">
              Est. Profit / Unit
            </span>
            <span className="font-display text-2xl font-semibold text-white">${gross.toFixed(2)}</span>
          </div>
          <div className="bg-bg3 divide-y divide-black/[.04]">
            {[
              { k: 'Sell Price (Amazon.com)',  v: `$${det.amz_com_price.toFixed(2)}` },
              { k: 'Source Cost (Temu)',        v: `-$${det.temu_price_usd.toFixed(2)}`, neg: true },
              { k: 'Amazon Fees (~15%)',         v: `-$${(det.amz_com_price * .15).toFixed(2)}`, neg: true },
              { k: 'Est. Shipping',             v: '-$1.50', neg: true },
              { k: 'Net Profit',                v: `$${gross.toFixed(2)}`, pos: true, bold: true },
            ].map(r => (
              <div key={r.k} className={`flex justify-between px-4 py-2.5 text-[13px]
                ${r.bold ? 'font-bold bg-bg2' : ''}`}>
                <span className="text-ink3">{r.k}</span>
                <span className={r.pos ? 'font-semibold text-green-primary' : r.neg ? 'font-semibold text-rose' : 'font-semibold text-ink'}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-7 py-5 flex flex-col gap-2.5">
        <button
          onClick={runAnalysis}
          disabled={agLoading}
          className="w-full py-3.5 rounded-[10px] text-[12px] font-semibold tracking-[1px] uppercase
            flex items-center justify-center gap-2
            border border-green-primary/20 text-green-dark bg-green-primary/5
            hover:bg-green-primary/10 hover:border-green-primary/35
            disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200">
          {agLoading ? <><span className="w-3.5 h-3.5 border-2 border-green-primary/30 border-t-green-dark rounded-full animate-spin" />Analysing…</> : '✦ Analyse This Product'}
        </button>
        <button
          onClick={() => openUrl(isGap ? buildAmzUrl(det.amz_com_asin, det.amz_com_title) : buildAmzAeUrl(det.amz_com_asin, det.amz_com_title))}
          className="w-full py-3.5 rounded-[10px] text-[12px] font-semibold tracking-[1px] uppercase
            bg-gradient-to-br from-green-dark to-emerald text-white
            hover:shadow-[0_6px_28px_rgba(5,150,105,.45)] hover:-translate-y-px
            transition-all duration-200 shadow-[0_4px_20px_rgba(5,150,105,.3)]">
          {isGap ? 'View on Amazon →' : 'View on Amazon.ae →'}
        </button>
        <button
          onClick={() => openUrl(validateTemuUrl(det.temu_url, det.temu_title))}
          className="w-full py-3.5 rounded-[10px] text-[12px] font-semibold tracking-[1px] uppercase
            border border-border text-ink2 hover:bg-bg3 hover:border-border2 transition-all duration-200">
          View on Temu →
        </button>
      </div>

      {/* AI output */}
      {agent && (
        <div className="mx-7 mb-5 p-[18px] bg-green-primary/3 border border-green-primary/10
          rounded-[10px] text-[13px] text-ink2 leading-[1.7] max-h-[320px] overflow-y-auto
          [&_h1]:font-display [&_h1]:text-[16px] [&_h1]:font-medium [&_h1]:text-ink
          [&_h2]:font-display [&_h2]:text-[16px] [&_h2]:font-medium [&_h2]:text-ink
          [&_h3]:font-display [&_h3]:text-[16px] [&_h3]:font-medium [&_h3]:text-ink
          [&_strong]:text-ink [&_strong]:font-semibold
          [&_ul]:pl-4 [&_li]:my-0.5"
          dangerouslySetInnerHTML={{ __html: md2h(agent) }}
        />
      )}

      {/* Save / Skip */}
      <div className="flex gap-2.5 px-7 pb-7">
        <button
          onClick={onPick}
          className={`flex-1 py-3.5 rounded-[10px] text-[12px] font-semibold tracking-[1px] uppercase
            transition-all duration-200
            ${picked
              ? 'border border-green-primary/25 text-green-dark bg-green-primary/8'
              : 'border border-border text-ink2 hover:bg-bg3 hover:border-border2'}`}>
          {picked ? '★ Saved' : '+ Save'}
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3.5 rounded-[10px] text-[12px] font-semibold tracking-[1px] uppercase
            border border-border text-ink4 hover:bg-bg3 hover:border-border2 transition-all duration-200">
          Skip
        </button>
      </div>
    </aside>
  )
}

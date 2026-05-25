'use client'
import { Product } from '@/types'
import { getProductImg, CAT_META } from '@/lib/data'
import { useState } from 'react'

interface Props {
  d:      Product
  picked: boolean
  onTap:  () => void
  onPick: () => void
}

export default function ProductCard({ d, picked, onTap, onPick }: Props) {
  const isGap = d.amz_ae_status === 'GAP'
  const img   = getProductImg(d.id, 'amz') || d.amz_com_image
  const catM  = CAT_META[d.temu_category] || { icon: '🛍', bg: '#f0fdf4' }
  const [imgSrc, setImgSrc] = useState(img)
  const [fbStage, setFbStage] = useState(0)

  function handleImgErr() {
    if (fbStage === 0) {
      const fallback = getProductImg(d.id, 'temu') || d.temu_image
      if (fallback && fallback !== imgSrc) { setImgSrc(fallback); setFbStage(1); return }
    }
    setImgSrc('')
  }

  return (
    <div
      onClick={onTap}
      className="bg-card rounded-[16px] border border-border overflow-hidden cursor-pointer relative
        transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
        hover:-translate-y-[3px] hover:border-green-primary/35 hover:shadow-[0_8px_40px_rgba(0,80,40,.1),0_0_0_1px_rgba(5,150,105,.12)]
        active:-translate-y-[1px] active:scale-[.995]"
    >
      {/* Image */}
      <div className="relative aspect-square bg-bg3 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none z-[1]" />
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={d.amz_com_title}
            onError={handleImgErr}
            className="w-[72%] h-[72%] object-contain object-center transition-transform duration-[400ms] ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
            style={{ background: catM.bg }}
          >
            <span className="text-4xl leading-none opacity-55">{catM.icon}</span>
            <span className="text-[9px] font-bold tracking-[1.2px] uppercase text-ink4 opacity-90 text-center px-2">
              {d.temu_category}
            </span>
          </div>
        )}
        {/* Status tag */}
        <span className={`absolute top-3 left-3 z-[2] text-[10px] font-semibold tracking-[.8px] uppercase py-1 px-3 rounded-full
          ${isGap
            ? 'bg-rose/8 text-[#b91c1c] border border-rose/20'
            : 'bg-green-primary/12 text-green-dark border border-green-primary/25'
          }`}>
          {isGap ? 'Gap' : `${d.vision_confidence}% Match`}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 pb-[18px]">
        <div className="text-[13px] font-medium leading-[1.35] truncate mb-[5px] text-ink tracking-[.2px]">
          {d.amz_com_title || d.temu_title}
        </div>
        <div className="text-[11px] text-ink4 mb-3 tracking-[.3px]">
          {d.temu_sold >= 1000 ? `${(d.temu_sold/1000).toFixed(0)}K` : d.temu_sold} sold · {d.markup_com}x · {d.temu_category}
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[20px] font-semibold tracking-[-0.5px] text-ink">${d.amz_com_price.toFixed(2)}</span>
          <span className="text-[12px] text-ink4 line-through">${d.temu_price_usd.toFixed(2)}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onPick() }}
          className={`w-full py-[11px] rounded-[10px] text-[11px] font-semibold tracking-[1px] uppercase
            flex items-center justify-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]
            ${picked
              ? 'border border-green-primary/25 text-green-dark bg-green-primary/8'
              : 'border border-green-primary/30 text-green-primary hover:bg-gradient-to-br hover:from-green-dark hover:to-emerald hover:text-white hover:border-transparent hover:shadow-[0_4px_16px_rgba(5,150,105,.28)]'
            }`}
        >
          {picked ? '★ Saved' : '+ Save'}
        </button>
      </div>
    </div>
  )
}

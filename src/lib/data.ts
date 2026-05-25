import type { Product, WpfProduct } from '@/types'

// ── ASIN-based image CDN ────────────────────────────────────────────────
export function asinImg(asin: string, size = '_SX500_') {
  if (!asin) return ''
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.${size}.jpg`
}

const PRODUCT_IMGS: Record<string, { amz: string; temu: string }> = {
  p001: { amz: 'B08MQHJHBP', temu: 'B07CXM3CC3' },
  p002: { amz: 'B08BVZY95F', temu: 'B0BGSVHWLS' },
  p003: { amz: 'B07H5GP5GJ', temu: 'B08G3KHWCG' },
  p004: { amz: 'B0BTXRNZS7', temu: 'B0BSMGG7JN' },
  p005: { amz: 'B09P6XL5LY', temu: 'B0C2XHX9Y6' },
  p006: { amz: 'B09B4HR7BY', temu: 'B09TPJQ5MX' },
  p007: { amz: 'B09JTQ4GQ8', temu: 'B0BG6JRYZ9' },
  p008: { amz: 'B07N1HKRLP', temu: 'B07SXKH5CG' },
  p009: { amz: 'B08FW6GVBR', temu: 'B0BNJMQK83' },
  p010: { amz: 'B07RP19LZS', temu: 'B09Q29J9CK' },
  p011: { amz: 'B07P2BGVY2', temu: 'B07GRFNLDP' },
  p012: { amz: 'B01N5QIMMD', temu: 'B082LY3RY4' },
  p013: { amz: 'B09CBRLBKH', temu: 'B0B2TSG6VL' },
  p014: { amz: 'B01AVDVHTI', temu: 'B08G12FLGS' },
  p015: { amz: 'B07G7V13QN', temu: 'B082QW361Y' },
  p016: { amz: 'B01MZEEFNX', temu: 'B08W8VHLXW' },
  w1:   { amz: 'B08MQHJHBP', temu: 'B07CXM3CC3' },
  w2:   { amz: 'B08BVZY95F', temu: 'B0BGSVHWLS' },
  w3:   { amz: 'B07H5GP5GJ', temu: 'B08G3KHWCG' },
  w4:   { amz: 'B0BTXRNZS7', temu: 'B0BSMGG7JN' },
  w5:   { amz: 'B09P6XL5LY', temu: 'B0C2XHX9Y6' },
  w6:   { amz: 'B09B4HR7BY', temu: 'B09TPJQ5MX' },
  w7:   { amz: 'B09JTQ4GQ8', temu: 'B0BG6JRYZ9' },
  w8:   { amz: 'B07N1HKRLP', temu: 'B07SXKH5CG' },
  w9:   { amz: 'B08FW6GVBR', temu: 'B0BNJMQK83' },
  w10:  { amz: 'B07RP19LZS', temu: 'B09Q29J9CK' },
  w11:  { amz: 'B07P2BGVY2', temu: 'B07GRFNLDP' },
  w12:  { amz: 'B01N5QIMMD', temu: 'B082LY3RY4' },
  w13:  { amz: 'B09CBRLBKH', temu: 'B0B2TSG6VL' },
  w14:  { amz: 'B01AVDVHTI', temu: 'B08G12FLGS' },
  w15:  { amz: 'B07G7V13QN', temu: 'B082QW361Y' },
  w16:  { amz: 'B01MZEEFNX', temu: 'B08W8VHLXW' },
}

export function getProductImg(prodId: string, side: 'amz' | 'temu' = 'amz') {
  const entry = PRODUCT_IMGS[prodId]
  if (!entry) return ''
  const asin = side === 'temu' && entry.temu ? entry.temu : entry.amz
  return asinImg(asin)
}

export const CAT_META: Record<string, { icon: string; bg: string }> = {
  kitchen:     { icon: '🍳', bg: '#fef9ec' },
  electronics: { icon: '📱', bg: '#eff6ff' },
  health:      { icon: '💊', bg: '#f0fdf4' },
  automotive:  { icon: '🚗', bg: '#f8fafc' },
  home:        { icon: '🏠', bg: '#faf5ff' },
  beauty:      { icon: '💄', bg: '#fff1f2' },
  fitness:     { icon: '💪', bg: '#f0fdf4' },
  pets:        { icon: '🐾', bg: '#fefce8' },
  garden:      { icon: '🌱', bg: '#f0fdf4' },
}

// ── URL helpers ─────────────────────────────────────────────────────────
export function buildTemuUrl(title: string) {
  if (!title?.trim()) return 'https://www.temu.com'
  return `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(title.trim())}`
}

export function validateTemuUrl(url: string, title: string) {
  if (!url) return buildTemuUrl(title)
  try {
    const parsed = new URL(url)
    if ((parsed.pathname === '/' || !parsed.pathname) && !parsed.search) return buildTemuUrl(title)
    return url
  } catch { return buildTemuUrl(title) }
}

export function buildAmzUrl(asin: string, title: string) {
  if (asin && !/^B09XYZ/.test(asin)) return `https://www.amazon.com/dp/${asin}`
  if (title) return `https://www.amazon.com/s?k=${encodeURIComponent(title.trim())}`
  return 'https://www.amazon.com'
}

export function buildAmzAeUrl(asin: string, title: string) {
  if (asin && /^[A-Z0-9]{10}$/.test(asin)) return `https://www.amazon.ae/dp/${asin}`
  if (title) return `https://www.amazon.ae/s?k=${encodeURIComponent(title.trim())}`
  return 'https://www.amazon.ae'
}

export function openUrl(url: string) {
  if (!url || url === '#') return
  try {
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    if (!w || w.closed) window.location.href = url
  } catch { window.location.href = url }
}

// ── Profit calc ─────────────────────────────────────────────────────────
export function calcProfit(sell: number, cost: number, feesPct = 15, ship = 1.5) {
  const fees  = sell * (feesPct / 100)
  const gross = sell - cost - fees - ship
  const margin = sell > 0 ? (gross / sell) * 100 : 0
  const roi    = (cost + ship) > 0 ? (gross / (cost + ship)) * 100 : 0
  return { fees, gross, margin, roi }
}

export function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  let s = ''
  for (let i = 1; i <= 5; i++) {
    s += i <= full ? '★' : (i === full + 1 && half ? '⭑' : '☆')
  }
  return s
}

export function md2h(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/^- (.+)$/gm,   '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
}

// ── MOCK_PRODUCTS ───────────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  {id:'p001',temu_title:'Stainless Steel Portable Blender USB Rechargeable',temu_category:'kitchen',temu_price_usd:12.99,temu_sold:48200,temu_url:'https://www.temu.com/search_result.html?search_key=Stainless+Steel+Portable+Blender+USB+Rechargeable',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B07CXM3CC3.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07CXM3CC3.01._SX500_.jpg',amz_com_asin:'B08MQHJHBP',amz_com_title:'Portable Blender for Shakes and Smoothies, USB Rechargeable',amz_com_price:34.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B08MQHJHBP.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B08MQHJHBP.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.7,vision_confidence:91,vision_reason:'Matching blender design, same USB port position and color scheme.',margin_potential:62},
  {id:'p002',temu_title:'LED Strip Lights 10M RGB Colour Changing Smart',temu_category:'electronics',temu_price_usd:8.49,temu_sold:124500,temu_url:'https://www.temu.com/search_result.html?search_key=LED+Strip+Lights+10M+RGB+Colour+Changing+Smart',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B0BGSVHWLS.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0BGSVHWLS.01._SX500_.jpg',amz_com_asin:'B08BVZY95F',amz_com_title:'Smart LED Strip Lights 32.8ft RGB App Controlled',amz_com_price:22.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B08BVZY95F.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B08BVZY95F.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.7,vision_confidence:88,vision_reason:'LED density and controller unit identical.',margin_potential:58},
  {id:'p003',temu_title:'Posture Corrector Back Brace Adjustable Adult',temu_category:'health',temu_price_usd:7.99,temu_sold:89300,temu_url:'https://www.temu.com/search_result.html?search_key=Posture+Corrector+Back+Brace+Adjustable+Adult',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B08G3KHWCG.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B08G3KHWCG.01._SX500_.jpg',amz_com_asin:'B07H5GP5GJ',amz_com_title:'Posture Corrector for Women Men, Back Brace Adjustable',amz_com_price:26.95,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B07H5GP5GJ.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07H5GP5GJ.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:3.4,vision_confidence:94,vision_reason:'Strap pattern, back plate shape, and velcro positioning identical.',margin_potential:71},
  {id:'p004',temu_title:'Car Phone Holder Universal Magnetic Dashboard Mount',temu_category:'automotive',temu_price_usd:5.49,temu_sold:212000,temu_url:'https://www.temu.com/search_result.html?search_key=Car+Phone+Holder+Universal+Magnetic+Dashboard+Mount',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B0BSMGG7JN.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0BSMGG7JN.01._SX500_.jpg',amz_com_asin:'B0BTXRNZS7',amz_com_title:'Magnetic Car Phone Mount Dashboard Universal',amz_com_price:16.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B0BTXRNZS7.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0BTXRNZS7.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:3.1,vision_confidence:96,vision_reason:'Exact same magnet array and adhesive base geometry.',margin_potential:68},
  {id:'p005',temu_title:'Silicone Air Fryer Liner Reusable Non-stick Set of 2',temu_category:'kitchen',temu_price_usd:6.29,temu_sold:67400,temu_url:'https://www.temu.com/search_result.html?search_key=Silicone+Air+Fryer+Liner+Reusable+Non-stick+Set+of+2',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B0C2XHX9Y6.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0C2XHX9Y6.01._SX500_.jpg',amz_com_asin:'B09P6XL5LY',amz_com_title:'Silicone Air Fryer Liners Non-Stick Reusable Basket Mats',amz_com_price:19.95,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B09P6XL5LY.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B09P6XL5LY.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:3.2,vision_confidence:89,vision_reason:'Same perforation pattern, handle shape, and silicone texture.',margin_potential:65},
  {id:'p006',temu_title:'Electric Spin Scrubber Cleaning Brush Cordless 360',temu_category:'home',temu_price_usd:24.99,temu_sold:38700,temu_url:'https://www.temu.com/search_result.html?search_key=Electric+Spin+Scrubber+Cleaning+Brush+Cordless+360',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B09TPJQ5MX.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B09TPJQ5MX.01._SX500_.jpg',amz_com_asin:'B09B4HR7BY',amz_com_title:'Electric Spin Scrubber, Cordless Power Bathroom Brush',amz_com_price:49.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B09B4HR7BY.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B09B4HR7BY.01._SX500_.jpg',amz_ae_status:'EXISTS',amz_ae_price:'AED 249',markup_com:2.0,vision_confidence:92,vision_reason:'Motor housing and brush attachment mechanism identical.',margin_potential:45},
  {id:'p007',temu_title:'Wireless Earbuds Bluetooth 5.3 ANC Noise Cancelling',temu_category:'electronics',temu_price_usd:18.99,temu_sold:156000,temu_url:'https://www.temu.com/search_result.html?search_key=Wireless+Earbuds+Bluetooth+5.3+ANC+Noise+Cancelling',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B0BG6JRYZ9.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0BG6JRYZ9.01._SX500_.jpg',amz_com_asin:'B09JTQ4GQ8',amz_com_title:'Wireless Earbuds Bluetooth 5.3 Active Noise Cancelling',amz_com_price:39.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B09JTQ4GQ8.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B09JTQ4GQ8.01._SX500_.jpg',amz_ae_status:'EXISTS',amz_ae_price:'AED 159',markup_com:2.1,vision_confidence:87,vision_reason:'Charging case and earbud stem design match.',margin_potential:48},
  {id:'p008',temu_title:'Jade Facial Roller Rose Quartz Gua Sha Set',temu_category:'beauty',temu_price_usd:4.99,temu_sold:94200,temu_url:'https://www.temu.com/search_result.html?search_key=Jade+Facial+Roller+Rose+Quartz+Gua+Sha+Set',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B07SXKH5CG.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07SXKH5CG.01._SX500_.jpg',amz_com_asin:'B07N1HKRLP',amz_com_title:'Rose Quartz Facial Roller and Gua Sha Scraping Massage Tool',amz_com_price:16.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B07N1HKRLP.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07N1HKRLP.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:3.4,vision_confidence:93,vision_reason:'Handle engravings and roller stone mounting bracket identical.',margin_potential:72},
  {id:'p009',temu_title:'Foldable Laptop Stand Aluminium Adjustable 6 Levels',temu_category:'electronics',temu_price_usd:14.49,temu_sold:72800,temu_url:'https://www.temu.com/search_result.html?search_key=Foldable+Laptop+Stand+Aluminium+Adjustable+6+Levels',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B0BNJMQK83.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0BNJMQK83.01._SX500_.jpg',amz_com_asin:'B08FW6GVBR',amz_com_title:'Portable Laptop Stand Adjustable Aluminum 6-Angle',amz_com_price:32.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B08FW6GVBR.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B08FW6GVBR.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.3,vision_confidence:90,vision_reason:'Hinge mechanism and rubber foot pad pattern match.',margin_potential:55},
  {id:'p010',temu_title:'Garden Kneeler and Seat Foam Padded Foldable',temu_category:'garden',temu_price_usd:19.99,temu_sold:31200,temu_url:'https://www.temu.com/search_result.html?search_key=Garden+Kneeler+and+Seat+Foam+Padded+Foldable',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B09Q29J9CK.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B09Q29J9CK.01._SX500_.jpg',amz_com_asin:'B07RP19LZS',amz_com_title:'Garden Kneeler and Seat with Tool Bag Foldable',amz_com_price:44.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B07RP19LZS.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07RP19LZS.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.3,vision_confidence:85,vision_reason:'Frame tube diameter and foam density indicator matches.',margin_potential:52},
  {id:'p011',temu_title:'Digital Kitchen Scale 10kg Precision Food Scale',temu_category:'kitchen',temu_price_usd:9.99,temu_sold:58900,temu_url:'https://www.temu.com/search_result.html?search_key=Digital+Kitchen+Scale+10kg+Precision+Food+Scale',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B07GRFNLDP.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07GRFNLDP.01._SX500_.jpg',amz_com_asin:'B07P2BGVY2',amz_com_title:'Digital Kitchen Scale with LCD Display 10kg/1g',amz_com_price:24.95,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B07P2BGVY2.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07P2BGVY2.01._SX500_.jpg',amz_ae_status:'EXISTS',amz_ae_price:'AED 89',markup_com:2.5,vision_confidence:97,vision_reason:'Display font, button layout, and platform material identical.',margin_potential:44},
  {id:'p012',temu_title:'Pet Hair Remover Lint Roller Reusable Self-Cleaning',temu_category:'pets',temu_price_usd:3.99,temu_sold:187000,temu_url:'https://www.temu.com/search_result.html?search_key=Pet+Hair+Remover+Lint+Roller+Reusable+Self-Cleaning',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B082LY3RY4.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B082LY3RY4.01._SX500_.jpg',amz_com_asin:'B01N5QIMMD',amz_com_title:'Reusable Lint Roller Pet Hair Remover Self-Cleaning',amz_com_price:12.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B01N5QIMMD.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B01N5QIMMD.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:3.3,vision_confidence:95,vision_reason:'Rubber vane pattern and case slide mechanism identical.',margin_potential:70},
  {id:'p013',temu_title:'Portable Neck Fan Wearable Bladeless Personal Cooler',temu_category:'electronics',temu_price_usd:16.99,temu_sold:43600,temu_url:'https://www.temu.com/search_result.html?search_key=Portable+Neck+Fan+Wearable+Bladeless+Personal+Cooler',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B0B2TSG6VL.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B0B2TSG6VL.01._SX500_.jpg',amz_com_asin:'B09CBRLBKH',amz_com_title:'Bladeless Neck Fan Portable USB Rechargeable Hands Free',amz_com_price:35.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B09CBRLBKH.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B09CBRLBKH.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.1,vision_confidence:88,vision_reason:'Air intake grille pattern and USB-C port placement match.',margin_potential:53},
  {id:'p014',temu_title:'Resistance Bands Set 5 Loop Bands Fabric Booty',temu_category:'fitness',temu_price_usd:8.99,temu_sold:115300,temu_url:'https://www.temu.com/search_result.html?search_key=Resistance+Bands+Set+5+Loop+Bands+Fabric+Booty',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B08G12FLGS.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B08G12FLGS.01._SX500_.jpg',amz_com_asin:'B01AVDVHTI',amz_com_title:'Fabric Resistance Bands Set 5 Loop Bands for Legs and Butt',amz_com_price:24.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B01AVDVHTI.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B01AVDVHTI.01._SX500_.jpg',amz_ae_status:'EXISTS',amz_ae_price:'AED 99',markup_com:2.8,vision_confidence:91,vision_reason:'Fabric texture and stitching pattern identical across all 5 bands.',margin_potential:49},
  {id:'p015',temu_title:'Acupressure Mat and Pillow Set Back Pain Relief',temu_category:'health',temu_price_usd:21.99,temu_sold:26400,temu_url:'https://www.temu.com/search_result.html?search_key=Acupressure+Mat+and+Pillow+Set+Back+Pain+Relief',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B082QW361Y.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B082QW361Y.01._SX500_.jpg',amz_com_asin:'B07G7V13QN',amz_com_title:'Acupressure Mat and Pillow Set for Back and Neck Pain',amz_com_price:49.95,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B07G7V13QN.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B07G7V13QN.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.3,vision_confidence:86,vision_reason:'Spike density, color pattern, and pillow curve shape match exactly.',margin_potential:57},
  {id:'p016',temu_title:'Smart Plug WiFi Outlet 16A Energy Monitor Alexa',temu_category:'electronics',temu_price_usd:7.99,temu_sold:82100,temu_url:'https://www.temu.com/search_result.html?search_key=Smart+Plug+WiFi+Outlet+16A+Energy+Monitor+Alexa',temu_image:'https://images-na.ssl-images-amazon.com/images/P/B08W8VHLXW.01._SX500_.jpg',temu_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B08W8VHLXW.01._SX500_.jpg',amz_com_asin:'B01MZEEFNX',amz_com_title:'Smart Plug WiFi Outlet Works with Alexa Google Home',amz_com_price:21.99,amz_com_image:'https://images-na.ssl-images-amazon.com/images/P/B01MZEEFNX.01._SX500_.jpg',amz_evidence_url:'https://images-na.ssl-images-amazon.com/images/P/B01MZEEFNX.01._SX500_.jpg',amz_ae_status:'GAP',amz_ae_price:null,markup_com:2.8,vision_confidence:93,vision_reason:'PCB layout, LED ring, and button position identical.',margin_potential:63},
]

// ── WPF_PRODUCTS ─────────────────────────────────────────────────────────
export const WPF_PRODUCTS: WpfProduct[] = [
  {id:'w1',category:'kitchen',amz_title:'Portable Blender for Shakes and Smoothies, USB Rechargeable',amz_title_short:'Portable USB Blender',temu_title:'Stainless Steel Portable Blender USB Rechargeable',amz_price:34.99,temu_price:12.99,ae_price:null,amz_asin:'B08MQHJHBP',temu_url:'https://www.temu.com/search_result.html?search_key=Stainless+Steel+Portable+Blender',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B08MQHJHBP.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B07CXM3CC3.01._SX500_.jpg',amz_rating:4.5,amz_reviews:48200,match_score:91,demand:4,margin:62,badges:['trending','gap'],specs:['USB Rechargeable','Stainless Steel Blades','Portable 400ml','BPA-Free','One-Click Operation']},
  {id:'w2',category:'electronics',amz_title:'Smart LED Strip Lights 32.8ft RGB App Controlled',amz_title_short:'Smart RGB LED Strip 32.8ft',temu_title:'LED Strip Lights 10M RGB Colour Changing Smart',amz_price:22.99,temu_price:8.49,ae_price:null,amz_asin:'B08BVZY95F',temu_url:'https://www.temu.com/search_result.html?search_key=LED+Strip+Lights+10M+RGB',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B08BVZY95F.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B0BGSVHWLS.01._SX500_.jpg',amz_rating:4.3,amz_reviews:124500,match_score:88,demand:5,margin:58,badges:['trending','gap'],specs:['10M / 32.8ft Length','RGB 16M Colours','App + Remote Control','Music Sync Mode','Self-Adhesive Backing']},
  {id:'w3',category:'health',amz_title:'Posture Corrector for Women Men, Back Brace Adjustable',amz_title_short:'Posture Corrector Back Brace',temu_title:'Posture Corrector Back Brace Adjustable Adult',amz_price:26.95,temu_price:7.99,ae_price:null,amz_asin:'B07H5GP5GJ',temu_url:'https://www.temu.com/search_result.html?search_key=Posture+Corrector+Back+Brace',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B07H5GP5GJ.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B08G3KHWCG.01._SX500_.jpg',amz_rating:4.4,amz_reviews:89300,match_score:94,demand:4,margin:71,badges:['hot','gap'],specs:['Adjustable Straps','Breathable Material','Unisex Design','Discreet Under Clothing','2 Sizes Available']},
  {id:'w4',category:'automotive',amz_title:'Magnetic Car Phone Mount Dashboard Universal',amz_title_short:'Magnetic Car Phone Mount',temu_title:'Car Phone Holder Universal Magnetic Dashboard Mount',amz_price:16.99,temu_price:5.49,ae_price:null,amz_asin:'B0BTXRNZS7',temu_url:'https://www.temu.com/search_result.html?search_key=Car+Phone+Holder+Universal+Magnetic',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B0BTXRNZS7.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B0BSMGG7JN.01._SX500_.jpg',amz_rating:4.5,amz_reviews:212000,match_score:96,demand:5,margin:68,badges:['trending','gap','opportunity'],specs:['6 Strong Magnets','360° Rotation','Universal Fit','Dashboard + Vent Mount','No Wobble Design']},
  {id:'w5',category:'kitchen',amz_title:'Silicone Air Fryer Liners Non-Stick Reusable Basket Mats',amz_title_short:'Silicone Air Fryer Liners Set of 2',temu_title:'Silicone Air Fryer Liner Reusable Non-stick Set of 2',amz_price:19.95,temu_price:6.29,ae_price:null,amz_asin:'B09P6XL5LY',temu_url:'https://www.temu.com/search_result.html?search_key=Silicone+Air+Fryer+Liner',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B09P6XL5LY.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B0C2XHX9Y6.01._SX500_.jpg',amz_rating:4.6,amz_reviews:67400,match_score:89,demand:4,margin:65,badges:['hot','gap'],specs:['Set of 2','Non-Stick Coating','Dishwasher Safe','480°F Heat Resistant','Fits 4–7qt Fryers']},
  {id:'w6',category:'home',amz_title:'Electric Spin Scrubber, Cordless Power Bathroom Brush',amz_title_short:'Electric Spin Scrubber Cordless',temu_title:'Electric Spin Scrubber Cleaning Brush Cordless 360',amz_price:49.99,temu_price:24.99,ae_price:'AED 249',amz_asin:'B09B4HR7BY',temu_url:'https://www.temu.com/search_result.html?search_key=Electric+Spin+Scrubber',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B09B4HR7BY.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B09TPJQ5MX.01._SX500_.jpg',amz_rating:4.4,amz_reviews:38700,match_score:92,demand:4,margin:45,badges:['hot'],specs:['360° Auto Rotation','4 Brush Heads','Extendable Handle 46"','IPX7 Waterproof','USB-C Charging']},
  {id:'w7',category:'electronics',amz_title:'Wireless Earbuds Bluetooth 5.3 Active Noise Cancelling',amz_title_short:'Wireless ANC Earbuds BT 5.3',temu_title:'Wireless Earbuds Bluetooth 5.3 ANC Noise Cancelling',amz_price:39.99,temu_price:18.99,ae_price:'AED 159',amz_asin:'B09JTQ4GQ8',temu_url:'https://www.temu.com/search_result.html?search_key=Wireless+Earbuds+Bluetooth+5.3+ANC',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B09JTQ4GQ8.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B0BG6JRYZ9.01._SX500_.jpg',amz_rating:4.4,amz_reviews:156000,match_score:87,demand:5,margin:48,badges:['trending'],specs:['Bluetooth 5.3','Active Noise Cancelling','30H Total Playtime','IPX5 Waterproof','Wireless Charging Case']},
  {id:'w8',category:'beauty',amz_title:'Rose Quartz Facial Roller and Gua Sha Scraping Massage Tool',amz_title_short:'Rose Quartz Roller & Gua Sha Set',temu_title:'Jade Facial Roller Rose Quartz Gua Sha Set',amz_price:16.99,temu_price:4.99,ae_price:null,amz_asin:'B07N1HKRLP',temu_url:'https://www.temu.com/search_result.html?search_key=Jade+Facial+Roller+Rose+Quartz',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B07N1HKRLP.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B07SXKH5CG.01._SX500_.jpg',amz_rating:4.5,amz_reviews:94200,match_score:93,demand:4,margin:72,badges:['hot','gap'],specs:['100% Rose Quartz','Dual-End Roller','Gua Sha Tool Included','Gift Box Packaging','Anti-Aging Therapy']},
  {id:'w9',category:'electronics',amz_title:'Portable Laptop Stand Adjustable Aluminum 6-Angle',amz_title_short:'Aluminum Laptop Stand 6-Angle',temu_title:'Foldable Laptop Stand Aluminium Adjustable 6 Levels',amz_price:32.99,temu_price:14.49,ae_price:null,amz_asin:'B08FW6GVBR',temu_url:'https://www.temu.com/search_result.html?search_key=Foldable+Laptop+Stand+Aluminium',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B08FW6GVBR.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B0BNJMQK83.01._SX500_.jpg',amz_rating:4.5,amz_reviews:72800,match_score:90,demand:4,margin:55,badges:['new','gap'],specs:['6 Height Angles','Foldable & Portable','Non-Slip Rubber Pads','Fits 10"–15.6" Laptops','Aluminium Alloy']},
  {id:'w10',category:'garden',amz_title:'Garden Kneeler and Seat with Tool Bag Foldable',amz_title_short:'Garden Kneeler & Seat Foldable',temu_title:'Garden Kneeler and Seat Foam Padded Foldable',amz_price:44.99,temu_price:19.99,ae_price:null,amz_asin:'B07RP19LZS',temu_url:'https://www.temu.com/search_result.html?search_key=Garden+Kneeler+and+Seat+Foam+Padded',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B07RP19LZS.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B09Q29J9CK.01._SX500_.jpg',amz_rating:4.3,amz_reviews:31200,match_score:85,demand:3,margin:52,badges:['new'],specs:['2-in-1 Kneeler + Seat','Thick EVA Foam','Tool Storage Pockets','Folds Flat','330lb Capacity']},
  {id:'w11',category:'kitchen',amz_title:'Digital Kitchen Scale with LCD Display 10kg/1g',amz_title_short:'Digital Kitchen Scale 10kg',temu_title:'Digital Kitchen Scale 10kg Precision Food Scale',amz_price:24.95,temu_price:9.99,ae_price:'AED 89',amz_asin:'B07P2BGVY2',temu_url:'https://www.temu.com/search_result.html?search_key=Digital+Kitchen+Scale+10kg',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B07P2BGVY2.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B07GRFNLDP.01._SX500_.jpg',amz_rating:4.6,amz_reviews:58900,match_score:97,demand:4,margin:44,badges:['trending'],specs:['10kg / 22lb Capacity','1g Precision','Backlit LCD Display','Tare & Unit Conversion','6 Measurement Modes']},
  {id:'w12',category:'pets',amz_title:'Reusable Lint Roller Pet Hair Remover Self-Cleaning',amz_title_short:'Reusable Pet Hair Lint Roller',temu_title:'Pet Hair Remover Lint Roller Reusable Self-Cleaning',amz_price:12.99,temu_price:3.99,ae_price:null,amz_asin:'B01N5QIMMD',temu_url:'https://www.temu.com/search_result.html?search_key=Pet+Hair+Remover+Lint+Roller',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B01N5QIMMD.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B082LY3RY4.01._SX500_.jpg',amz_rating:4.5,amz_reviews:187000,match_score:95,demand:5,margin:70,badges:['trending','gap','opportunity'],specs:['Self-Cleaning Base','No Tape Needed','Works on All Fabrics','Washable & Reusable','Compact Travel Size']},
  {id:'w13',category:'electronics',amz_title:'Bladeless Neck Fan Portable USB Rechargeable Hands Free',amz_title_short:'Bladeless Wearable Neck Fan',temu_title:'Portable Neck Fan Wearable Bladeless Personal Cooler',amz_price:35.99,temu_price:16.99,ae_price:null,amz_asin:'B09CBRLBKH',temu_url:'https://www.temu.com/search_result.html?search_key=Portable+Neck+Fan+Wearable+Bladeless',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B09CBRLBKH.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B0B2TSG6VL.01._SX500_.jpg',amz_rating:4.2,amz_reviews:43600,match_score:88,demand:4,margin:53,badges:['hot','gap'],specs:['Bladeless Design','3 Speed Settings','4000mAh Battery','USB-C Charging','Flexible Wearable Arc']},
  {id:'w14',category:'fitness',amz_title:'Fabric Resistance Bands Set 5 Loop Bands for Legs and Butt',amz_title_short:'Fabric Resistance Bands Set 5pc',temu_title:'Resistance Bands Set 5 Loop Bands Fabric Booty',amz_price:24.99,temu_price:8.99,ae_price:'AED 99',amz_asin:'B01AVDVHTI',temu_url:'https://www.temu.com/search_result.html?search_key=Resistance+Bands+Set+5+Loop+Bands+Fabric',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B01AVDVHTI.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B08G12FLGS.01._SX500_.jpg',amz_rating:4.5,amz_reviews:115300,match_score:91,demand:5,margin:49,badges:['trending'],specs:['5 Resistance Levels','Non-Slip Woven Fabric','Hip & Glute Focused','Mesh Carry Bag','All Fitness Levels']},
  {id:'w15',category:'health',amz_title:'Acupressure Mat and Pillow Set for Back and Neck Pain',amz_title_short:'Acupressure Mat + Pillow Set',temu_title:'Acupressure Mat and Pillow Set Back Pain Relief',amz_price:49.95,temu_price:21.99,ae_price:null,amz_asin:'B07G7V13QN',temu_url:'https://www.temu.com/search_result.html?search_key=Acupressure+Mat+and+Pillow+Set',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B07G7V13QN.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B082QW361Y.01._SX500_.jpg',amz_rating:4.4,amz_reviews:26400,match_score:86,demand:3,margin:57,badges:['new','gap'],specs:['6210 Acupressure Points','Natural Linen Cover','Eco Foam Core','Neck Pillow Included','Carry Bag & Eye Mask']},
  {id:'w16',category:'electronics',amz_title:'Smart Plug WiFi Outlet Works with Alexa Google Home',amz_title_short:'Smart WiFi Plug 16A Alexa',temu_title:'Smart Plug WiFi Outlet 16A Energy Monitor Alexa',amz_price:21.99,temu_price:7.99,ae_price:null,amz_asin:'B01MZEEFNX',temu_url:'https://www.temu.com/search_result.html?search_key=Smart+Plug+WiFi+Outlet+16A',amz_img:'https://images-na.ssl-images-amazon.com/images/P/B01MZEEFNX.01._SX500_.jpg',temu_img:'https://images-na.ssl-images-amazon.com/images/P/B08W8VHLXW.01._SX500_.jpg',amz_rating:4.5,amz_reviews:82100,match_score:93,demand:4,margin:63,badges:['trending','gap'],specs:['16A Max Load','Energy Monitoring','Alexa & Google Home','Timer & Schedule App','Overload Protection']},
]

export const SORTS = [
  { key: 'markup_desc',     label: 'Highest Markup'    },
  { key: 'markup_asc',      label: 'Lowest Markup'     },
  { key: 'margin_desc',     label: 'Best Margin'       },
  { key: 'confidence_desc', label: 'AI Confidence'     },
  { key: 'price_asc',       label: 'Lowest Price'      },
  { key: 'sold_desc',       label: 'Best Selling'      },
] as const

export const WPF_CATS = ['all','electronics','kitchen','health','beauty','home','fitness','automotive','pets','garden'] as const
export const WPF_SORTS = [
  { key: 'margin_desc',  label: 'Best Margin'   },
  { key: 'demand_desc',  label: 'Highest Demand' },
  { key: 'match_desc',   label: 'Best Match'    },
  { key: 'price_asc',   label: 'Lowest Price'  },
  { key: 'reviews_desc', label: 'Most Reviews'  },
] as const

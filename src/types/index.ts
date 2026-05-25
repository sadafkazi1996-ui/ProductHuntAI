export type AeStatus = 'GAP' | 'EXISTS'
export type Section  = 'home' | 'gaps' | 'exists' | 'picks' | 'insights' | 'finder' | 'scan'

export interface Product {
  id:                string
  temu_title:        string
  temu_category:     string
  temu_price_usd:    number
  temu_sold:         number
  temu_url:          string
  temu_image:        string
  temu_evidence_url: string
  amz_com_asin:      string
  amz_com_title:     string
  amz_com_price:     number
  amz_com_image:     string
  amz_evidence_url:  string
  amz_ae_status:     AeStatus
  amz_ae_price:      string | null
  markup_com:        number
  vision_confidence: number
  vision_reason:     string
  margin_potential:  number
}

export interface WpfProduct {
  id:              string
  category:        string
  amz_title:       string
  amz_title_short: string
  temu_title:      string
  amz_price:       number
  temu_price:      number
  ae_price:        string | null
  amz_asin:        string
  temu_url:        string
  amz_img:         string
  temu_img:        string
  amz_rating:      number
  amz_reviews:     number
  match_score:     number
  demand:          number
  margin:          number
  badges:          string[]
  specs:           string[]
}

export interface ScanJob {
  running:   boolean
  processed: number
  total:     number
  matches:   number
  gaps:      number
  log:       string
}

export interface ApiStats {
  total:           number
  gaps:            number
  avgMarkup:       number
  avgMargin:       number
  productsScanned: number
}

export type SortKey =
  | 'markup_desc' | 'markup_asc'
  | 'margin_desc' | 'confidence_desc'
  | 'price_asc'   | 'sold_desc'

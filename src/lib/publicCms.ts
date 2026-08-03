import { useEffect, useMemo, useState } from 'react'
import { organization } from '../content/publicContent'
import { publicApi } from './publicApi'

export type CmsRecord = {
  id: string
  slug?: string
  titleEnglish?: string
  titleUrdu?: string
  excerpt?: string
  image?: string
  status?: string
  content?: Record<string, unknown>
  [key: string]: unknown
}

export type PublicSiteData = {
  cms: CmsRecord[]
  settings: CmsRecord[]
  gallery: CmsRecord[]
  welfare: CmsRecord[]
  leadership: CmsRecord[]
  news: CmsRecord[]
  stats: Record<string, number>
}

const fallbackSite: PublicSiteData = {
  cms: [],
  settings: [],
  gallery: [],
  welfare: [],
  leadership: [],
  news: [],
  stats: {},
}

let cachedSite: PublicSiteData | null = null
let loadingPromise: Promise<PublicSiteData> | null = null

function loadPublicSite() {
  if (cachedSite) return Promise.resolve(cachedSite)
  loadingPromise ??= publicApi<PublicSiteData>('/public/site').then((site) => {
    cachedSite = site
    return site
  })
  return loadingPromise
}

export function invalidatePublicSiteCache() {
  cachedSite = null
  loadingPromise = null
}

export function usePublicSite() {
  const [site, setSite] = useState<PublicSiteData>(cachedSite ?? fallbackSite)

  useEffect(() => {
    let mounted = true
    loadPublicSite()
      .then((data) => mounted && setSite(data))
      .catch(() => mounted && setSite(fallbackSite))
    return () => {
      mounted = false
    }
  }, [])

  return site
}

export function useCmsPage(slug: string) {
  const site = usePublicSite()
  return useMemo(() => site.cms.find((page) => text(page.slug) === slug), [site.cms, slug])
}

export function cmsContent(page?: CmsRecord) {
  return page?.content && typeof page.content === 'object' ? page.content : {}
}

export function cmsValue(page: CmsRecord | undefined, key: string, fallback = '') {
  const content = cmsContent(page)
  return text(content[key] ?? page?.[key]) || fallback
}

export function cmsTitle(page: CmsRecord | undefined, fallback: string) {
  return text(page?.titleEnglish) || cmsValue(page, 'title', fallback)
}

export function cmsText(page: CmsRecord | undefined, fallback: string) {
  return text(page?.excerpt) || cmsValue(page, 'text', '') || cmsValue(page, 'bodyEnglish', '') || fallback
}

export function cmsImage(page: CmsRecord | undefined, fallback: string) {
  return assetPath(page?.image ?? cmsContent(page).image) || fallback
}

export function cmsList(page: CmsRecord | undefined, key: string, fallback: string[]) {
  const value = cmsContent(page)[key]
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const raw = text(value)
  if (!raw) return fallback
  return raw.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
}

export function cmsPairs(page: CmsRecord | undefined, fallback: { title: string; text: string }[]) {
  const rows = cmsList(page, 'items', [])
  if (!rows.length) return fallback
  return rows.map((row, index) => {
    const [title, ...rest] = row.split('|').map((part) => part.trim())
    return {
      title: title || fallback[index]?.title || `Item ${index + 1}`,
      text: rest.join(' | ') || fallback[index]?.text || '',
    }
  })
}

export function settingValue(settings: CmsRecord[], key: string, fallback = '') {
  const value = settings.find((item) => text(item.key) === key)?.value
  return text(value) || fallback
}

export function settingList(settings: CmsRecord[], key: string, fallback: string[]) {
  const value = settings.find((item) => text(item.key) === key)?.value
  return Array.isArray(value) ? value.map(text).filter(Boolean) : fallback
}

export function organizationFromSettings(settings: CmsRecord[]) {
  return {
    ...organization,
    name: settingValue(settings, 'organization_official_name', organization.name),
    phone: settingValue(settings, 'organization_phone', organization.phone),
    email: settingValue(settings, 'organization_email', organization.email),
    address: settingValue(settings, 'organization_office_address', organization.address),
    motto: settingValue(settings, 'organization_motto', organization.motto),
  }
}

export function assetPath(value: unknown) {
  const path = text(value)
  if (!path) return ''
  if (path.startsWith('/') || /^https?:\/\//i.test(path)) return path
  return `/dpo-assets/cms/${path}`
}

export function text(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

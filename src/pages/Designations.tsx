import { BadgeCheck, CalendarDays, FileText, Search, ShieldCheck, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, DetailList, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { designations } from '../content/publicContent'
import { cmsImage, cmsList, cmsPairs, cmsText, cmsTitle, cmsValue, useCmsPage } from '../lib/publicCms'
import { publicApi } from '../lib/publicApi'

type PublicDesignation = {
  id: string
  designation: string
  amount?: number | null
  validityMonths?: number | null
}

const fallbackDesignations: PublicDesignation[] = designations.list.map(([title], index) => ({
  id: `static-${index}`,
  designation: title,
}))

export default function Designations() {
  const page = useCmsPage('designations')
  const metricsPage = useCmsPage('designations-metrics')
  const standardPage = useCmsPage('designations-standard')
  const directoryPage = useCmsPage('designations-directory')
  const notePage = useCmsPage('designations-note')
  const ctaPage = useCmsPage('designations-cta')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<PublicDesignation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const liveItems = items.length ? items : fallbackDesignations
  const filtered = useMemo(() => liveItems.filter((item) => item.designation.toLowerCase().includes(query.toLowerCase())), [liveItems, query])
  const fees = liveItems.map((item) => Number(item.amount)).filter((fee) => Number.isFinite(fee) && fee > 0)
  const validityMonths = liveItems.map((item) => Number(item.validityMonths)).filter((months) => Number.isFinite(months) && months > 0)
  const feeLabel = fees.length ? `PKR ${Math.min(...fees).toLocaleString()}${new Set(fees).size > 1 ? '+' : ''}` : designations.fee
  const durationLabel = validityMonths.length ? `${Math.min(...validityMonths)} month${Math.min(...validityMonths) === 1 ? '' : 's'}${new Set(validityMonths).size > 1 ? '+' : ''}` : designations.duration

  useEffect(() => {
    publicApi<PublicDesignation[]>('/public/designations')
      .then((response) => {
        setItems(response)
        setLoadError('')
      })
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'Designations could not be loaded'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <PageIntro eyebrow={cmsValue(page, 'eyebrow', 'Leadership & Designations')} index={cmsValue(page, 'index', '04')} title={cmsTitle(page, 'Clear roles. Accountable leadership.')} text={cmsText(page, "Explore DPO's public designation structure, role responsibilities and the principles used for controlled leadership allocation.")} image={cmsImage(page, '/dpo-assets/home-hero-v2.jpg')} />

      <section className="dpo-leadership-metrics"><div className="dpo-container"><div><UsersRound size={22} /><span>{cmsValue(metricsPage, 'rolesLabel', 'Published roles')}</span><b>{cmsValue(metricsPage, 'rolesValue', loading ? '...' : String(liveItems.length))}</b></div><div><FileText size={22} /><span>{cmsValue(metricsPage, 'feeLabel', 'Designation fee')}</span><b>{cmsValue(metricsPage, 'feeValue', feeLabel)}</b></div><div><CalendarDays size={22} /><span>{cmsValue(metricsPage, 'durationLabel', 'Appointment duration')}</span><b>{cmsValue(metricsPage, 'durationValue', durationLabel)}</b></div></div></section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-leadership-intro">
          <div><SectionHeader eyebrow={cmsValue(standardPage, 'eyebrow', 'Leadership Standard')} title={cmsTitle(standardPage, 'Responsibility before recognition.')} text={cmsText(standardPage, 'A designation represents a duty to organize, communicate and serve. Every appointment should be based on capability, local need and organizational approval.')} /><Reveal><DetailList items={cmsList(standardPage, 'items', ['Transparent review by authorized administration', 'Clear responsibilities for every role', 'No duplicate active designation in the same area', 'Official branding on approved letters and identity cards'])} /></Reveal></div>
          <Reveal direction="right" className="dpo-leadership-intro__asset"><img src={cmsImage(standardPage, '/dpo-assets/cms/designation-idea.png')} alt="Client-provided designation visual reference" /><span>{cmsValue(standardPage, 'imageCaption', 'Designation design reference')}</span></Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-section--white">
        <div className="dpo-container">
          <div className="dpo-directory-head"><SectionHeader eyebrow={cmsValue(directoryPage, 'eyebrow', 'Role Directory')} title={cmsTitle(directoryPage, 'Find a designation and understand its purpose.')} text={cmsText(directoryPage, 'Search the complete public leadership structure by title or responsibility.')} /><label className="dpo-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={cmsValue(directoryPage, 'searchPlaceholder', 'Search designations')} aria-label="Search designations" /><span>{filtered.length} {cmsValue(directoryPage, 'countLabel', 'roles')}</span></label></div>
          <Stagger className="dpo-role-directory">
            {filtered.map((item, index) => <StaggerItem key={item.id}><article><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{item.designation}</h3><p>{item.amount ? `Amount: PKR ${Number(item.amount).toLocaleString()}` : 'Available for application'}</p></div><BadgeCheck size={21} /></article></StaggerItem>)}
          </Stagger>
          {loadError && <div className="dpo-empty-state"><ShieldCheck size={25} /><h3>Showing saved role copy</h3><p>{loadError}</p></div>}
          {!filtered.length && <div className="dpo-empty-state"><Search size={25} /><h3>No matching designation</h3><p>Try another role name or responsibility.</p></div>}
        </div>
      </section>

      <section className="dpo-section dpo-designation-note"><div className="dpo-container dpo-two-statements">{cmsPairs(notePage, [
        { title: 'Controlled allocation', text: 'Appointments remain subject to formal review and organizational need.' },
        { title: 'Public clarity', text: 'Every applicant should understand the role before requesting a designation.' },
      ]).slice(0, 2).map((item, index) => {
        const Icon = index === 0 ? ShieldCheck : BadgeCheck
        return <Reveal delay={index * 0.12} key={item.title}><article><Icon size={26} /><span>{item.title}</span><h2>{item.text}</h2></article></Reveal>
      })}</div></section>

      <CtaBand
        eyebrow={cmsValue(ctaPage, 'eyebrow', 'Next Step')}
        title={cmsTitle(ctaPage, 'Leadership begins with responsibility.')}
        text={cmsText(ctaPage, 'Choose an active role, provide your service area and submit the required documents for formal review.')}
        primaryHref={cmsValue(ctaPage, 'primaryHref', '/apply/designation')}
        primaryLabel={cmsValue(ctaPage, 'primaryCta', 'Apply for a designation')}
        secondaryHref={cmsValue(ctaPage, 'secondaryHref', '/application-status')}
        secondaryLabel={cmsValue(ctaPage, 'secondaryCta', 'Track an application')}
        backgroundImage={cmsImage(ctaPage, '')}
      />
    </PublicLayout>
  )
}

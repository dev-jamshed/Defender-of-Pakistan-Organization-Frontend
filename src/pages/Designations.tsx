import { BadgeCheck, CalendarDays, FileText, Search, ShieldCheck, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, DetailList, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { designations } from '../content/publicContent'

export default function Designations() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => designations.list.filter(([title, text]) => `${title} ${text}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <PublicLayout>
      <PageIntro eyebrow="Leadership & Designations" index="04" title="Clear roles. Accountable leadership." text="Explore DPO's public designation structure, role responsibilities and the principles used for controlled leadership allocation." image="/dpo-assets/home-hero-v2.jpg" />

      <section className="dpo-leadership-metrics"><div className="dpo-container"><div><UsersRound size={22} /><span>Published roles</span><b>{designations.list.length}</b></div><div><FileText size={22} /><span>Designation fee</span><b>{designations.fee}</b></div><div><CalendarDays size={22} /><span>Appointment duration</span><b>{designations.duration}</b></div></div></section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-leadership-intro">
          <div><SectionHeader eyebrow="Leadership Standard" title="Responsibility before recognition." text="A designation represents a duty to organize, communicate and serve. Every appointment should be based on capability, local need and organizational approval." /><Reveal><DetailList items={['Transparent review by authorized administration', 'Clear responsibilities for every role', 'No duplicate active designation in the same area', 'Official branding on approved letters and identity cards']} /></Reveal></div>
          <Reveal direction="right" className="dpo-leadership-intro__asset"><img src="/dpo-assets/cms/designation-idea.png" alt="Client-provided designation visual reference" /><span>Designation design reference</span></Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-section--white">
        <div className="dpo-container">
          <div className="dpo-directory-head"><SectionHeader eyebrow="Role Directory" title="Find a designation and understand its purpose." text="Search the complete public leadership structure by title or responsibility." /><label className="dpo-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search designations" aria-label="Search designations" /><span>{filtered.length} roles</span></label></div>
          <Stagger className="dpo-role-directory">
            {filtered.map(([title, text], index) => <StaggerItem key={title}><article><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div><BadgeCheck size={21} /></article></StaggerItem>)}
          </Stagger>
          {!filtered.length && <div className="dpo-empty-state"><Search size={25} /><h3>No matching designation</h3><p>Try another role name or responsibility.</p></div>}
        </div>
      </section>

      <section className="dpo-section dpo-designation-note"><div className="dpo-container dpo-two-statements"><Reveal><article><ShieldCheck size={26} /><span>Controlled allocation</span><h2>Appointments remain subject to formal review and organizational need.</h2></article></Reveal><Reveal delay={0.12}><article><BadgeCheck size={26} /><span>Public clarity</span><h2>Every applicant should understand the role before requesting a designation.</h2></article></Reveal></div></section>

      <CtaBand title="Leadership begins with responsibility." text="Choose an active role, provide your service area and submit the required documents for formal review." primaryHref="/apply/designation" primaryLabel="Apply for a designation" secondaryHref="/application-status" secondaryLabel="Track an application" />
    </PublicLayout>
  )
}

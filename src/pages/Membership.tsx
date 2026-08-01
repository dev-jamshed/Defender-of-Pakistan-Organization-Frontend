import { ArrowRight, BadgeCheck, CalendarClock, CreditCard, FileCheck2, FileText, ShieldCheck, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, DetailList, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { cardDesign, membership } from '../content/publicContent'
import { cmsImage, cmsList, cmsText, cmsTitle, organizationFromSettings, settingList, settingValue, useCmsPage, usePublicSite } from '../lib/publicCms'

const membershipDescriptions = [
  'For citizens who want to formally support DPO programs and public activities.',
  'For hands-on contributors ready to assist campaigns, events and welfare initiatives.',
  'For experienced members supporting coordination, planning and organizational delivery.',
  'For long-term supporters making an enduring commitment to the organization.',
]

export default function Membership() {
  const site = usePublicSite()
  const page = useCmsPage('membership')
  const types = settingList(site.settings, 'membership_types', membership.types)
  const docs = settingList(site.settings, 'membership_required_documents', membership.documents)
  const fee = settingValue(site.settings, 'membership_fee_pk', membership.fee)
  const terms = cmsList(page, 'terms', membership.terms)
  const formFields = cmsList(page, 'formFields', membership.formFields)
  return (
    <PublicLayout>
      <PageIntro eyebrow="Membership" index="03" title={cmsTitle(page, 'Belong to something built on service.')} text={cmsText(page, 'Understand the membership types, required documents, terms, fee and approval journey before submitting your application.')} image={cmsImage(page, '/dpo-assets/home-mission-v2.jpg')} />

      <section className="dpo-membership-summary-bar">
        <div className="dpo-container">
          <div><UserPlus size={22} /><span>Membership types</span><b>{types.length} pathways</b></div>
          <div><BadgeCheck size={22} /><span>Membership fee</span><b>{fee}</b></div>
          <div><CalendarClock size={22} /><span>Validity</span><b>{membership.duration}</b></div>
          <div><FileText size={22} /><span>Required documents</span><b>{docs.length} items</b></div>
        </div>
      </section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container">
          <SectionHeader eyebrow="Choose Your Path" title="Membership for every level of contribution." text="Select the route that best reflects how you want to participate in DPO's work." />
          <Stagger className="dpo-membership-types">
            {types.map((type, index) => (
              <StaggerItem key={type}><article><span>{String(index + 1).padStart(2, '0')}</span><UserPlus size={23} /><h3>{type}</h3><p>{membershipDescriptions[index]}</p><small>Official approval required <ArrowRight size={14} /></small></article></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-section--white">
        <div className="dpo-container dpo-application-layout">
          <div className="dpo-application-layout__copy">
            <SectionHeader eyebrow="Application Readiness" title="Prepare once. Apply with confidence." text="Keeping the right information ready reduces delays and makes verification easier for the administration team." />
            <div className="dpo-application-tabs">
              <Reveal><article><FileCheck2 size={21} /><div><h3>Required documents</h3><DetailList items={docs} /></div></article></Reveal>
              <Reveal delay={0.1}><article><FileText size={21} /><div><h3>Application information</h3><DetailList items={formFields} /></div></article></Reveal>
            </div>
          </div>
          <Reveal direction="right" className="dpo-process-panel">
            <span className="dpo-eyebrow">Approval journey</span>
            <h2>Four clear steps to membership.</h2>
            {['Select membership type', 'Provide details and documents', 'Administrative review and approval', 'Receive official member identity'].map((step, index) => <div key={step}><span>0{index + 1}</span><p>{step}</p></div>)}
            <Link className="dpo-button dpo-button--gold" to="/contact">Ask about applying <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-card-identity">
        <div className="dpo-container dpo-card-identity__grid">
          <Reveal direction="left"><MemberCard /></Reveal>
          <div>
            <SectionHeader eyebrow="Official Identity" title="A membership card designed for trust." text="Approved identity details, validity and verification information should remain clear while sensitive personal information stays protected." />
            <div className="dpo-card-identity__details">
              <article><CreditCard size={21} /><div><h3>Front side</h3><DetailList items={cardDesign.front} /></div></article>
              <article><ShieldCheck size={21} /><div><h3>Back side</h3><DetailList items={cardDesign.back} /></div></article>
            </div>
            <Link className="dpo-text-link" to="/card-design">Explore card design <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container">
          <SectionHeader eyebrow="Member Responsibility" title="Membership is a commitment, not just a card." text="Every member is expected to protect the organization's purpose, trust and public reputation." align="center" />
          <Stagger className="dpo-terms-grid">
            {terms.map((term, index) => <StaggerItem key={term}><article><span>0{index + 1}</span><ShieldCheck size={20} /><p>{term}</p></article></StaggerItem>)}
          </Stagger>
        </div>
      </section>

      <CtaBand title="Ready to begin your membership journey?" text="Keep your identity documents ready and complete the guided online application for administrative review." primaryHref="/apply/membership" primaryLabel="Apply for membership" secondaryHref="/application-status" secondaryLabel="Track an application" />
    </PublicLayout>
  )
}

export function MemberCard() {
  const site = usePublicSite()
  const org = organizationFromSettings(site.settings)
  const logo = settingValue(site.settings, 'brand_logo_path', '/dpo-assets/logo-transparent.png')
  return (
    <div className="dpo-member-card">
      <div className="dpo-member-card__flag" />
      <header><img src={logo} alt="" /><div><b>{org.name}</b><span>Organization</span></div><small>MEMBER</small></header>
      <div className="dpo-member-card__body"><div className="dpo-member-card__photo"><UserPlus size={38} /></div><div><span>Member name</span><h3>Muhammad Ali</h3><span>Membership ID</span><b>DPO-PK-01258</b><span>Designation</span><b>General Member</b></div></div>
      <footer><span>{org.motto}</span><BadgeCheck size={20} /></footer>
    </div>
  )
}

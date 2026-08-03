import { ArrowRight, BadgeCheck, CalendarClock, CreditCard, FileCheck2, FileText, ShieldCheck, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, DetailList, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { cardDesign, membership } from '../content/publicContent'
import { cmsImage, cmsList, cmsText, cmsTitle, cmsValue, organizationFromSettings, settingList, settingValue, useCmsPage, usePublicSite } from '../lib/publicCms'

export default function Membership() {
  const site = usePublicSite()
  const page = useCmsPage('membership')
  const summaryPage = useCmsPage('membership-summary')
  const readinessPage = useCmsPage('membership-readiness')
  const cardPage = useCmsPage('membership-card')
  const responsibilityPage = useCmsPage('membership-responsibility')
  const ctaPage = useCmsPage('membership-cta')
  const docs = settingList(site.settings, 'membership_required_documents', membership.documents)
  const fee = settingValue(site.settings, 'membership_fee_pk', membership.fee)
  const terms = cmsList(responsibilityPage, 'items', membership.terms)
  const formFields = cmsList(readinessPage, 'formFields', membership.formFields)
  const readinessSteps = cmsList(readinessPage, 'items', ['Provide personal details', 'Upload required documents', 'Administrative review and approval', 'Receive official member identity'])
  const frontItems = cmsList(cardPage, 'frontItems', cardDesign.front)
  const backItems = cmsList(cardPage, 'backItems', cardDesign.back)
  return (
    <PublicLayout>
      <PageIntro eyebrow={cmsValue(page, 'eyebrow', 'Membership')} index={cmsValue(page, 'index', '03')} title={cmsTitle(page, 'Belong to something built on service.')} text={cmsText(page, 'Understand the required documents, fee and approval journey before submitting your application.')} image={cmsImage(page, '/dpo-assets/home-mission-v2.jpg')} />

      <section className="dpo-membership-summary-bar">
        <div className="dpo-container">
          <div><UserPlus size={22} /><span>{cmsValue(summaryPage, 'memberLabel', 'Membership')}</span><b>{cmsValue(summaryPage, 'memberValue', 'Simple Member')}</b></div>
          <div><BadgeCheck size={22} /><span>{cmsValue(summaryPage, 'feeLabel', 'Membership fee')}</span><b>{cmsValue(summaryPage, 'feeValue', fee)}</b></div>
          <div><CalendarClock size={22} /><span>{cmsValue(summaryPage, 'validityLabel', 'Validity')}</span><b>{cmsValue(summaryPage, 'validityValue', membership.duration)}</b></div>
          <div><FileText size={22} /><span>{cmsValue(summaryPage, 'documentsLabel', 'Required documents')}</span><b>{cmsValue(summaryPage, 'documentsValue', `${docs.length} items`)}</b></div>
        </div>
      </section>

      <section className="dpo-section dpo-section--white" style={sectionBackgroundStyle(cmsImage(readinessPage, ''))}>
        <div className="dpo-container dpo-application-layout">
          <div className="dpo-application-layout__copy">
            <SectionHeader eyebrow={cmsValue(readinessPage, 'eyebrow', 'Application Readiness')} title={cmsTitle(readinessPage, 'Prepare once. Apply with confidence.')} text={cmsText(readinessPage, 'Keeping the right information ready reduces delays and makes verification easier for the administration team.')} />
            <div className="dpo-application-tabs">
              <Reveal><article><FileCheck2 size={21} /><div><h3>{cmsValue(readinessPage, 'documentsTitle', 'Required documents')}</h3><DetailList items={docs} /></div></article></Reveal>
              <Reveal delay={0.1}><article><FileText size={21} /><div><h3>{cmsValue(readinessPage, 'fieldsTitle', 'Application information')}</h3><DetailList items={formFields} /></div></article></Reveal>
            </div>
          </div>
          <Reveal direction="right" className="dpo-process-panel">
            <span className="dpo-eyebrow">{cmsValue(readinessPage, 'panelEyebrow', 'Approval journey')}</span>
            <h2>{cmsValue(readinessPage, 'panelTitle', 'Four clear steps to membership.')}</h2>
            {readinessSteps.map((step, index) => <div key={step}><span>0{index + 1}</span><p>{step}</p></div>)}
            <Link className="dpo-button dpo-button--gold" to={cmsValue(readinessPage, 'primaryHref', '/contact')}>{cmsValue(readinessPage, 'primaryCta', 'Ask about applying')} <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-card-identity" style={sectionBackgroundStyle(cmsImage(cardPage, ''))}>
        <div className="dpo-container dpo-card-identity__grid">
          <Reveal direction="left"><MemberCard /></Reveal>
          <div>
            <SectionHeader eyebrow={cmsValue(cardPage, 'eyebrow', 'Official Identity')} title={cmsTitle(cardPage, 'A membership card designed for trust.')} text={cmsText(cardPage, 'Approved identity details, validity and verification information should remain clear while sensitive personal information stays protected.')} />
            <div className="dpo-card-identity__details">
              <article><CreditCard size={21} /><div><h3>{cmsValue(cardPage, 'frontTitle', 'Front side')}</h3><DetailList items={frontItems} /></div></article>
              <article><ShieldCheck size={21} /><div><h3>{cmsValue(cardPage, 'backTitle', 'Back side')}</h3><DetailList items={backItems} /></div></article>
            </div>
            <Link className="dpo-text-link" to={cmsValue(cardPage, 'primaryHref', '/card-design')}>{cmsValue(cardPage, 'primaryCta', 'Explore card design')} <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="dpo-section dpo-section--paper" style={sectionBackgroundStyle(cmsImage(responsibilityPage, ''))}>
        <div className="dpo-container">
          <SectionHeader eyebrow={cmsValue(responsibilityPage, 'eyebrow', 'Member Responsibility')} title={cmsTitle(responsibilityPage, 'Membership is a commitment, not just a card.')} text={cmsText(responsibilityPage, "Every member is expected to protect the organization's purpose, trust and public reputation.")} align="center" />
          <Stagger className="dpo-terms-grid">
            {terms.map((term, index) => <StaggerItem key={term}><article><span>0{index + 1}</span><ShieldCheck size={20} /><p>{term}</p></article></StaggerItem>)}
          </Stagger>
        </div>
      </section>

      <CtaBand
        eyebrow={cmsValue(ctaPage, 'eyebrow', 'Next Step')}
        title={cmsTitle(ctaPage, 'Ready to begin your membership journey?')}
        text={cmsText(ctaPage, 'Keep your identity documents ready and complete the guided online application for administrative review.')}
        primaryHref={cmsValue(ctaPage, 'primaryHref', '/apply/membership')}
        primaryLabel={cmsValue(ctaPage, 'primaryCta', 'Apply for membership')}
        secondaryHref={cmsValue(ctaPage, 'secondaryHref', '/application-status')}
        secondaryLabel={cmsValue(ctaPage, 'secondaryCta', 'Track an application')}
        backgroundImage={cmsImage(ctaPage, '')}
      />
    </PublicLayout>
  )
}

function sectionBackgroundStyle(image: string) {
  return image ? { backgroundImage: `linear-gradient(0deg, rgba(255, 255, 255, .88), rgba(255, 255, 255, .88)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined
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

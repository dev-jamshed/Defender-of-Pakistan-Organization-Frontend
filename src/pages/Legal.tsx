import { ArrowLeft, ArrowRight, CheckCircle2, FileLock2, Scale, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { legalPolicies } from '../content/publicContent'
import { cmsImage, cmsList, cmsText, cmsTitle, organizationFromSettings, useCmsPage, usePublicSite } from '../lib/publicCms'

export default function Legal() {
  const { slug } = useParams()
  const site = usePublicSite()
  const indexPage = useCmsPage('legal')
  const cmsPolicy = slug ? site.cms.find((page) => String(page.slug) === slug) : undefined
  const fallbackPolicy = legalPolicies.find((policy) => policy.slug === slug)
  const active = cmsPolicy
    ? {
      slug: String(cmsPolicy.slug),
      title: cmsTitle(cmsPolicy, fallbackPolicy?.title ?? 'Legal Policy'),
      summary: cmsText(cmsPolicy, fallbackPolicy?.summary ?? ''),
      points: cmsList(cmsPolicy, 'items', fallbackPolicy?.points ?? []),
    }
    : fallbackPolicy
  return (
    <PublicLayout>
      <PageIntro eyebrow="Legal & Privacy" index="07" title={active ? active.title : cmsTitle(indexPage, 'Clear policies build public trust.')} text={active ? active.summary : cmsText(indexPage, 'Review how DPO handles website use, member information, identity records, payments, refunds and donations.')} image={cmsImage(active ? cmsPolicy : indexPage, '/dpo-assets/home-hero-v2.jpg')} />

      {active ? <PolicyDetail active={active} /> : <PolicyIndex />}

      <CtaBand title="Need clarification on a policy?" text="Contact DPO before submitting sensitive identity information, making a payment or completing an official application." primaryHref="/contact" primaryLabel="Contact DPO" secondaryHref="/membership" secondaryLabel="Membership details" />
    </PublicLayout>
  )
}

function PolicyIndex() {
  return <><section className="dpo-section dpo-section--paper"><div className="dpo-container dpo-legal-overview"><div><SectionHeader eyebrow="Policy Library" title="Protection, transparency and responsible use." text="These pages establish the public rules around information, services and official DPO resources." /><Reveal className="dpo-legal-principles"><article><ShieldCheck size={22} /><div><h3>Privacy by purpose</h3><p>Information should only be collected and used for clear organizational requirements.</p></div></article><article><Scale size={22} /><div><h3>Fair public terms</h3><p>Visitors and members should understand responsibilities before they submit or pay.</p></div></article><article><FileLock2 size={22} /><div><h3>Controlled access</h3><p>Sensitive identity records should only be available to authorized administrators.</p></div></article></Reveal></div><Reveal direction="right" className="dpo-legal-document"><FileLock2 size={44} /><span>DPO</span><h2>Public Policy Handbook</h2><p>Privacy, identity data, public terms, refunds and donations.</p><a href="/dpo-assets/cms/legal-handbook.pdf" target="_blank" rel="noreferrer">Open supplied handbook <ArrowRight size={16} /></a></Reveal></div></section><section className="dpo-section dpo-section--white"><div className="dpo-container"><SectionHeader eyebrow="All Policies" title="Choose a policy to read in detail." align="center" /><Stagger className="dpo-policy-library">{legalPolicies.map((policy, index) => <StaggerItem key={policy.slug}><Link to={`/legal/${policy.slug}`}><span>{String(index + 1).padStart(2, '0')}</span><FileLock2 size={23} /><h3>{policy.title}</h3><p>{policy.summary}</p><small>Read policy <ArrowRight size={14} /></small></Link></StaggerItem>)}</Stagger></div></section></>
}

function PolicyDetail({ active }: { active: (typeof legalPolicies)[number] }) {
  const site = usePublicSite()
  const org = organizationFromSettings(site.settings)
  return <section className="dpo-section dpo-section--paper"><div className="dpo-container dpo-policy-reader"><aside><Link className="dpo-policy-reader__back" to="/legal"><ArrowLeft size={15} /> All policies</Link><span>Policy library</span>{legalPolicies.map((policy) => <Link className={policy.slug === active.slug ? 'active' : ''} to={`/legal/${policy.slug}`} key={policy.slug}>{policy.title}<ArrowRight size={13} /></Link>)}</aside><article><Reveal><span className="dpo-eyebrow">Official public policy</span><h2>{active.title}</h2><p className="dpo-policy-reader__summary">{active.summary}</p></Reveal><div className="dpo-policy-reader__meta"><span>Organization</span><b>{org.name}</b><span>Applies to</span><b>Website visitors, applicants and members</b><span>Status</span><b>Public guidance</b></div><Stagger className="dpo-policy-reader__points">{active.points.map((point, index) => <StaggerItem key={point}><div><span>{String(index + 1).padStart(2, '0')}</span><CheckCircle2 size={20} /><p>{point}</p></div></StaggerItem>)}</Stagger><Reveal className="dpo-policy-reader__notice"><ShieldCheck size={22} /><p>For final legal wording, policy dates and jurisdiction-specific obligations, DPO should obtain review from its authorized legal adviser.</p></Reveal></article></div></section>
}

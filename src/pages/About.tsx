import { ArrowRight, BadgeCheck, Building2, Handshake, Headphones, Mail, MapPin, Phone, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { about, brand, coreValues } from '../content/publicContent'
import { cmsImage, cmsPairs, cmsText, cmsTitle, cmsValue, organizationFromSettings, settingValue, useCmsPage, usePublicSite } from '../lib/publicCms'

export default function About() {
  const site = usePublicSite()
  const page = useCmsPage('about')
  const storyPage = useCmsPage('about-story')
  const beliefsPage = useCmsPage('about-beliefs')
  const valuesPage = useCmsPage('about-values')
  const profilePage = useCmsPage('about-profile')
  const trustPage = useCmsPage('about-trust')
  const ctaPage = useCmsPage('about-cta')
  const org = organizationFromSettings(site.settings)
  const logo = settingValue(site.settings, 'brand_logo_path', brand.assets.logo)
  const values = cmsPairs(valuesPage, coreValues.map(({ title, text }) => ({ title, text })))
  const trustItems = cmsPairs(trustPage, [
    { title: 'Verified identity', text: 'Official membership records can be checked through the connected verification service.' },
    { title: 'Accountable leadership', text: 'Designation applications follow documented area, payment and identity review before approval.' },
    { title: 'Accessible support', text: 'Members and citizens can submit requests, complaints and follow their review status online.' },
  ])
  return (
    <PublicLayout>
      <PageIntro
        eyebrow={cmsValue(page, 'eyebrow', 'About the Organization')}
        index={cmsValue(page, 'index', '01')}
        title={cmsTitle(page, 'Built on service. United by Pakistan.')}
        text={cmsText(page, 'A non-profit, non-political and community-driven organization advancing unity, welfare, education and responsible citizenship.')}
        image={cmsImage(page, '/dpo-assets/home-hero-v2.jpg')}
      />

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-story-layout">
          <Reveal direction="left" className="dpo-story-layout__media">
            <img src={cmsImage(storyPage, '/dpo-assets/home-mission-v2.jpg')} alt="DPO community volunteers at an education activity" />
            <div className="dpo-story-layout__stamp"><span>{cmsValue(storyPage, 'stampTop', 'DPO')}</span><b>{cmsValue(storyPage, 'stampTitle', 'Community first')}</b><small>{cmsValue(storyPage, 'stampText', 'Service across Pakistan')}</small></div>
          </Reveal>
          <div className="dpo-story-layout__copy">
            <SectionHeader eyebrow={cmsValue(storyPage, 'eyebrow', 'Our Story')} title={cmsTitle(storyPage, about.headline)} text={cmsText(storyPage, about.body)} />
            <Reveal className="dpo-pull-quote"><Quote size={24} /><p>{cmsValue(storyPage, 'quote', 'Patriotism becomes meaningful when it is expressed through disciplined, inclusive and consistent public service.')}</p></Reveal>
            <Reveal><Link className="dpo-text-link" to={cmsValue(storyPage, 'primaryHref', '/action-plan')}>{cmsValue(storyPage, 'primaryCta', 'Read our action plan')} <ArrowRight size={17} /></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="dpo-section dpo-belief-section">
        <div className="dpo-container dpo-belief-grid">
          <Reveal><article><span>{cmsValue(beliefsPage, 'missionTitle', 'Mission')}</span><h2>{cmsValue(beliefsPage, 'mission', about.mission)}</h2></article></Reveal>
          <Reveal delay={0.14}><article className="is-vision"><span>{cmsValue(beliefsPage, 'visionTitle', 'Vision')}</span><h2>{cmsValue(beliefsPage, 'vision', about.vision)}</h2></article></Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-section--white">
        <div className="dpo-container dpo-values-editorial">
          <div className="dpo-values-editorial__head">
            <SectionHeader eyebrow={cmsValue(valuesPage, 'eyebrow', 'Core Values')} title={cmsTitle(valuesPage, 'The standards we hold ourselves to.')} text={cmsText(valuesPage, 'Our identity is defined by the way we work, the people we include and the trust we protect.')} />
          </div>
          <Stagger className="dpo-values-editorial__list">
            {values.map(({ title, text }, index) => {
              const fallback = coreValues[index] ?? coreValues[0]
              const Icon = fallback.icon
              return <StaggerItem key={title}><article><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} /><div><h3>{title}</h3><p>{text || fallback.text}</p></div></article></StaggerItem>
            })}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-org-profile">
        <div className="dpo-container">
          <SectionHeader eyebrow={cmsValue(profilePage, 'eyebrow', 'Official Profile')} title={cmsTitle(profilePage, 'Organization and identity details.')} text={cmsText(profilePage, 'The core details visitors, partners and members need to recognize and contact DPO.')} />
          <div className="dpo-org-profile__grid">
            <Reveal className="dpo-org-profile__identity">
              <img src={logo} alt="DPO logo" />
              <div><span>{cmsValue(profilePage, 'nameLabel', 'Official name')}</span><h3>{org.name}</h3><p>{org.motto}</p></div>
            </Reveal>
            <Stagger className="dpo-org-profile__details">
              <StaggerItem><article><Building2 size={20} /><span>{cmsValue(profilePage, 'shortNameLabel', 'Short name')}</span><b>{org.shortName}</b></article></StaggerItem>
              <StaggerItem><article><Phone size={20} /><span>{cmsValue(profilePage, 'phoneLabel', 'Phone / WhatsApp')}</span><b>{org.phone}</b></article></StaggerItem>
              <StaggerItem><article><Mail size={20} /><span>{cmsValue(profilePage, 'emailLabel', 'Official email')}</span><b>{org.email}</b></article></StaggerItem>
              <StaggerItem><article><MapPin size={20} /><span>{cmsValue(profilePage, 'addressLabel', 'Office address')}</span><b>{org.address}</b></article></StaggerItem>
            </Stagger>
          </div>
        </div>
      </section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-public-trust">
          <div className="dpo-public-trust__intro">
            <SectionHeader eyebrow={cmsValue(trustPage, 'eyebrow', 'Public Trust')} title={cmsTitle(trustPage, 'An identity people can verify.')} text={cmsText(trustPage, 'DPO combines recognizable official identity with transparent member services and accessible public support.')} />
            <Reveal><Link className="dpo-text-link" to={cmsValue(trustPage, 'primaryHref', '/member-services?tab=verify')}>{cmsValue(trustPage, 'primaryCta', 'Verify a DPO member')} <ArrowRight size={17} /></Link></Reveal>
          </div>
          <Stagger className="dpo-public-trust__list">
            {trustItems.map((item, index) => {
              const Icon = [BadgeCheck, Handshake, Headphones][index] ?? BadgeCheck
              return <StaggerItem key={item.title}><article><span><Icon size={22} /></span><div><small>{String(index + 1).padStart(2, '0')}</small><h3>{item.title}</h3><p>{item.text}</p></div></article></StaggerItem>
            })}
          </Stagger>
        </div>
      </section>

      <CtaBand
        eyebrow={cmsValue(ctaPage, 'eyebrow', 'Next Step')}
        title={cmsTitle(ctaPage, 'Share the mission. Join the movement.')}
        text={cmsText(ctaPage, 'DPO welcomes people who believe unity, education and service can build a stronger national future.')}
        primaryHref={cmsValue(ctaPage, 'primaryHref', '/membership')}
        primaryLabel={cmsValue(ctaPage, 'primaryCta', 'Explore membership')}
        secondaryHref={cmsValue(ctaPage, 'secondaryHref', '/contact')}
        secondaryLabel={cmsValue(ctaPage, 'secondaryCta', 'Contact DPO')}
        backgroundImage={cmsImage(ctaPage, '')}
      />
    </PublicLayout>
  )
}

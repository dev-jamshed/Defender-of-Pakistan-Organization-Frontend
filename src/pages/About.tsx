import { ArrowRight, BadgeCheck, Building2, Handshake, Headphones, Mail, MapPin, Phone, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { about, brand, coreValues, organization } from '../content/publicContent'

export default function About() {
  return (
    <PublicLayout>
      <PageIntro
        eyebrow="About the Organization"
        index="01"
        title="Built on service. United by Pakistan."
        text="A non-profit, non-political and community-driven organization advancing unity, welfare, education and responsible citizenship."
        image="/dpo-assets/home-hero-v2.jpg"
      />

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-story-layout">
          <Reveal direction="left" className="dpo-story-layout__media">
            <img src="/dpo-assets/home-mission-v2.jpg" alt="DPO community volunteers at an education activity" />
            <div className="dpo-story-layout__stamp"><span>DPO</span><b>Community first</b><small>Service across Pakistan</small></div>
          </Reveal>
          <div className="dpo-story-layout__copy">
            <SectionHeader eyebrow="Our Story" title={about.headline} text={about.body} />
            <Reveal className="dpo-pull-quote"><Quote size={24} /><p>Patriotism becomes meaningful when it is expressed through disciplined, inclusive and consistent public service.</p></Reveal>
            <Reveal><Link className="dpo-text-link" to="/action-plan">Read our action plan <ArrowRight size={17} /></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="dpo-section dpo-belief-section">
        <div className="dpo-container dpo-belief-grid">
          <Reveal><article><span>Mission</span><h2>{about.mission}</h2></article></Reveal>
          <Reveal delay={0.14}><article className="is-vision"><span>Vision</span><h2>{about.vision}</h2></article></Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-section--white">
        <div className="dpo-container dpo-values-editorial">
          <div className="dpo-values-editorial__head">
            <SectionHeader eyebrow="Core Values" title="The standards we hold ourselves to." text="Our identity is defined by the way we work, the people we include and the trust we protect." />
          </div>
          <Stagger className="dpo-values-editorial__list">
            {coreValues.map(({ icon: Icon, title, text }, index) => (
              <StaggerItem key={title}><article><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} /><div><h3>{title}</h3><p>{text}</p></div></article></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-org-profile">
        <div className="dpo-container">
          <SectionHeader eyebrow="Official Profile" title="Organization and identity details." text="The core details visitors, partners and members need to recognize and contact DPO." />
          <div className="dpo-org-profile__grid">
            <Reveal className="dpo-org-profile__identity">
              <img src={brand.assets.logo} alt="DPO logo" />
              <div><span>Official name</span><h3>{organization.name}</h3><p>{organization.motto}</p></div>
            </Reveal>
            <Stagger className="dpo-org-profile__details">
              <StaggerItem><article><Building2 size={20} /><span>Short name</span><b>{organization.shortName}</b></article></StaggerItem>
              <StaggerItem><article><Phone size={20} /><span>Phone / WhatsApp</span><b>{organization.phone}</b></article></StaggerItem>
              <StaggerItem><article><Mail size={20} /><span>Official email</span><b>{organization.email}</b></article></StaggerItem>
              <StaggerItem><article><MapPin size={20} /><span>Office address</span><b>{organization.address}</b></article></StaggerItem>
            </Stagger>
          </div>
        </div>
      </section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-public-trust">
          <div className="dpo-public-trust__intro">
            <SectionHeader eyebrow="Public Trust" title="An identity people can verify." text="DPO combines recognizable official identity with transparent member services and accessible public support." />
            <Reveal><Link className="dpo-text-link" to="/member-services?tab=verify">Verify a DPO member <ArrowRight size={17} /></Link></Reveal>
          </div>
          <Stagger className="dpo-public-trust__list">
            <StaggerItem><article><span><BadgeCheck size={22} /></span><div><small>01</small><h3>Verified identity</h3><p>Official membership records can be checked through the connected verification service.</p></div></article></StaggerItem>
            <StaggerItem><article><span><Handshake size={22} /></span><div><small>02</small><h3>Accountable leadership</h3><p>Designation applications follow documented area, payment and identity review before approval.</p></div></article></StaggerItem>
            <StaggerItem><article><span><Headphones size={22} /></span><div><small>03</small><h3>Accessible support</h3><p>Members and citizens can submit requests, complaints and follow their review status online.</p></div></article></StaggerItem>
          </Stagger>
        </div>
      </section>

      <CtaBand title="Share the mission. Join the movement." text="DPO welcomes people who believe unity, education and service can build a stronger national future." primaryHref="/membership" primaryLabel="Explore membership" secondaryHref="/contact" secondaryLabel="Contact DPO" />
    </PublicLayout>
  )
}

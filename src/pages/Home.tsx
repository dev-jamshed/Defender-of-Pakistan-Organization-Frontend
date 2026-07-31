import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Flag,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem, TextReveal } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, SectionHeader } from '../components/public/PublicUi'
import { about, actionPlan, brand, coreValues, hero, quickStats } from '../content/publicContent'
import { cmsImage, cmsPairs, cmsText, cmsTitle, cmsValue, organizationFromSettings, settingValue, useCmsPage, usePublicSite } from '../lib/publicCms'

const pillars = [
  { icon: Shield, title: 'National strength', text: 'Respect for institutions and rule of law.' },
  { icon: GraduationCap, title: 'Youth leadership', text: 'Preparing responsible future citizens.' },
  { icon: HeartHandshake, title: 'Community service', text: 'Welfare without discrimination.' },
  { icon: BookOpen, title: 'Education', text: 'Knowledge, awareness and civic learning.' },
  { icon: Flag, title: 'National unity', text: 'One identity across every community.' },
]

const heroValues = [
  { icon: Shield, title: 'Patriotism', text: 'Love for country' },
  { icon: Users, title: 'Unity', text: 'Strength in togetherness' },
  { icon: HandHeart, title: 'Service', text: 'Welfare for all' },
  { icon: GraduationCap, title: 'Empowerment', text: 'Youth are the future' },
]

export default function Home() {
  const reduceMotion = useReducedMotion()
  const site = usePublicSite()
  const homePage = useCmsPage('home')
  const whoWeArePage = useCmsPage('home-who-we-are')
  const actionPage = useCmsPage('action-plan')
  const pillarsPage = useCmsPage('home-pillars')
  const impactPage = useCmsPage('home-impact')
  const valuesPage = useCmsPage('home-values')
  const membershipPage = useCmsPage('home-membership-journey')
  const ctaPage = useCmsPage('home-cta')
  const org = organizationFromSettings(site.settings)
  const logo = settingValue(site.settings, 'brand_logo_path', brand.assets.logo)
  const heroTitle = cmsValue(homePage, 'heroTitle', hero.titleLines.join('\n')).split(/\r?\n/).filter(Boolean)
  const homeValues = cmsPairs(homePage, heroValues.map(({ title, text }) => ({ title, text })))
  const pillarItems = cmsPairs(pillarsPage, pillars.map(({ title, text }) => ({ title, text })))
  const valueItems = cmsPairs(valuesPage, coreValues.map(({ title, text }) => ({ title, text })))
  const actionItems = cmsPairs(actionPage, actionPlan.map(({ title, text }) => ({ title, text })))
  const impactItems = cmsPairs(impactPage, quickStats.map(({ label, value }) => ({ title: label, text: value })))
  const journeyItems = cmsPairs(membershipPage, [
    { title: 'Choose your path', text: 'Select the membership type that matches your role and commitment.' },
    { title: 'Verify details', text: 'Submit the required identity and contact information securely.' },
    { title: 'Receive your card', text: 'Approved members receive a clear, official membership identity.' },
    { title: 'Begin serving', text: 'Take part in programs, campaigns and community initiatives.' },
  ])
  const statRows = impactItems.map((item, index) => ({
    label: item.title,
    value: item.text || quickStats[index]?.value || '0',
    icon: quickStats[index]?.icon ?? Users,
  }))

  return (
    <PublicLayout>
      <section className="dpo-home-hero">
        <motion.img
          className="dpo-home-hero__image"
          src={cmsImage(homePage, '/dpo-assets/home-hero-v2.jpg')}
          alt="People serving their community near Minar-e-Pakistan"
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="dpo-home-hero__overlay" />
        <div className="dpo-home-hero__grid-lines" aria-hidden="true" />
        <div className="dpo-container dpo-home-hero__grid">
          <div className="dpo-home-hero__copy">
            <Reveal><div className="dpo-hero-kicker"><span /><b>{org.name}</b><span /></div></Reveal>
            <h1 aria-label={heroTitle.join(' ')}>
              {heroTitle.map((line) => <TextReveal as="span" className="dpo-hero-title-line" key={line}>{line}</TextReveal>)}
            </h1>
            <Reveal delay={0.42}><p>{cmsText(homePage, hero.text)}</p></Reveal>
            <Reveal delay={0.56} className="dpo-actions">
              <Link className="dpo-button dpo-button--gold" to="/apply/membership"><UserPlus size={17} /> {hero.primaryCta}</Link>
              <Link className="dpo-button dpo-button--outline-light" to="/contact"><HandHeart size={17} /> {hero.secondaryCta}</Link>
            </Reveal>
          </div>

          <motion.div
            className="dpo-hero-emblem"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.72, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logo} alt="DPO official emblem" />
            <span>Pakistan Zindabad</span>
          </motion.div>

          <Reveal delay={0.62} direction="right" className="dpo-hero-values">
            {homeValues.slice(0, 4).map((item, index) => {
              const fallback = heroValues[index] ?? heroValues[0]
              const Icon = fallback.icon
              return <div className="dpo-hero-values__item" key={item.title}>
                <span><Icon size={25} /></span>
                <div><strong>{item.title}</strong><small>{item.text}</small></div>
              </div>
            })}
          </Reveal>
        </div>
      </section>

      <section className="dpo-pillars" id="pillars">
        <div className="dpo-container dpo-pillars__grid">
          {pillarItems.map(({ title, text }, index) => {
            const Icon = pillars[index]?.icon ?? Shield
            return (
            <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
              <span>0{index + 1}</span><Icon size={21} /><div><h3>{title}</h3><p>{text}</p></div>
            </motion.article>
          )})}
        </div>
      </section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-home-about">
          <Reveal direction="left" className="dpo-home-about__media">
            <img src={cmsImage(whoWeArePage, '/dpo-assets/home-mission-v2.jpg')} alt="DPO volunteers distributing books" />
            <div className="dpo-home-about__seal"><Sparkles size={19} /><strong>Service-led</strong><span>Across Pakistan</span></div>
            <span className="dpo-home-about__caption">Community. Education. Nation.</span>
          </Reveal>
          <div className="dpo-home-about__content">
            <SectionHeader eyebrow="Who We Are" title={cmsTitle(whoWeArePage, about.headline)} text={cmsText(whoWeArePage, about.body)} />
            <Stagger className="dpo-about-principles">
              <StaggerItem><article><span>01</span><div><h3>Our mission</h3><p>{cmsValue(whoWeArePage, 'mission', about.mission)}</p></div></article></StaggerItem>
              <StaggerItem><article><span>02</span><div><h3>Our vision</h3><p>{cmsValue(whoWeArePage, 'vision', about.vision)}</p></div></article></StaggerItem>
            </Stagger>
            <Reveal delay={0.15}><Link className="dpo-text-link" to="/about">Discover our story <ArrowRight size={17} /></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="dpo-impact-band">
        <div className="dpo-impact-band__texture" aria-hidden="true" />
        <div className="dpo-container dpo-impact-band__head">
          <Reveal><span className="dpo-eyebrow">{cmsValue(impactPage, 'eyebrow', 'Our growing impact')}</span><h2>{cmsTitle(impactPage, 'Progress measured through participation.')}</h2></Reveal>
          <Reveal delay={0.12}><p>{cmsText(impactPage, 'Every number represents people choosing awareness, responsibility and public service.')}</p></Reveal>
        </div>
        <div className="dpo-container dpo-impact-band__grid">
          {statRows.map(({ label, value, icon: Icon }) => <CounterStat key={label} value={value} label={label} icon={Icon} />)}
        </div>
      </section>

      <section className="dpo-section dpo-section--white dpo-values-section">
        <div className="dpo-container">
          <SectionHeader eyebrow="Our Foundation" title={cmsTitle(valuesPage, 'Values that shape every decision.')} text={cmsText(valuesPage, 'Clear principles keep public service accountable, inclusive and focused on long-term national progress.')} />
          <Stagger className="dpo-values-grid">
            {valueItems.map(({ title, text }, index) => {
              const Icon = coreValues[index]?.icon ?? ShieldCheck
              return (
              <StaggerItem key={title}>
                <article className="dpo-value-row"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} /><div><h3>{title}</h3><p>{text}</p></div></article>
              </StaggerItem>
            )})}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-roadmap-home">
        <div className="dpo-container dpo-roadmap-home__layout">
          <div className="dpo-roadmap-home__intro">
            <SectionHeader eyebrow="7-Point Action Plan" title={cmsTitle(actionPage, 'A practical roadmap for a stronger Pakistan.')} text={cmsText(actionPage, 'Seven connected priorities turn a national promise into focused, public-facing action.')} />
            <Link className="dpo-button" to="/action-plan">Explore the plan <ArrowRight size={17} /></Link>
          </div>
          <Stagger className="dpo-roadmap-home__list">
            {actionItems.map(({ title, text }, index) => {
              const fallback = actionPlan[index] ?? actionPlan[0]
              const Icon = fallback.icon
              return (
              <StaggerItem key={title}>
                <Link to="/action-plan" className="dpo-roadmap-home__item">
                  <span>{String(index + 1).padStart(2, '0')}</span><Icon size={20} /><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={17} />
                </Link>
              </StaggerItem>
            )})}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-member-journey">
        <div className="dpo-container">
          <SectionHeader eyebrow="Membership" title={cmsTitle(membershipPage, 'Your service journey starts here.')} text={cmsText(membershipPage, 'A transparent path from choosing your membership type to receiving an official, verifiable identity.')} align="center" />
          <Stagger className="dpo-member-steps">
            {journeyItems.map(({ title, text }, index) => {
              const Icon = [UserPlus, BadgeCheck, CreditCard, CheckCircle2][index] ?? UserPlus
              return <StaggerItem key={title}><article><span>{String(index + 1).padStart(2, '0')}</span><Icon size={25} /><h3>{title}</h3><p>{text}</p></article></StaggerItem>
            })}
          </Stagger>
          <Reveal className="dpo-member-journey__action"><Link className="dpo-button dpo-button--gold" to="/apply/membership">Start membership application <ArrowRight size={17} /></Link></Reveal>
        </div>
      </section>

      <CtaBand
        title={cmsTitle(ctaPage, 'Build the future through service.')}
        text={cmsText(ctaPage, 'Explore DPO membership, leadership roles and national programs, then choose where your contribution can matter most.')}
        primaryHref="/membership"
        primaryLabel="Join the organization"
        secondaryHref="/contact"
        secondaryLabel="Talk to our team"
      />
    </PublicLayout>
  )
}

function CounterStat({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Users }) {
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { once: true, amount: 0.55 })
  const numeric = Number(value.replace(/\D/g, ''))
  const suffix = value.replace(/[\d,]/g, '')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1300
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(Math.round(numeric * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, numeric])

  return <div ref={root} className="dpo-impact-stat"><Icon size={28} /><strong>{count}{suffix}</strong><span>{label}</span></div>
}

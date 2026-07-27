import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Flag,
  GraduationCap,
  HandHeart,
  HeartHandshake,
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

const pillars = [
  { icon: Shield, title: 'National strength', text: 'Respect for institutions and rule of law.' },
  { icon: GraduationCap, title: 'Youth leadership', text: 'Preparing responsible future citizens.' },
  { icon: HeartHandshake, title: 'Community service', text: 'Welfare without discrimination.' },
  { icon: BookOpen, title: 'Education', text: 'Knowledge, awareness and civic learning.' },
  { icon: Flag, title: 'National unity', text: 'One identity across every community.' },
]

export default function Home() {
  const reduceMotion = useReducedMotion()

  return (
    <PublicLayout>
      <section className="dpo-home-hero">
        <motion.img
          className="dpo-home-hero__image"
          src="/dpo-assets/home-hero-v2.jpg"
          alt="People serving their community near Minar-e-Pakistan"
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="dpo-home-hero__overlay" />
        <div className="dpo-home-hero__grid-lines" aria-hidden="true" />
        <div className="dpo-container dpo-home-hero__grid">
          <div className="dpo-home-hero__copy">
            <Reveal><div className="dpo-hero-kicker"><span /> {hero.eyebrow}</div></Reveal>
            <TextReveal>{hero.titleLines.join(' ')}</TextReveal>
            <Reveal delay={0.42}><p>{hero.text}</p></Reveal>
            <Reveal delay={0.56} className="dpo-actions">
              <Link className="dpo-button dpo-button--gold" to="/apply/membership"><UserPlus size={17} /> {hero.primaryCta}</Link>
              <Link className="dpo-button dpo-button--outline-light" to="/about">{hero.secondaryCta}<ArrowRight size={17} /></Link>
            </Reveal>
            <Reveal delay={0.72} className="dpo-hero-trust">
              <div className="dpo-hero-trust__icons"><Shield size={18} /><Users size={18} /><HandHeart size={18} /></div>
              <span>Patriotism</span><i /> <span>Unity</span><i /> <span>Service</span>
            </Reveal>
          </div>

          <motion.div
            className="dpo-hero-emblem"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.72, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="dpo-hero-emblem__ring dpo-hero-emblem__ring--outer" />
            <div className="dpo-hero-emblem__ring dpo-hero-emblem__ring--inner" />
            <img src={brand.assets.logo} alt="DPO official emblem" />
            <span className="dpo-hero-emblem__orbit">DPO</span>
            <div><strong>Serve with pride</strong><small>Together for Pakistan</small></div>
          </motion.div>
        </div>
        <a className="dpo-scroll-cue" href="#pillars"><span>Explore</span><ArrowDown size={17} /></a>
      </section>

      <section className="dpo-pillars" id="pillars">
        <div className="dpo-container dpo-pillars__grid">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
              <span>0{index + 1}</span><Icon size={21} /><div><h3>{title}</h3><p>{text}</p></div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-home-about">
          <Reveal direction="left" className="dpo-home-about__media">
            <img src="/dpo-assets/home-mission-v2.jpg" alt="DPO volunteers distributing books" />
            <div className="dpo-home-about__seal"><Sparkles size={19} /><strong>Service-led</strong><span>Across Pakistan</span></div>
            <span className="dpo-home-about__caption">Community. Education. Nation.</span>
          </Reveal>
          <div className="dpo-home-about__content">
            <SectionHeader eyebrow="Who We Are" title={about.headline} text={about.body} />
            <Stagger className="dpo-about-principles">
              <StaggerItem><article><span>01</span><div><h3>Our mission</h3><p>{about.mission}</p></div></article></StaggerItem>
              <StaggerItem><article><span>02</span><div><h3>Our vision</h3><p>{about.vision}</p></div></article></StaggerItem>
            </Stagger>
            <Reveal delay={0.15}><Link className="dpo-text-link" to="/about">Discover our story <ArrowRight size={17} /></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="dpo-impact-band">
        <div className="dpo-impact-band__texture" aria-hidden="true" />
        <div className="dpo-container dpo-impact-band__head">
          <Reveal><span className="dpo-eyebrow">Our growing impact</span><h2>Progress measured through participation.</h2></Reveal>
          <Reveal delay={0.12}><p>Every number represents people choosing awareness, responsibility and public service.</p></Reveal>
        </div>
        <div className="dpo-container dpo-impact-band__grid">
          {quickStats.map(({ label, value, icon: Icon }) => <CounterStat key={label} value={value} label={label} icon={Icon} />)}
        </div>
      </section>

      <section className="dpo-section dpo-section--white dpo-values-section">
        <div className="dpo-container">
          <SectionHeader eyebrow="Our Foundation" title="Values that shape every decision." text="Clear principles keep public service accountable, inclusive and focused on long-term national progress." />
          <Stagger className="dpo-values-grid">
            {coreValues.map(({ icon: Icon, title, text }, index) => (
              <StaggerItem key={title}>
                <article className="dpo-value-row"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={22} /><div><h3>{title}</h3><p>{text}</p></div></article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-roadmap-home">
        <div className="dpo-container dpo-roadmap-home__layout">
          <div className="dpo-roadmap-home__intro">
            <SectionHeader eyebrow="7-Point Action Plan" title="A practical roadmap for a stronger Pakistan." text="Seven connected priorities turn a national promise into focused, public-facing action." />
            <Link className="dpo-button" to="/action-plan">Explore the plan <ArrowRight size={17} /></Link>
          </div>
          <Stagger className="dpo-roadmap-home__list">
            {actionPlan.map(({ title, text, icon: Icon }, index) => (
              <StaggerItem key={title}>
                <Link to="/action-plan" className="dpo-roadmap-home__item">
                  <span>{String(index + 1).padStart(2, '0')}</span><Icon size={20} /><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={17} />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="dpo-section dpo-member-journey">
        <div className="dpo-container">
          <SectionHeader eyebrow="Membership" title="Your service journey starts here." text="A transparent path from choosing your membership type to receiving an official, verifiable identity." align="center" />
          <Stagger className="dpo-member-steps">
            {[
              { icon: UserPlus, no: '01', title: 'Choose your path', text: 'Select the membership type that matches your role and commitment.' },
              { icon: BadgeCheck, no: '02', title: 'Verify details', text: 'Submit the required identity and contact information securely.' },
              { icon: CreditCard, no: '03', title: 'Receive your card', text: 'Approved members receive a clear, official membership identity.' },
              { icon: CheckCircle2, no: '04', title: 'Begin serving', text: 'Take part in programs, campaigns and community initiatives.' },
            ].map(({ icon: Icon, no, title, text }) => (
              <StaggerItem key={title}><article><span>{no}</span><Icon size={25} /><h3>{title}</h3><p>{text}</p></article></StaggerItem>
            ))}
          </Stagger>
          <Reveal className="dpo-member-journey__action"><Link className="dpo-button dpo-button--gold" to="/apply/membership">Start membership application <ArrowRight size={17} /></Link></Reveal>
        </div>
      </section>

      <CtaBand
        title="Build the future through service."
        text="Explore DPO membership, leadership roles and national programs, then choose where your contribution can matter most."
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

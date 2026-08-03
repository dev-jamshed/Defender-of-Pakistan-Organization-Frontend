import { ArrowRight, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router-dom'
import { ParallaxMedia, Reveal, StaggerItem, TextReveal } from './Motion'

export function PageIntro({ eyebrow, title, text, image, index = 'DPO' }: { eyebrow: string; title: string; text: string; image?: string; index?: string }) {
  return (
    <section className="dpo-page-intro">
      {image && <img src={image} alt="" />}
      <div className="dpo-page-intro__overlay" />
      <div className="dpo-container dpo-page-intro__content">
        <Reveal>
          <div className="dpo-page-intro__meta"><span>{index}</span><i /> <span>{eyebrow}</span></div>
        </Reveal>
        <TextReveal>{title}</TextReveal>
        <Reveal delay={0.28}><p>{text}</p></Reveal>
      </div>
      <span className="dpo-page-intro__mark" aria-hidden="true">{index}</span>
    </section>
  )
}

export function SectionHeader({ eyebrow, title, text, align = 'left' }: { eyebrow: string; title: string; text?: string; align?: 'left' | 'center' }) {
  return (
    <div className={`dpo-section-header ${align === 'center' ? 'is-centered' : ''}`}>
      <Reveal><span className="dpo-eyebrow">{eyebrow}</span></Reveal>
      <TextReveal as="h2" delay={0}>{title}</TextReveal>
      {text && <Reveal delay={0.12}><p>{text}</p></Reveal>}
    </div>
  )
}

export function IconCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <StaggerItem>
      <article className="dpo-icon-card">
        <span><Icon size={22} /></span>
        <h3>{title}</h3>
        <p>{text}</p>
      </article>
    </StaggerItem>
  )
}

export function SplitSection({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  reverse = false,
  children,
}: {
  eyebrow: string
  title: string
  text: string
  image: string
  imageAlt: string
  reverse?: boolean
  children?: React.ReactNode
}) {
  return (
    <section className="dpo-section">
      <div className={`dpo-container dpo-split ${reverse ? 'is-reverse' : ''}`}>
        <ParallaxMedia className="dpo-split__media">
          <img src={image} alt={imageAlt} />
          <span className="dpo-split__media-line" aria-hidden="true" />
        </ParallaxMedia>
        <Reveal className="dpo-split__content" direction={reverse ? 'left' : 'right'}>
          <SectionHeader eyebrow={eyebrow} title={title} text={text} />
          {children}
        </Reveal>
      </div>
    </section>
  )
}

export function CtaBand({ title, text, primaryHref, primaryLabel, secondaryHref, secondaryLabel, eyebrow = 'Next Step', backgroundImage }: {
  title: string
  text: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  eyebrow?: string
  backgroundImage?: string
}) {
  return (
    <section className="dpo-cta-band" style={backgroundImage ? { backgroundImage: `linear-gradient(90deg, rgba(12, 113, 72, .94), rgba(5, 45, 29, .82)), url(${backgroundImage})` } : undefined}>
      <div className="dpo-container dpo-cta-band__inner">
        <div>
          <span className="dpo-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="dpo-actions">
          <Link className="dpo-button dpo-button--light" to={primaryHref}>{primaryLabel}<ArrowRight size={17} /></Link>
          {secondaryHref && secondaryLabel && <Link className="dpo-button dpo-button--ghost-light" to={secondaryHref}>{secondaryLabel}</Link>}
        </div>
      </div>
    </section>
  )
}

export function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="dpo-check-list">
      {items.map((item) => <li key={item}><span><Check size={13} /></span>{item}</li>)}
    </ul>
  )
}

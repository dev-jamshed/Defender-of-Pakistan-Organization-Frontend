import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Camera,
  CreditCard,
  FileWarning,
  LockKeyhole,
  Mail,
  Menu,
  Phone,
  Play,
  RefreshCw,
  Search,
  Share2,
  UserPlus,
  X,
} from 'lucide-react'
import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { brand, navLinks } from '../../content/publicContent'
import { organizationFromSettings, settingValue, usePublicSite } from '../../lib/publicCms'
import '../../styles/home.css'

type PublicLayoutProps = {
  children: React.ReactNode
}

const primaryLinks = navLinks.filter((link) => !['/card-design', '/legal', '/contact', '/member-services'].includes(link.href))

type HeaderMenuItem = {
  label: string
  href: string
  description: string
  icon: LucideIcon
}

const joinLinks: HeaderMenuItem[] = [
  { label: 'Membership', href: '/membership', description: 'Explore membership options', icon: UserPlus },
  { label: 'Apply for Designation', href: '/apply/designation', description: 'Request a leadership role', icon: BadgeCheck },
  { label: 'Membership Renewal', href: '/member-services?tab=renewal', description: 'Renew an existing membership', icon: RefreshCw },
  { label: 'Card Replacement', href: '/member-services?tab=card', description: 'Replace a lost or damaged card', icon: CreditCard },
]

const verificationLinks: HeaderMenuItem[] = [
  { label: 'Member Verification', href: '/member-services?tab=verify', description: 'Check an official member record', icon: BadgeCheck },
  { label: 'Track Application', href: '/application-status', description: 'Follow membership or designation review', icon: Search },
  { label: 'Track Complaint', href: '/member-services?tab=track-complaint', description: 'Check a complaint status', icon: FileWarning },
]

const headerMoreLinks: HeaderMenuItem[] = [
  { label: 'About DPO', href: '/about', description: 'Mission, vision and official profile', icon: BadgeCheck },
  { label: 'Action Plan', href: '/action-plan', description: 'Explore the seven-point roadmap', icon: Search },
  { label: 'Card Design', href: '/card-design', description: 'View the official member card', icon: CreditCard },
  { label: 'Legal Policies', href: '/legal', description: 'Privacy, terms and public policies', icon: LockKeyhole },
  { label: 'Contact DPO', href: '/contact', description: 'Reach the organization directly', icon: Mail },
]

const mobileSections = [
  { label: 'Explore', links: [{ label: 'Home', href: '/' }, { label: 'Gallery', href: '/gallery' }] },
  { label: 'Join Us', links: joinLinks },
  { label: 'Verification', links: verificationLinks },
  { label: 'Public Support', links: [{ label: 'Submit Complaint', href: '/member-services?tab=complaint' }] },
  { label: 'Organization', links: headerMoreLinks },
]

export default function PublicLayout({ children }: PublicLayoutProps) {
  const site = usePublicSite()
  const org = organizationFromSettings(site.settings)
  const logo = settingValue(site.settings, 'brand_logo_path', brand.assets.logo)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, search } = useLocation()
  const currentUrl = `${pathname}${search}`
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="dpo-site">
      <motion.div className="dpo-scroll-progress" style={{ scaleX: progress }} />
      <a className="dpo-skip-link" href="#main-content">Skip to content</a>
      <header className={`dpo-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="dpo-topbar">
          <div className="dpo-container dpo-topbar__inner">
            <div className="dpo-topbar__contact">
              <a href={`tel:${org.phone.replace(/\s/g, '')}`}><Phone size={13} /> {org.phone}</a>
              <a href={`mailto:${org.email}`}><Mail size={13} /> {org.email}</a>
            </div>
            <div className="dpo-topbar__right">
              <span>{org.motto}</span>
              <div className="dpo-socials" aria-label="Social media">
                <a href="#" aria-label="Facebook"><Share2 size={13} /></a>
                <a href="#" aria-label="Instagram"><Camera size={13} /></a>
                <a href="#" aria-label="YouTube"><Play size={13} /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="dpo-navbar">
          <div className="dpo-container dpo-navbar__inner">
            <Link to="/" className="dpo-brand">
              <img src={logo} alt={`${org.name} logo`} />
              <span>
                <b>{org.name}</b>
                <small>DPO</small>
              </span>
            </Link>

            <nav className="dpo-nav" aria-label="Main navigation">
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
              <HeaderDropdown label="Join Us" links={joinLinks} currentUrl={currentUrl} align="left" />
              <NavLink to="/gallery" className={({ isActive }) => isActive ? 'active' : undefined}>Gallery</NavLink>
              <HeaderDropdown label="Verification" links={verificationLinks} currentUrl={currentUrl} />
              <Link className={currentUrl === '/member-services?tab=complaint' ? 'active' : ''} to="/member-services?tab=complaint">Complaint</Link>
              <HeaderDropdown label="More" links={headerMoreLinks} currentUrl={currentUrl} includeAdmin />
              <Link className="dpo-nav__cta" to="/apply/membership">Join DPO <ArrowRight size={15} /></Link>
            </nav>

            <button className="dpo-menu-button" type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
              <Menu size={23} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="dpo-mobile-layer" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="dpo-mobile-layer__shade" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
            <motion.aside className="dpo-mobile-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 34, stiffness: 300, mass: .85 }}>
              <div className="dpo-mobile-drawer__head">
                <Link to="/" className="dpo-brand" onClick={() => setDrawerOpen(false)}>
                  <img src={logo} alt="" />
                  <span><b>DPO</b><small>{org.motto}</small></span>
                </Link>
                <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
              </div>
              <nav className="dpo-mobile-nav">
                {mobileSections.map((section, sectionIndex) => (
                  <section className="dpo-mobile-nav__section" key={section.label}>
                    <small>{section.label}</small>
                    {section.links.map((link, linkIndex) => (
                      <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + (sectionIndex * 0.04) + (linkIndex * 0.025) }}>
                        <Link className={headerLinkActive(link.href, currentUrl) ? 'active' : ''} to={link.href} onClick={() => setDrawerOpen(false)}><span>{String(linkIndex + 1).padStart(2, '0')}</span>{link.label}<ArrowRight size={16} /></Link>
                      </motion.div>
                    ))}
                  </section>
                ))}
              </nav>
              <div className="dpo-mobile-drawer__footer">
                <Link to="/admin" onClick={() => setDrawerOpen(false)}><LockKeyhole size={16} /> Admin login</Link>
                <a href={`mailto:${org.email}`}>{org.email}</a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  )
}

function HeaderDropdown({ label, links, currentUrl, align, includeAdmin = false }: { label: string; links: HeaderMenuItem[]; currentUrl: string; align?: 'left'; includeAdmin?: boolean }) {
  const active = links.some((link) => headerLinkActive(link.href, currentUrl))
  return (
    <div className={`dpo-nav__more ${align === 'left' ? 'align-left' : ''}`}>
      <button type="button" className={active ? 'active' : ''} aria-haspopup="menu">
        {label} <ChevronDown size={14} />
      </button>
      <div className="dpo-nav__dropdown" role="menu">
        {links.map(({ label: itemLabel, href, description, icon: Icon }) => (
          <Link className={headerLinkActive(href, currentUrl) ? 'active' : ''} key={href} to={href} role="menuitem">
            <Icon size={17} />
            <span><b>{itemLabel}</b><small>{description}</small></span>
          </Link>
        ))}
        {includeAdmin && <Link className="dpo-nav__admin" to="/admin"><LockKeyhole size={17} /><span><b>Admin Login</b><small>Authorized access only</small></span></Link>}
      </div>
    </div>
  )
}

function headerLinkActive(href: string, currentUrl: string) {
  const [targetPath, targetQuery] = href.split('?')
  const [currentPath] = currentUrl.split('?')
  return targetQuery ? currentUrl === href : currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`))
}

function PublicFooter() {
  const site = usePublicSite()
  const org = organizationFromSettings(site.settings)
  const logo = settingValue(site.settings, 'brand_logo_path', brand.assets.logo)
  return (
    <footer className="dpo-footer">
      <div className="dpo-footer__watermark" aria-hidden="true">PAKISTAN</div>
      <div className="dpo-container dpo-footer__lead">
        <div>
          <span className="dpo-eyebrow">Stand together. Serve together.</span>
          <h2>One flag. One nation.<br />One Pakistan.</h2>
        </div>
        <Link className="dpo-button dpo-button--gold" to="/apply/membership">Become a member <ArrowRight size={17} /></Link>
      </div>
      <div className="dpo-container dpo-footer__grid">
        <div className="dpo-footer__brand">
          <img src={logo} alt="" />
          <div>
            <h3>{org.name}</h3>
            <p>{org.intro}</p>
            <div className="dpo-socials">
              <a href="#" aria-label="Facebook"><Share2 size={15} /></a>
              <a href="#" aria-label="Instagram"><Camera size={15} /></a>
              <a href="#" aria-label="YouTube"><Play size={15} /></a>
            </div>
          </div>
        </div>
        <FooterColumn title="Explore" links={primaryLinks.slice(0, 5)} />
        <FooterColumn title="Resources" links={[
          { label: 'Member verification', href: '/member-services?tab=verify' },
          { label: 'Track complaint', href: '/member-services?tab=track-complaint' },
          { label: 'Submit complaint', href: '/member-services?tab=complaint' },
          { label: 'Legal policies', href: '/legal' },
          { label: 'Contact DPO', href: '/contact' },
        ]} />
        <div className="dpo-footer__contact">
          <h3>Contact</h3>
          <a href={`tel:${org.phone.replace(/\s/g, '')}`}><Phone size={16} />{org.phone}</a>
          <a href={`mailto:${org.email}`}><Mail size={16} />{org.email}</a>
          <p>{org.address}</p>
        </div>
      </div>
      <div className="dpo-footer__bottom">
        <div className="dpo-container">
          <span>&copy; {new Date().getFullYear()} {org.name}. All rights reserved.</span>
          <div><Link to="/legal/privacy-policy">Privacy</Link><Link to="/legal/terms-and-conditions">Terms</Link><Link to="/admin">Admin</Link></div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul className="dpo-footer__list">
        {links.map((link) => <li key={link.href}><Link to={link.href}>{link.label}</Link></li>)}
      </ul>
    </div>
  )
}

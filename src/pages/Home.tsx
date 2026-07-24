import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Phone, Mail, Shield, Users, HeartHandshake, GraduationCap,
  Flag, BookOpen, UserPlus, FileText, CalendarDays, Download,
  Image as ImageIcon, Star, CheckCircle, MapPin, ChevronRight, ArrowRight
} from 'lucide-react';
import '../styles/home.css';
import heroBg   from '../assets/hero-bg.png';
import badgeImg from '../assets/hero_badge.png';
import merchImg from '../assets/merch.png';
import joinImg  from '../assets/join_mission.png';
import aboutImg from '../assets/about_section.png';

/* ══════════════════════════════════════════
   HOOK: Intersection Observer for scroll reveal
══════════════════════════════════════════ */
function useScrollReveal(className = 'sr') {
  useEffect(() => {
    const els = document.querySelectorAll(`.${className}`);
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sr--visible');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [className]);
}

/* ══════════════════════════════════════════
   HOOK: Animate counter numbers
══════════════════════════════════════════ */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ══════════════════════════════════════════
   HEADER
══════════════════════════════════════════ */
function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__contact">
            <span className="topbar__contact-item"><Phone size={13}/> +92 300 1234567</span>
            <span className="topbar__contact-item"><Mail size={13}/> info@defendersofpakistan.org</span>
          </div>
          <div className="topbar__social">
            <span>Follow Us:</span>
            {['FB','IG','YT','X','TK'].map(s => <a key={s} href="#">{s}</a>)}
          </div>
        </div>
      </div>

      <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,.12)' : undefined }}>
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-badge">
              <img src={badgeImg} alt="DPO Emblem"/>
            </div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-name">Defenders of<br/>Pakistan Organization</span>
              <span className="navbar__logo-tagline">One Flag · One Nation · One Pakistan</span>
            </div>
          </Link>

          <div className="navbar__nav">
            {([
              ['/', 'Home'], ['#about', 'About Us'], ['#action', 'Action Plan'],
              ['#membership', 'Membership'], ['#gallery', 'Gallery'],
              ['#news', 'News'], ['#contact', 'Contact'],
            ] as [string,string][]).map(([href, label]) => (
              <Link key={label} to={href}
                className={`navbar__link${pathname === href ? ' navbar__link--active' : ''}`}>
                {label}
              </Link>
            ))}
            <Link to="#membership" className="btn btn-primary"
              style={{ marginLeft: '.5rem', padding: '.6rem 1.25rem', fontSize: '.78rem' }}>
              <UserPlus size={14}/> JOIN NOW
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__brand-logo">
              <div className="footer__brand-badge"><img src={badgeImg} alt="DPO"/></div>
              <div>
                <div className="footer__brand-name">Defenders of<br/>Pakistan Org.</div>
                <div className="footer__brand-tagline">One Flag · One Nation · One Pakistan</div>
              </div>
            </div>
            <p className="footer__brand-desc">
              A non-profit organization committed to patriotism, national unity, youth
              empowerment, community welfare, education and human service for a strong,
              peaceful and progressive Pakistan.
            </p>
          </div>

          {[
            {
              title: 'Quick Links',
              links: ['Home','About Us','Action Plan','Membership','Leadership','Gallery','News','Contact Us'],
            },
            {
              title: 'Our Programs',
              links: ['National Unity','Education Support','Community Welfare','Youth Empowerment','Patriotism Drive','Official Merchandise'],
            },
            {
              title: 'Contact',
              links: ['+92 300 1234567','info@defendersofpakistan.org','Islamabad, Pakistan'],
            },
          ].map(col => (
            <div key={col.title}>
              <p className="footer__col-title">{col.title}</p>
              <ul className="footer__links">
                {col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <span>&copy; {new Date().getFullYear()} Defenders of Pakistan Organization. All rights reserved.</span>
          <span>Designed with ❤️ for Pakistan</span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════
   STAT BOX (with count-up)
══════════════════════════════════════════ */
function StatBox({ icon, num, suffix, label }: { icon: React.ReactNode; num: number; suffix: string; label: string }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(num, 1800, started);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-box sr sr--d2">
      <span className="stat-box__icon">{icon}</span>
      <div>
        <strong className="stat-box__num">{count.toLocaleString()}{suffix}</strong>
        <span className="stat-box__label">{label}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════ */
export default function Home() {
  useScrollReveal('sr');

  /* Hero text-reveal on mount */
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const vv = heroVisible ? ' hero__title-line--visible' : '';

  const quickTiles = [
    { icon: <UserPlus size={26}/>, label: 'Membership', desc: 'Apply for official DPO membership and receive your membership card.' },
    { icon: <Shield size={26}/>, label: 'Designations', desc: 'Apply for a designation, view your rank and designation status.' },
    { icon: <CalendarDays size={26}/>, label: 'Events', desc: 'Browse upcoming DPO events, rallies, and national programs.' },
    { icon: <ImageIcon size={26}/>, label: 'Gallery', desc: 'Explore photos and media from our nationwide activities.' },
    { icon: <Download size={26}/>, label: 'Downloads', desc: 'Download official forms, ID cards, certificates and documents.' },
    { icon: <FileText size={26}/>, label: 'Documents', desc: 'Access constitutions, by-laws, and official organization documents.' },
  ];

  return (
    <div className="public-layout">
      <Header/>

      {/* ══ HERO ══ */}
      <section className="hero" id="home">
        <div className="hero__bg">
          <div className="hero__overlay"/>
          <img src={heroBg} alt="Minar-e-Pakistan at sunrise"/>
        </div>

        <div className="hero__scroll-hint">
          <span>Scroll</span>
          <div className="hero__scroll-mouse"/>
        </div>

        <div className="container">
          <div className="hero__layout">

            {/* LEFT: Headline + CTA */}
            <div className="hero__text">
              <div className="hero__eyebrow">
                <span className="hero__eyebrow-pulse"/>
                Defenders of Pakistan Organization
              </div>

              {/* Line-by-line text reveal */}
              <div className="hero__title-wrap">
                <span className={`hero__title-line${vv}`}>One Flag</span>
              </div>
              <div className="hero__title-wrap">
                <span className={`hero__title-line${vv}`}>One Nation</span>
              </div>
              <div className="hero__title-wrap" style={{ marginBottom: '0.15rem' }}>
                <span className={`hero__title-line hero__title-line--accent${vv}`}>One Pakistan</span>
              </div>

              <div className="hero__desc-wrap">
                <p className={`hero__desc${heroVisible ? ' hero__desc--visible' : ''}`}>
                  A non-profit organization committed to patriotism, national unity, youth
                  empowerment, community welfare and education — building a strong, peaceful
                  and progressive Pakistan.
                </p>
              </div>

              <div className={`hero__actions${heroVisible ? ' hero__actions--visible' : ''}`}>
                <button className="btn btn-gold"><UserPlus size={17}/> Become a Member</button>
                <button className="btn btn-outline"><ChevronRight size={17}/> Learn More</button>
              </div>
            </div>

            {/* RIGHT: Badge + Values */}
            <div className="hero__right">
              {/* Floating badge */}
              <div className={`hero__badge-wrap${heroVisible ? ' hero__badge-wrap--visible' : ''}`}>
                <div className="hero__badge-ring"/>
                <div className="hero__badge-ring2"/>
                <img src={badgeImg} alt="DPO Emblem"/>
              </div>

              {/* Value cards */}
              <div className="hero__values">
                {[
                  { icon: <Shield size={19}/>, title: 'PATRIOTISM', sub: 'Love for Country' },
                  { icon: <Users size={19}/>, title: 'UNITY', sub: 'Strength in Togetherness' },
                  { icon: <HeartHandshake size={19}/>, title: 'SERVICE', sub: 'Welfare for All' },
                  { icon: <GraduationCap size={19}/>, title: 'EMPOWERMENT', sub: 'Youth are the Future' },
                ].map((v, i) => (
                  <div
                    key={v.title}
                    className={`hero__value-card${heroVisible ? ' hero__value-card--visible' : ''}`}
                    style={{ transitionDelay: `${0.2 + i * 0.12}s` }}
                  >
                    <div className="hero__value-icon">{v.icon}</div>
                    <div className="hero__value-body">
                      <h4>{v.title}</h4>
                      <p>{v.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PILLARS BAR ══ */}
      <section className="pillars" id="action">
        <div className="container">
          <div className="pillars__grid">
            {[
              { icon: <Users size={22}/>, title: 'National Unity', desc: 'Promoting harmony and brotherhood across Pakistan.' },
              { icon: <BookOpen size={22}/>, title: 'Education', desc: 'Supporting quality education and skill development.' },
              { icon: <HeartHandshake size={22}/>, title: 'Community Welfare', desc: 'Serving communities through welfare initiatives.' },
              { icon: <GraduationCap size={22}/>, title: 'Youth Empowerment', desc: 'Building responsible citizens and future leaders.' },
              { icon: <Flag size={22}/>, title: 'Patriotism', desc: 'Standing with Pakistan and its institutions.' },
            ].map(p => (
              <div key={p.title} className="pillar sr">
                <div className="pillar__icon">{p.icon}</div>
                <div>
                  <p className="pillar__title">{p.title}</p>
                  <p className="pillar__desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="section section--white" id="about">
        <div className="container">
          <div className="about__grid">
            <div className="about__image-wrap sr sr--left">
              <img src={aboutImg} alt="Community gathering Pakistan"/>
              <div className="about__image-badge">
                <strong>Est. 2015</strong>
                <span>Serving Pakistan</span>
              </div>
            </div>

            <div className="about__content sr sr--right">
              <span className="section-label">About Us</span>
              <h2 className="section-title">A Movement for a<br/>Stronger Pakistan</h2>
              <p className="section-body">
                Defenders of Pakistan Organization (DPO) is a national, non-profit civic
                organization built on patriotism and service. We work at the grassroots level
                to empower communities, support youth, and foster national unity across all
                four provinces of Pakistan.
              </p>
              <div className="about__points">
                {[
                  { icon: <Shield size={18}/>, title: 'Registered Non-Profit Organization', sub: 'Fully registered and transparent with all stakeholders.' },
                  { icon: <Users size={18}/>, title: 'Nationwide Presence', sub: 'Active chapters across all four provinces and AJK.' },
                  { icon: <Star size={18}/>, title: 'Merit-Based Leadership', sub: 'Designations awarded through a fair application process.' },
                ].map(pt => (
                  <div key={pt.title} className="about__point">
                    <div className="about__point-icon">{pt.icon}</div>
                    <div className="about__point-text">
                      <strong>{pt.title}</strong>
                      <span>{pt.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button className="btn btn-primary">Read Our Story <ArrowRight size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar__grid">
            <StatBox icon={<Users size={40}/>}         num={10000}  suffix="+"  label="Active Members" />
            <StatBox icon={<CheckCircle size={40}/>}   num={250}    suffix="+"  label="Projects Completed" />
            <StatBox icon={<HeartHandshake size={40}/>} num={500}   suffix="+"  label="Volunteers" />
            <StatBox icon={<MapPin size={40}/>}         num={4}     suffix="+"  label="Provinces Covered" />
          </div>
        </div>
      </div>

      {/* ══ MEMBERSHIP ══ */}
      <section className="section membership" id="membership">
        <div className="container">
          <div className="membership__grid">
            <div className="membership__image sr sr--left">
              <img src={joinImg} alt="Crowd holding Pakistan flag"/>
            </div>
            <div className="membership__content sr sr--right">
              <span className="section-label" style={{ color: 'var(--gold-light)' }}>Membership</span>
              <h2 className="section-title section-title--white">
                Join Our Mission.<br/>Become a Member.
              </h2>
              <p style={{ color: 'rgba(255,255,255,.62)', lineHeight: 1.8 }}>
                Be part of a patriotic movement for positive change. Membership is free and
                open to all patriotic Pakistanis who wish to serve their nation with dedication
                and commitment.
              </p>
              <div className="membership__benefits">
                {[
                  { icon: <FileText size={17}/>, text: 'Official Membership Card' },
                  { icon: <Star size={17}/>, text: 'Priority Event Invitations' },
                  { icon: <BookOpen size={17}/>, text: 'Training & Workshops' },
                  { icon: <Shield size={17}/>, text: 'Free Designation' },
                  { icon: <Users size={17}/>, text: 'Volunteer Opportunities' },
                  { icon: <CalendarDays size={17}/>, text: 'Exclusive Events Access' },
                ].map(b => (
                  <div key={b.text} className="membership__benefit">
                    <span className="membership__benefit-icon">{b.icon}</span>
                    <span className="membership__benefit-text">{b.text}</span>
                  </div>
                ))}
              </div>
              <div>
                <button className="btn btn-gold" style={{ fontSize: '.95rem', padding: '.95rem 2.5rem' }}>
                  <UserPlus size={18}/> Apply for Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUICK ACCESS ══ */}
      <section className="section quick-access" id="portal">
        <div className="container">
          <div className="sr" style={{ marginBottom: '3rem' }}>
            <span className="section-label">Member Portal</span>
            <h2 className="section-title">Quick Access</h2>
            <p className="section-body" style={{ marginTop: '.75rem' }}>
              Access all DPO services and resources directly from here.
            </p>
          </div>
          <div className="quick-access__grid">
            {quickTiles.map((t, i) => (
              <div key={t.label} className={`quick-tile sr sr--d${(i % 3) + 1}`}>
                <div className="quick-tile__icon-wrap">{t.icon}</div>
                <div className="quick-tile__body">
                  <p className="quick-tile__label">{t.label}</p>
                  <p className="quick-tile__desc">{t.desc}</p>
                </div>
                <ChevronRight className="quick-tile__arrow" size={18}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MERCHANDISE ══ */}
      <section className="section merch" id="store">
        <div className="container">
          <div className="merch__grid">
            <div className="merch__image sr sr--left">
              <img src={merchImg} alt="DPO Official Merchandise"/>
            </div>
            <div className="merch__content sr sr--right">
              <span className="section-label">Official Store</span>
              <h2 className="section-title">Wear Your Pride.<br/>Represent Pakistan.</h2>
              <p className="section-body">
                Get your hands on premium DPO merchandise — polo shirts, caps, and more —
                all featuring the official emblem. Show the world you're a Defender of Pakistan.
              </p>
              <div className="merch__tags">
                {['Premium Quality', 'Official Logo', 'Nationwide Delivery', 'Support a Cause'].map(t => (
                  <span key={t} className="merch__tag"><CheckCircle size={14}/> {t}</span>
                ))}
              </div>
              <div>
                <button className="btn btn-primary">Shop Now <ArrowRight size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUOTE BAND ══ */}
      <section className="quote-band">
        <div className="container">
          <div className="sr">
            <p className="quote-band__text">
              "Together we can build a stronger, united and progressive Pakistan —
              one act of service at a time."
            </p>
            <p className="quote-band__author">— Defenders of Pakistan Organization</p>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

import {
  ArrowUpRight,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  GalleryHorizontalEnd,
  GraduationCap,
  HeartHandshake,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MapPinned,
  Mail,
  Moon,
  MoreVertical,
  PanelLeftClose,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UsersRound,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './Admin.css'
import { invalidatePublicSiteCache } from '../lib/publicCms'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_STORAGE_KEY = 'dpo-admin-session'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { name: 'Members Management', icon: UsersRound, section: 'Membership' },
  { name: 'Membership Applications', icon: FileText, section: 'Membership' },
  { name: 'Designation Applications', icon: ShieldCheck, section: 'Designations' },
  { name: 'Active Designations', icon: BadgeCheck, section: 'Designations' },
  { name: 'Designation Renewals', icon: CalendarDays, section: 'Designations' },
  { name: 'Designation Master List', icon: GraduationCap, section: 'Designations' },
  { name: 'Complaint Management', icon: CircleHelp, section: 'Operations' },
  { name: 'Payments & Finance', icon: Banknote, section: 'Operations' },
  { name: 'Gallery Management', icon: GalleryHorizontalEnd, section: 'Operations' },
  { name: 'Website CMS', icon: FileText, section: 'Operations' },
  { name: 'Card Templates', icon: CreditCard, section: 'Operations' },
  { name: 'Notifications', icon: Bell, section: 'Administration' },
  { name: 'Admin Users', icon: UsersRound, section: 'Administration' },
  { name: 'Roles & Permissions', icon: ShieldCheck, section: 'Administration' },
  { name: 'Reports', icon: BadgeCheck, section: 'Administration' },
  { name: 'Settings', icon: Settings, section: 'Administration' },
  { name: 'Audit Logs', icon: FileText, section: 'Administration' },
]

const navSections = Array.from(new Set(navItems.map((item) => item.section)))

type DpoRecord = {
  id: string
  createdAt?: string
  updatedAt?: string
  status?: string
  [key: string]: unknown
}

type ListResponse = {
  data: DpoRecord[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

type ResourceSchema = {
  resource: string
  title: string
  description: string
  searchableFields: string[]
  filterFields: string[]
}

type DashboardSummary = {
  kpis: Record<string, number | string>
  charts: Record<string, unknown>
  recent: Record<string, DpoRecord[]>
}

type DatabaseStatus = {
  engine: string
  provider: string
  databaseFile: string
  totalRecords: number
  resourceCounts: Record<string, number>
}

type ApiState = {
  dashboard: DashboardSummary | null
  database: DatabaseStatus | null
  schemas: ResourceSchema[]
  records: Record<string, DpoRecord[]>
  loading: boolean
  error: string | null
  notice: string | null
  reload: () => Promise<void>
  createRecord: (resource: string, payload: Record<string, unknown>) => Promise<DpoRecord>
  updateRecord: (resource: string, id: string, payload: Record<string, unknown>) => Promise<DpoRecord>
  deleteRecord: (resource: string, id: string) => Promise<void>
  runAction: (resource: string, id: string, action: string, payload?: Record<string, unknown>) => Promise<unknown>
}

type AdminSession = {
  name: string
  email: string
  role: string
  token: string
}

const moduleResources: Record<string, string[]> = {
  'Members Management': ['members'],
  'Membership Applications': ['membership-applications'],
  'Designation Applications': ['designation-applications'],
  'Active Designations': ['active-designations'],
  'Designation Renewals': ['designation-renewals'],
  'Designation Master List': ['designation-master-list'],
  'Geographic Areas': ['geographic-areas'],
  'Complaint Management': ['complaints'],
  'Payments & Finance': ['payments'],
  'Gallery Management': ['gallery-albums'],
  'Website CMS': ['cms-pages'],
  'Card Templates': ['card-templates'],
  Notifications: ['notification-templates', 'notification-logs'],
  'Admin Users': ['admin-users'],
  'Roles & Permissions': ['roles'],
  Reports: ['reports'],
  Settings: ['settings'],
  'Audit Logs': ['audit-logs'],
}

function authHeaders(token?: string) {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: authHeaders(token) })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

async function apiSend<T>(path: string, method: 'POST' | 'PATCH', payload: Record<string, unknown> = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

async function apiDelete(path: string, token?: string): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: authHeaders(token) })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
}

function useDpoApi(authToken?: string): ApiState {
  const [state, setState] = useState<ApiState>({
    dashboard: null,
    database: null,
    schemas: [],
    records: {},
    loading: true,
    error: null,
    notice: null,
    reload: async () => undefined,
    createRecord: async () => {
      throw new Error('API is not ready')
    },
    updateRecord: async () => {
      throw new Error('API is not ready')
    },
    deleteRecord: async () => {
      throw new Error('API is not ready')
    },
    runAction: async () => {
      throw new Error('API is not ready')
    },
  })

  const reload = useCallback(async () => {
      try {
        setState((current) => ({ ...current, loading: true, error: null }))
        const [dashboard, database, schemas] = await Promise.all([
          apiGet<DashboardSummary>('/admin/dashboard', authToken),
          apiGet<DatabaseStatus>('/admin/database/status', authToken),
          apiGet<ResourceSchema[]>('/admin/schemas', authToken),
        ])
        const resourceNames = schemas.map((schema) => schema.resource)
        const lists = await Promise.all(
          resourceNames.map((resource) =>
            apiGet<ListResponse>(`/admin/${resource}?limit=100`, authToken).then((response) => [resource, response.data] as const),
          ),
        )
        setState((current) => ({
          ...current,
          dashboard,
          database,
          schemas,
          records: Object.fromEntries(lists),
          loading: false,
          error: null,
        }))
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Backend connection failed',
        }))
      }
    }, [authToken])

  const createRecord = async (resource: string, payload: Record<string, unknown>) => {
    const record = await apiSend<DpoRecord>(`/admin/${resource}`, 'POST', payload, authToken)
    await reload()
    setState((current) => ({ ...current, notice: `${resource} record created` }))
    return record
  }

  const updateRecord = async (resource: string, id: string, payload: Record<string, unknown>) => {
    const record = await apiSend<DpoRecord>(`/admin/${resource}/${id}`, 'PATCH', payload, authToken)
    await reload()
    setState((current) => ({ ...current, notice: `${resource} record updated` }))
    return record
  }

  const deleteRecord = async (resource: string, id: string) => {
    await apiDelete(`/admin/${resource}/${id}`, authToken)
    await reload()
    setState((current) => ({ ...current, notice: `${resource} record deleted` }))
  }

  const runAction = async (resource: string, id: string, action: string, payload: Record<string, unknown> = {}) => {
    const result = await apiSend<unknown>(`/admin/${resource}/${id}/actions/${action}`, 'POST', payload, authToken)
    await reload()
    setState((current) => ({ ...current, notice: `${titleStatus(action)} completed` }))
    return result
  }

  useEffect(() => {
    let active = true
    if (!authToken) return
    void reload().finally(() => {
      if (!active) return
    })
    return () => {
      active = false
    }
  }, [authToken, reload])

  return { ...state, reload, createRecord, updateRecord, deleteRecord, runAction }
}

function getInitialNav() {
  const hashValue = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : ''
  return navItems.some((item) => item.name === hashValue) ? hashValue : 'Dashboard'
}

function getStoredSession(): AdminSession | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<AdminSession>
    if (!parsed.email || !parsed.name || !parsed.token) return null
    return {
      name: toText(parsed.name),
      email: toText(parsed.email),
      role: toText(parsed.role) || 'Admin',
      token: toText(parsed.token),
    }
  } catch {
    return null
  }
}

function App() {
  const isAdminPath = window.location.pathname.replace(/\/$/, '') === '/admin'
  const hasAdminHash = navItems.some((item) => item.name === decodeURIComponent(window.location.hash.slice(1)))

  if (!isAdminPath && hasAdminHash) {
    window.history.replaceState(null, '', `/admin${window.location.hash}`)
    return <AdminApp />
  }

  if (!isAdminPath) {
    return <PublicHome />
  }

  return <AdminApp />
}

function AdminApp() {
  const [activeNav, setActiveNavState] = useState(getInitialNav)
  const [period, setPeriod] = useState('This Month')
  const [areaFilter, setAreaFilter] = useState('All Provinces')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [session, setSession] = useState<AdminSession | null>(() => getStoredSession())
  const [theme, setTheme] = useState(() => localStorage.getItem('dpo-admin-theme') === 'dark' ? 'dark' : 'light')
  const apiState = useDpoApi(session?.token)
  const setActiveNav = (value: string) => {
    setActiveNavState(value)
    window.location.hash = encodeURIComponent(value)
  }
  const handleLogin = (nextSession: AdminSession) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }
  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
    setSearchQuery('')
  }, [])
  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem('dpo-admin-theme', nextTheme)
      return nextTheme
    })
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className={`logicsols-app theme-${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} collapsed={sidebarCollapsed} />
      <main className="layout-main">
        <Navbar activeNav={activeNav} apiState={apiState} searchQuery={searchQuery} setSearchQuery={setSearchQuery} session={session} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} toggleSidebar={() => setSidebarCollapsed((value) => !value)} />
        {activeNav === 'Dashboard' ? (
          <Dashboard period={period} setPeriod={setPeriod} areaFilter={areaFilter} setAreaFilter={setAreaFilter} apiState={apiState} searchQuery={searchQuery} setActiveNav={setActiveNav} />
        ) : (
          <ModuleScreen moduleName={activeNav} apiState={apiState} searchQuery={searchQuery} />
        )}
        {apiState.notice && <div className="toast-message">{apiState.notice}</div>}
      </main>
    </div>
  )
}

function Sidebar({ activeNav, setActiveNav, collapsed }: { activeNav: string; setActiveNav: (value: string) => void; collapsed: boolean }) {
  return (
    <aside className="supplier-sidebar">
      <div className="sidebar-logo">
        <div className="dpo-logo">
          <img src="/dpo-assets/logo-transparent.png" alt="DPO logo" />
        </div>
        {!collapsed && <div className="logo-text">
          <strong>DPO Administration</strong>
          <small>Defenders of Pakistan</small>
        </div>}
      </div>

      <div className="sidebar-scroll">
        <nav className="nav-list" aria-label="Admin modules">
          {navSections.map((section) => <section className="nav-group" key={section}>
            {!collapsed && <span className="nav-group-label">{section}</span>}
            <ul>{navItems.filter((item) => item.section === section).map(({ name, icon: Icon }) => (
              <li key={name}>
                <button className={activeNav === name ? 'active' : ''} type="button" title={collapsed ? name : undefined} aria-current={activeNav === name ? 'page' : undefined} onClick={() => setActiveNav(name)}>
                  <span className="nav-icon-wrap"><Icon className="nav-icon" /></span>
                  {!collapsed && <span>{name}</span>}
                </button>
              </li>
            ))}</ul>
          </section>)}
        </nav>

        {!collapsed && <div className="sidebar-footer">
          <div className="sidebar-system"><i /><span><b>System connected</b><small>Administration workspace</small></span></div>
          <a href="#help"><CircleHelp size={18} /><p>Help & Support</p></a>
        </div>}
      </div>
    </aside>
  )
}

function LoginScreen({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [email, setEmail] = useState('admin@dpo.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await apiSend<{ token: string; user: Omit<AdminSession, 'token'> }>('/auth/login', 'POST', { email, password })
      onLogin({
        name: toText(response.user.name),
        email: toText(response.user.email),
        role: toText(response.user.role),
        token: response.token,
      })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <img src="/dpo-assets/logo-transparent.png" alt="DPO logo" />
          <div>
            <span>Defenders of Pakistan Organization</span>
            <h1>Admin Login</h1>
          </div>
        </div>
        <form className="login-form" onSubmit={submitLogin}>
          <label>
            <span>Email Address</span>
            <div><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@dpo.local" /></div>
          </label>
          <label>
            <span>Password</span>
            <div><Lock size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" /></div>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? 'Checking...' : 'Login'}</button>
        </form>
      </section>
    </main>
  )
}

function PublicHome() {
  const [path, setPath] = useState(() => window.location.pathname === '/admin' ? '/' : window.location.pathname)
  const site = usePublicSite()

  usePublicReveal(path, site.loading)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (nextPath: string) => {
    window.history.pushState(null, '', nextPath)
    setPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PublicLayout path={path} site={site} navigate={navigate}>
      <PublicRoutes path={path} site={site} navigate={navigate} />
    </PublicLayout>
  )
}

function usePublicReveal(path: string, loading: boolean) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!elements.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [path, loading])
}

type PublicSiteData = {
  cms: DpoRecord[]
  settings: DpoRecord[]
  gallery: DpoRecord[]
  welfare: DpoRecord[]
  leadership: DpoRecord[]
  news: DpoRecord[]
  stats: Record<string, number>
}

type PublicApiState = {
  data: PublicSiteData | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const publicNav = [
  ['Home', '/'],
  ['About Us', '/about-us'],
  ['Action Plan', '/action-plan'],
  ['Membership', '/membership'],
  ['Leadership', '/leadership'],
  ['Gallery', '/gallery'],
  ['News', '/news'],
  ['Contact Us', '/contact-us'],
] as const

const defaultSiteData: PublicSiteData = {
  cms: [],
  settings: [],
  gallery: [],
  welfare: [],
  leadership: [],
  news: [],
  stats: {},
}

function usePublicSite(): PublicApiState {
  const [state, setState] = useState<PublicApiState>({
    data: null,
    loading: true,
    error: null,
    reload: async () => undefined,
  })

  const reload = useCallback(async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: null }))
      const data = await apiGet<PublicSiteData>('/public/site')
      setState((current) => ({ ...current, data, loading: false, error: null }))
    } catch (error) {
      setState((current) => ({
        ...current,
        data: defaultSiteData,
        loading: false,
        error: error instanceof Error ? error.message : 'Public website data could not load',
      }))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { ...state, reload }
}

function PublicLayout({ path, site, navigate, children }: { path: string; site: PublicApiState; navigate: (path: string) => void; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const data = site.data ?? defaultSiteData
  const homePage = getCmsPage(data.cms, 'home')
  const content = publicContent(homePage)
  const organizationName = publicSetting(data.settings, 'organization_official_name') || toText(homePage?.titleEnglish) || 'Defenders of Pakistan Organization'
  const logo = publicSetting(data.settings, 'brand_logo_path') || toText(content.logo) || '/dpo-assets/logo-transparent.png'
  const address = publicSetting(data.settings, 'organization_office_address')
  const phone = publicSetting(data.settings, 'organization_phone')
  const email = publicSetting(data.settings, 'organization_email')
  const active = (href: string) => href === '/' ? path === '/' : path.startsWith(href)
  const go = (href: string) => {
    setDrawerOpen(false)
    navigate(href)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="public-site">
      <a className="skip-link" href="#public-main">Skip to content</a>
      <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="public-topbar">
          <div className="public-container topbar-inner">
            <div>
              {phone && <span><Phone size={14} /> {phone}</span>}
              {email && <span><Mail size={14} /> {email}</span>}
              {!phone && !email && address && <span><MapPinned size={14} /> {address}</span>}
            </div>
            {(phone || email) && address && <span><MapPinned size={14} /> {address}</span>}
            <a href="/admin" onClick={(event) => { event.preventDefault(); window.location.href = '/admin' }}>Admin Login</a>
          </div>
        </div>
        <nav className="public-navbar">
          <div className="public-container navbar-inner">
            <button className="brand-button" type="button" onClick={() => go('/')}>
              <img src={logo} alt={`${organizationName} logo`} onError={fallbackImage('/dpo-assets/logo-transparent.png')} />
              <span>{organizationName}</span>
            </button>
            <div className="desktop-nav">
              {publicNav.map(([label, href]) => (
                <button className={active(href) ? 'active' : ''} type="button" key={href} onClick={() => go(href)}>{label}</button>
              ))}
              <div className="nav-dropdown">
                <button type="button">Quick Access <ChevronDown size={15} /></button>
                <div>
                  {quickLinks.map((item) => <button type="button" key={item.href} onClick={() => go(item.href)}>{item.label}</button>)}
                </div>
              </div>
            </div>
            <PublicButton onClick={() => go('/membership/apply')}>Join Now</PublicButton>
            <button className="mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}><Menu size={22} /></button>
          </div>
        </nav>
      </header>

      <PublicSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Navigation">
        <div className="mobile-drawer-brand">
          <img src={logo} alt="" onError={fallbackImage('/dpo-assets/logo-transparent.png')} />
          <b>{organizationName}</b>
        </div>
        <div className="mobile-drawer-links">
          {publicNav.map(([label, href]) => (
            <button className={active(href) ? 'active' : ''} type="button" key={href} onClick={() => go(href)}>{label}</button>
          ))}
          {quickLinks.map((item) => <button type="button" key={item.href} onClick={() => go(item.href)}>{item.label}</button>)}
        </div>
      </PublicSheet>

      <main id="public-main">{children}</main>
      <PublicFooter data={data} navigate={navigate} />
      {site.error && <PublicToast title="API connection issue" message={site.error} onRetry={() => void site.reload()} />}
    </div>
  )
}

function PublicRoutes({ path, site, navigate }: { path: string; site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  if (path === '/') return <HomePage site={site} navigate={navigate} />
  if (path === '/about-us') return <AboutPage site={site} navigate={navigate} />
  if (path === '/action-plan') return <ActionPlanPage site={site} navigate={navigate} />
  if (path.startsWith('/action-plan/')) return <ActionPlanDetailPage data={data} path={path} navigate={navigate} />
  if (path === '/membership') return <MembershipPage site={site} navigate={navigate} />
  if (path === '/membership/apply') return <MembershipApplicationPage data={data} />
  if (path === '/membership/verify') return <MembershipVerificationPage />
  if (path === '/membership/renewal') return <MembershipRenewalPage data={data} />
  if (path === '/membership/card-regeneration') return <CardRegenerationPage />
  if (path === '/leadership') return <LeadershipPage site={site} navigate={navigate} />
  if (path.startsWith('/leadership/')) return <LeadershipDetailPage data={data} path={path} navigate={navigate} />
  if (path === '/gallery') return <PublicGalleryPage site={site} />
  if (path === '/news') return <NewsPage site={site} navigate={navigate} />
  if (path.startsWith('/news/')) return <NewsDetailPage data={data} path={path} navigate={navigate} />
  if (path === '/contact-us') return <ContactPage data={data} />
  if (path === '/complaints/submit') return <SubmitComplaintPage />
  if (path === '/complaints/track') return <TrackComplaintPage />
  if (['/privacy-policy', '/terms-and-conditions', '/refund-policy'].includes(path)) return <LegalPage data={data} path={path} />
  return <NotFoundPage navigate={navigate} />
}

const quickLinks = [
  { label: 'Membership Verification', href: '/membership/verify' },
  { label: 'Membership Renewal', href: '/membership/renewal' },
  { label: 'Card Regeneration', href: '/membership/card-regeneration' },
  { label: 'Submit Complaint', href: '/complaints/submit' },
  { label: 'Track Complaint', href: '/complaints/track' },
]

const valueIcons: Record<string, LucideIcon> = {
  patriotism: ShieldCheck,
  unity: UsersRound,
  education: GraduationCap,
  service: HeartHandshake,
  integrity: BadgeCheck,
  leadership: Landmark,
  'community welfare': HeartHandshake,
}

function HomePage({ site, navigate }: { site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  const home = getCmsPage(data.cms, 'home')
  const content = publicContent(home)
  const orgName = publicSetting(data.settings, 'organization_official_name') || toText(home?.titleEnglish) || 'Defenders of Pakistan Organization'
  const values = valueList(content.coreValues)
  const motto = toText(content.motto) || 'One Flag - One Nation - One Pakistan'
  const mottoLines = motto.split(/\s*[-|]\s*/).map((item) => item.trim()).filter(Boolean)
  const heroValues = values.slice(0, 5)
  const programs = data.welfare.slice(0, 3)
  const leaders = data.leadership.slice(0, 4)
  const news = data.news.slice(0, 3)
  const gallery = data.gallery.slice(0, 4)
  const membershipTypes = settingArray(data.settings, 'membership_types')
  const membershipDocs = settingArray(data.settings, 'membership_required_documents')

  return (
    <>
      <section className="home-hero">
        <img className="home-hero-image" src="/dpo-assets/home-hero-v2.jpg" alt="Pakistan flag, Minar-e-Pakistan and community volunteers" fetchPriority="high" />
        <div className="home-hero-overlay" />
        <div className="public-container home-hero-content">
          <div className="home-hero-copy" data-reveal>
            <div className="home-hero-eyebrow"><span />{orgName}</div>
            <h1>{mottoLines.map((line, index) => <span className={index === 1 ? 'accent' : ''} key={line}>{line}</span>)}</h1>
            {toText(content.mission) && <p>{toText(content.mission)}</p>}
            <div className="hero-actions">
              <PublicButton onClick={() => navigate('/membership/apply')}>Become a Member <ArrowUpRight size={17} /></PublicButton>
              <PublicButton variant="outline" onClick={() => navigate('/action-plan')}>Explore Our Mission</PublicButton>
            </div>
            {values.length > 0 && <div className="home-hero-values">
              {values.slice(0, 3).map((value) => <span key={value}><CircleCheck size={15} />{value}</span>)}
            </div>}
          </div>
        </div>
      </section>

      <section className="home-values-section" aria-label="Core values">
        <div className="public-container home-values-grid" data-reveal>
          {site.loading ? Array.from({ length: 5 }).map((_, index) => <span className="home-value-skeleton" key={index} />) : heroValues.map((value, index) => {
              const Icon = valueIcons[value.toLowerCase()] ?? ShieldCheck
              return <article className="home-value-item" key={value}><span className="home-value-number">0{index + 1}</span><Icon size={25} /><div><b>{value}</b><small>{coreValueCopy(value)}</small></div></article>
            })}
        </div>
      </section>

      <section className="home-story-section">
        <div className="public-container home-story-grid">
          <div className="home-story-media" data-reveal>
            <img src="/dpo-assets/home-mission-v2.jpg" alt="Pakistani volunteers supporting community education" />
            <div className="home-story-mark"><ShieldCheck size={24} /><span><b>{mottoLines.join(' · ')}</b><small>{orgName}</small></span></div>
          </div>
          <div className="home-story-copy" data-reveal>
            <SectionLabel>About DPO</SectionLabel>
            <h2>Purpose before position. Service before self.</h2>
            {toText(content.mission) && <p className="home-story-lead">{toText(content.mission)}</p>}
            {toText(content.vision) && <div className="home-vision-note"><span>Our Vision</span><p>{toText(content.vision)}</p></div>}
            <PublicButton variant="outline" onClick={() => navigate('/about-us')}>Discover Our Story <ChevronRight size={17} /></PublicButton>
          </div>
        </div>
      </section>

      <Section title="Action Plan & Programs" eyebrow="What We Do" action={<PublicButton variant="ghost" onClick={() => navigate('/action-plan')}>View All Programs <ChevronRight size={17} /></PublicButton>}>
        <RecordGrid loading={site.loading} records={programs} emptyTitle="No published programs found">
          {programs.map((program) => <ProgramCard key={program.id} program={program} navigate={navigate} />)}
        </RecordGrid>
      </Section>

      <section className="home-membership-section">
        <div className="public-container home-membership-grid">
          <div className="home-membership-copy" data-reveal>
            <SectionLabel>Membership</SectionLabel>
            <h2>Take your place in a nationwide mission.</h2>
            <p>Choose an official membership type and complete the application through the organization’s connected membership system.</p>
            {membershipTypes.length > 0 && <div className="membership-type-list">{membershipTypes.map((type) => <span key={type}><BadgeCheck size={15} />{type}</span>)}</div>}
            {membershipDocs.length > 0 && <div className="membership-docs"><b>Required documents</b><p>{membershipDocs.slice(0, 4).join(' · ')}</p></div>}
            <div className="hero-actions"><PublicButton onClick={() => navigate('/membership/apply')}>Join Now <ArrowUpRight size={17} /></PublicButton><PublicButton variant="outline" onClick={() => navigate('/membership/verify')}>Verify Membership</PublicButton></div>
          </div>
          <div className="home-service-grid" data-reveal>
            {[
              { label: 'Membership', text: 'Overview and eligibility', href: '/membership', icon: UsersRound },
              { label: 'Verification', text: 'Check official status', href: '/membership/verify', icon: BadgeCheck },
              { label: 'Renewal', text: 'Continue your membership', href: '/membership/renewal', icon: CalendarDays },
              { label: 'Card Service', text: 'Regeneration request', href: '/membership/card-regeneration', icon: CreditCard },
              { label: 'Submit Complaint', text: 'Send a public complaint', href: '/complaints/submit', icon: CircleHelp },
              { label: 'Track Complaint', text: 'Follow complaint status', href: '/complaints/track', icon: Search },
            ].map(({ label, text, href, icon: Icon }) => <button type="button" key={href} onClick={() => navigate(href)}><span><Icon size={22} /></span><div><b>{label}</b><small>{text}</small></div><ChevronRight size={17} /></button>)}
          </div>
        </div>
      </section>

      <HomeStatsBand stats={data.stats} loading={site.loading} />

      <Section title="People Who Carry the Mission" eyebrow="Leadership" action={<PublicButton variant="ghost" onClick={() => navigate('/leadership')}>View Leadership <ChevronRight size={17} /></PublicButton>}>
        <RecordGrid loading={site.loading} records={leaders} emptyTitle="No public leadership profiles found">
          {leaders.map((leader) => <LeaderCard key={leader.id} leader={leader} navigate={navigate} />)}
        </RecordGrid>
      </Section>

      <Section title="Latest From DPO" eyebrow="News & Updates" action={<PublicButton variant="ghost" onClick={() => navigate('/news')}>View All News <ChevronRight size={17} /></PublicButton>}>
        <RecordGrid loading={site.loading} records={news} emptyTitle="No published news found">
          {news.map((item) => <NewsCard key={item.id} item={item} navigate={navigate} />)}
        </RecordGrid>
      </Section>

      <Section title="Moments of Service" eyebrow="Gallery" action={<PublicButton variant="ghost" onClick={() => navigate('/gallery')}>Explore Gallery <ChevronRight size={17} /></PublicButton>}>
        <div className="gallery-preview home-gallery-grid">
          {gallery.length ? gallery.map((album, index) => <button type="button" key={album.id} onClick={() => navigate('/gallery')}><img src={getHomepageGalleryImage(album)} alt={toText(album.titleEnglish)} onError={fallbackImage('/dpo-assets/home-mission-v2.jpg')} /><span><b>{toText(album.titleEnglish)}</b><small>{formatDate(album.eventDate)}</small></span><em>0{index + 1}</em></button>) : <EmptyState title="No published gallery albums found" />}
        </div>
      </Section>

      <FinalCta navigate={navigate} />
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="home-section-label"><i />{children}</span>
}

function HomeStatsBand({ stats, loading }: { stats: Record<string, number>; loading: boolean }) {
  const rows: [string, number | undefined, LucideIcon][] = [
    ['Active Members', stats.activeMembers, UsersRound],
    ['Projects Completed', stats.projectsCompleted, HeartHandshake],
    ['Volunteers', stats.volunteers, UsersRound],
    ['Regions', stats.regions, MapPinned],
  ]

  return (
    <section className="home-stats-band" data-reveal>
      <div className="public-container">
        {loading ? Array.from({ length: 4 }).map((_, index) => <span className="home-stat-skeleton" key={index} />) : rows.map(([label, value, Icon]) => (
          <div className="home-stat-item" key={label}>
            <Icon size={30} />
            <span><b>{formatNumber(value ?? 0)}{label === 'Regions' ? '' : '+'}</b><small>{label}</small></span>
          </div>
        ))}
      </div>
    </section>
  )
}

function AboutPage({ site, navigate }: { site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  const home = getCmsPage(data.cms, 'home')
  const content = publicContent(home)
  return (
    <>
      <PageBanner title="About Us" text={toText(content.mission)} />
      <Section title={toText(home?.titleEnglish) || 'Defenders of Pakistan Organization'} eyebrow="Introduction">
        <div className="content-columns">
          <PublicCard><h3>Mission</h3><p>{toText(content.mission)}</p></PublicCard>
          <PublicCard><h3>Vision</h3><p>{toText(content.vision)}</p></PublicCard>
        </div>
        <PublicAccordion items={[
          { title: 'History / Background', content: cmsText(home, ['history', 'background', 'about']) || 'No published history content found in CMS.' },
          { title: 'Objectives', content: valueList(content.coreValues).join(', ') || 'No published objectives found in CMS.' },
        ]} />
      </Section>
      <StatsSection stats={data.stats} loading={site.loading} />
      <Section title="Leadership Preview" eyebrow="People">
        <RecordGrid loading={site.loading} records={data.leadership.slice(0, 4)} emptyTitle="No public leadership profiles found">
          {data.leadership.slice(0, 4).map((leader) => <LeaderCard key={leader.id} leader={leader} navigate={navigate} />)}
        </RecordGrid>
      </Section>
      <FinalCta navigate={navigate} />
    </>
  )
}

function ActionPlanPage({ site, navigate }: { site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  return (
    <>
      <PageBanner title="Action Plan" text="Published programs and public welfare campaigns from the backend." />
      <Section title="Programs Listing" eyebrow="Active Plans">
        <RecordGrid loading={site.loading} records={data.welfare} emptyTitle="No published programs found">
          {data.welfare.map((program) => <ProgramCard key={program.id} program={program} navigate={navigate} />)}
        </RecordGrid>
      </Section>
    </>
  )
}

function ActionPlanDetailPage({ data, path, navigate }: { data: PublicSiteData; path: string; navigate: (path: string) => void }) {
  const id = decodeURIComponent(path.split('/').pop() || '')
  const program = data.welfare.find((item) => item.id === id || slugify(toText(item.title)) === id)
  if (!program) return <NotFoundPage navigate={navigate} />
  return (
    <>
      <PageBanner title={toText(program.title)} text={toText(program.cause)} />
      <Section title="Program Details" eyebrow={titleStatus(program.status)}>
        <div className="detail-layout">
          <img src={assetPath(program.image) || '/dpo-assets/front-1.png'} alt={toText(program.title)} onError={fallbackImage('/dpo-assets/front-1.png')} />
          <PublicCard>
            <DetailList record={program} fields={['cause', 'startDate', 'endDate', 'status']} />
            <PublicButton onClick={() => navigate('/contact-us')}>Contact Us</PublicButton>
          </PublicCard>
        </div>
      </Section>
    </>
  )
}

function MembershipPage({ site, navigate }: { site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  return (
    <>
      <PageBanner title="Membership" text="Apply, verify, renew and manage membership requests through connected backend services." />
      <Section title="Membership Overview" eyebrow="Members">
        <MembershipSummary data={data} navigate={navigate} />
        <PublicTabs tabs={[
          { label: 'Benefits', content: <ListBlock items={['Recognized membership record', 'Public verification support', 'Access to member services', 'Community program participation']} /> },
          { label: 'Eligibility', content: <p>Eligibility criteria are managed by the organization. Submit an application for official review.</p> },
          { label: 'Types', content: <ListBlock items={settingArray(data.settings, 'membership_types')} empty="No membership types configured in backend settings." /> },
          { label: 'Documents', content: <ListBlock items={settingArray(data.settings, 'membership_required_documents')} empty="No required documents configured in backend settings." /> },
        ]} />
      </Section>
    </>
  )
}

function MembershipApplicationPage({ data }: { data: PublicSiteData }) {
  const [step, setStep] = useState(0)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const membershipTypes = settingArray(data.settings, 'membership_types')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = formPayload(event.currentTarget, ['cnicFront', 'cnicBack', 'profilePhoto'])
      const record = await apiSend<DpoRecord>('/public/membership/applications', 'POST', payload)
      setToast(`Application submitted: ${toText(record.applicationNumber)}`)
      event.currentTarget.reset()
      setStep(0)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Application submission failed')
    } finally {
      setSubmitting(false)
    }
  }
  const steps = ['Membership Type', 'Personal Info', 'Identity', 'Contact', 'Address', 'Documents', 'Terms']
  return (
    <>
      <PageBanner title="Membership Application" text="Fields follow the existing membership application backend resource." />
      <Section title="Apply Now" eyebrow="Application">
        <form className="public-form" onSubmit={submit}>
          <StepTabs steps={steps} active={step} setActive={setStep} />
          {step === 0 && <PublicSelect name="membershipType" label="Membership type" required options={membershipTypes} />}
          {step === 1 && <div className="form-grid"><PublicInput name="name" label="Full name" required /><PublicInput name="phone" label="Phone" required /></div>}
          {step === 2 && <div className="form-grid"><PublicInput name="cnic" label="CNIC / identity number" required /><PublicInput name="email" label="Email" type="email" /></div>}
          {step === 3 && <div className="form-grid"><PublicInput name="country" label="Country" defaultValue="Pakistan" /><PublicInput name="province" label="Province" /><PublicInput name="district" label="District" /></div>}
          {step === 4 && <PublicTextarea name="address" label="Address / location" />}
          {step === 5 && <div className="form-grid"><PublicInput name="cnicFront" label="CNIC front upload" type="file" /><PublicInput name="cnicBack" label="CNIC back upload" type="file" /><PublicInput name="profilePhoto" label="Profile photo" type="file" /></div>}
          {step === 6 && <label className="check-row"><input name="termsAccepted" type="checkbox" required /> <span>I confirm the information is correct and agree to official review.</span></label>}
          {error && <PublicAlert tone="danger" title="Submission failed" message={error} />}
          <div className="form-actions">
            <PublicButton type="button" variant="outline" disabled={step === 0} onClick={() => setStep(Math.max(step - 1, 0))}>Back</PublicButton>
            {step < steps.length - 1 ? <PublicButton type="button" onClick={() => setStep(Math.min(step + 1, steps.length - 1))}>Next</PublicButton> : <PublicButton type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Review and submit'}</PublicButton>}
          </div>
        </form>
      </Section>
      {toast && <PublicToast title="Submitted" message={toast} onClose={() => setToast('')} />}
    </>
  )
}

function MembershipVerificationPage() {
  const [identifier, setIdentifier] = useState('')
  const [result, setResult] = useState<DpoRecord | null>(null)
  const [error, setError] = useState('')
  const verify = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setResult(null)
    try {
      const response = await apiGet<{ verified: boolean; member: DpoRecord | null }>(`/public/verify/member?identifier=${encodeURIComponent(identifier)}`)
      if (!response.member) setError('No public member record found for this identifier.')
      setResult(response.member)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed')
    }
  }
  return (
    <>
      <PageBanner title="Verify Membership" text="Search by backend-supported membership number or masked CNIC." />
      <Section title="Membership Verification" eyebrow="Verify">
        <form className="lookup-form" onSubmit={verify}><PublicInput name="identifier" label="Membership number / masked CNIC" value={identifier} onChange={(value) => setIdentifier(value)} required /><PublicButton type="submit">Verify Membership</PublicButton></form>
        {error && <PublicAlert tone="danger" title="No verification result" message={error} />}
        {result && <PublicCard className="result-card"><DetailList record={result} fields={['name', 'membershipNumber', 'membershipType', 'designation', 'region', 'issueDate', 'expiryDate', 'status']} /></PublicCard>}
      </Section>
    </>
  )
}

function MembershipRenewalPage({ data }: { data: PublicSiteData }) {
  const [lookup, setLookup] = useState<DpoRecord | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fee = publicSetting(data.settings, 'membership_fee_pk')
  const findMember = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const response = await apiGet<DpoRecord>(`/public/membership/renewal/${encodeURIComponent(identifier)}`)
      setLookup(response)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Member lookup failed')
    }
  }
  const submitRenewal = async () => {
    try {
      const record = await apiSend<DpoRecord>('/public/membership/renewals', 'POST', { identifier })
      setMessage(`Renewal request submitted: ${toText(record.renewalNumber)}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Renewal request failed')
    }
  }
  return <RequestFlow title="Membership Renewal" text="Renewal uses the existing membership renewal resource." identifier={identifier} setIdentifier={setIdentifier} onLookup={findMember} lookup={lookup} error={error} fee={fee} action="Renew Membership" onAction={submitRenewal} message={message} />
}

function CardRegenerationPage() {
  const [identifier, setIdentifier] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const payload = formPayload(event.currentTarget, ['document'])
      const record = await apiSend<DpoRecord>('/public/membership/card-regeneration', 'POST', payload)
      setMessage(`Card regeneration request submitted: ${toText(record.renewalNumber)}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Card regeneration request failed')
    }
  }
  return (
    <>
      <PageBanner title="Card Regeneration" text="Official card generation remains in the backend/admin flow." />
      <Section title="Request Card Regeneration" eyebrow="Cards">
        <form className="public-form" onSubmit={submit}>
          <PublicInput name="identifier" label="CNIC / membership number" value={identifier} onChange={setIdentifier} required />
          <PublicTextarea name="reason" label="Reason" />
          <PublicInput name="document" label="Supporting document" type="file" />
          {error && <PublicAlert tone="danger" title="Request failed" message={error} />}
          <PublicButton type="submit">Submit Request</PublicButton>
        </form>
      </Section>
      {message && <PublicToast title="Request submitted" message={message} onClose={() => setMessage('')} />}
    </>
  )
}

function LeadershipPage({ site, navigate }: { site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All')
  const [designation, setDesignation] = useState('All')
  const regions = ['All', ...Array.from(new Set(data.leadership.map((item) => toText(item.region)).filter(Boolean)))]
  const designations = ['All', ...Array.from(new Set(data.leadership.map((item) => toText(item.designation)).filter(Boolean)))]
  const leaders = data.leadership.filter((leader) => (!query || searchableText(leader).includes(query.toLowerCase())) && (region === 'All' || toText(leader.region) === region) && (designation === 'All' || toText(leader.designation) === designation))
  return (
    <>
      <PageBanner title="Leadership" text="Public-safe leadership directory from active designations." />
      <Section title="Leadership Directory" eyebrow="People">
        <Filters query={query} setQuery={setQuery} first={region} setFirst={setRegion} firstLabel="Region" firstOptions={regions} second={designation} setSecond={setDesignation} secondLabel="Designation" secondOptions={designations} />
        <RecordGrid loading={site.loading} records={leaders} emptyTitle="No leadership profiles match these filters">
          {leaders.map((leader) => <LeaderCard key={leader.id} leader={leader} navigate={navigate} />)}
        </RecordGrid>
      </Section>
    </>
  )
}

function LeadershipDetailPage({ data, path, navigate }: { data: PublicSiteData; path: string; navigate: (path: string) => void }) {
  const id = decodeURIComponent(path.split('/').pop() || '')
  const leader = data.leadership.find((item) => item.id === id)
  if (!leader) return <NotFoundPage navigate={navigate} />
  return (
    <>
      <PageBanner title={toText(leader.name)} text={toText(leader.designation)} />
      <Section title="Profile" eyebrow={toText(leader.region)}>
        <div className="profile-detail">
          <img src={toText(leader.photo) || '/dpo-assets/logo-transparent.png'} alt={toText(leader.name)} onError={fallbackImage('/dpo-assets/logo-transparent.png')} />
          <PublicCard><DetailList record={leader} fields={['designation', 'region', 'wing', 'issueDate', 'expiryDate', 'status', 'biography', 'responsibilities']} /></PublicCard>
        </div>
      </Section>
    </>
  )
}

function PublicGalleryPage({ site }: { site: PublicApiState }) {
  const data = site.data ?? defaultSiteData
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<{ src: string; title: string } | null>(null)
  const categories = ['All', ...Array.from(new Set(data.gallery.map((album) => toText(album.category)).filter(Boolean)))]
  const albums = data.gallery.filter((album) => category === 'All' || toText(album.category) === category)
  return (
    <>
      <PageBanner title="Gallery" text="Published albums and media from the backend gallery module." />
      <Section title="Albums" eyebrow="Media">
        <PublicSelect label="Category" value={category} onValueChange={setCategory} options={categories} />
        <div className="gallery-page-grid">
          {albums.flatMap((album) => (getAlbumImages(album).length ? getAlbumImages(album) : [getAlbumCover(album)]).map((src) => (
            <button type="button" key={`${album.id}-${src}`} onClick={() => setSelected({ src, title: toText(album.titleEnglish) })}>
              <img src={src} alt={toText(album.titleEnglish)} loading="lazy" onError={fallbackImage('/dpo-assets/front-1.png')} />
              <span>{toText(album.titleEnglish)}</span>
              <small>{formatDate(album.eventDate)}</small>
            </button>
          )))}
        </div>
        {!albums.length && <EmptyState title="No published gallery albums found" />}
      </Section>
      <PublicDialog open={Boolean(selected)} title={selected?.title || 'Gallery image'} onClose={() => setSelected(null)}>
        {selected && <img className="lightbox-image" src={selected.src} alt={selected.title} onError={fallbackImage('/dpo-assets/front-1.png')} />}
      </PublicDialog>
    </>
  )
}

function NewsPage({ site, navigate }: { site: PublicApiState; navigate: (path: string) => void }) {
  const data = site.data ?? defaultSiteData
  const [query, setQuery] = useState('')
  const news = data.news.filter((item) => !query || searchableText(item).includes(query.toLowerCase()))
  return (
    <>
      <PageBanner title="News" text="Published CMS news, notices and articles." />
      <Section title="Published Posts" eyebrow="News">
        <div className="filter-bar"><PublicInput name="q" label="Search news" value={query} onChange={setQuery} /></div>
        <RecordGrid loading={site.loading} records={news} emptyTitle="No published news found">
          {news.map((item) => <NewsCard key={item.id} item={item} navigate={navigate} />)}
        </RecordGrid>
        <PublicPagination current={1} total={Math.max(1, Math.ceil(news.length / 9))} />
      </Section>
    </>
  )
}

function NewsDetailPage({ data, path, navigate }: { data: PublicSiteData; path: string; navigate: (path: string) => void }) {
  const slug = decodeURIComponent(path.split('/').pop() || '')
  const article = data.news.find((item) => toText(item.slug) === slug || item.id === slug)
  if (!article) return <NotFoundPage navigate={navigate} />
  return (
    <>
      <PageBanner title={toText(article.titleEnglish)} text={`${toText(article.category)} • ${formatDate(article.publishedAt)}`} />
      <Section title="Article" eyebrow="Read">
        {Boolean(article.image) && <img className="article-image" src={toText(article.image)} alt={toText(article.titleEnglish)} onError={fallbackImage('/dpo-assets/front-1.png')} />}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(articleHtml(article)) }} />
        <div className="share-row"><PublicButton variant="outline" onClick={() => void navigator.clipboard?.writeText(window.location.href)}>Share</PublicButton></div>
      </Section>
    </>
  )
}

function ContactPage({ data }: { data: PublicSiteData }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const address = publicSetting(data.settings, 'organization_office_address')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const record = await apiSend<DpoRecord>('/public/contact', 'POST', formPayload(event.currentTarget))
      setMessage(`Message submitted: ${toText(record.complaintNumber)}`)
      event.currentTarget.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Contact form failed')
    }
  }
  return (
    <>
      <PageBanner title="Contact Us" text="Reach the organization through official contact channels." />
      <Section title="Contact Details" eyebrow="Contact">
        <div className="contact-layout">
          <PublicCard><DetailList record={{ id: 'public-contact', phone: 'Not configured in backend settings', email: 'Not configured in backend settings', address }} fields={['phone', 'email', 'address']} /></PublicCard>
          <form className="public-form" onSubmit={submit}>
            <div className="form-grid"><PublicInput name="name" label="Name" required /><PublicInput name="email" label="Email" type="email" /><PublicInput name="phone" label="Phone" /></div>
            <PublicInput name="subject" label="Subject" required />
            <PublicTextarea name="message" label="Message" required />
            {error && <PublicAlert tone="danger" title="Message failed" message={error} />}
            <PublicButton type="submit">Contact Us</PublicButton>
          </form>
        </div>
      </Section>
      {message && <PublicToast title="Received" message={message} onClose={() => setMessage('')} />}
    </>
  )
}

function SubmitComplaintPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const record = await apiSend<DpoRecord>('/public/complaints', 'POST', formPayload(event.currentTarget, ['attachments']))
      setMessage(`Complaint submitted: ${toText(record.complaintNumber)}`)
      event.currentTarget.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Complaint submission failed')
    }
  }
  return (
    <>
      <PageBanner title="Submit Complaint" text="Submit a public complaint through the existing complaint API." />
      <Section title="Complaint Form" eyebrow="Complaints">
        <form className="public-form" onSubmit={submit}>
          <div className="form-grid"><PublicInput name="name" label="Name" required /><PublicInput name="phone" label="Phone" required /></div>
          <PublicSelect name="category" label="Category" options={['Verification', 'Card Issue', 'Membership', 'General']} required />
          <PublicInput name="subject" label="Subject" required />
          <PublicTextarea name="description" label="Description" required />
          {error && <PublicAlert tone="danger" title="Complaint failed" message={error} />}
          <PublicButton type="submit">Submit Complaint</PublicButton>
        </form>
      </Section>
      {message && <PublicToast title="Complaint submitted" message={message} onClose={() => setMessage('')} />}
    </>
  )
}

function TrackComplaintPage() {
  const [number, setNumber] = useState('')
  const [result, setResult] = useState<DpoRecord | null>(null)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setResult(null)
    try {
      setResult(await apiGet<DpoRecord>(`/public/complaints/${encodeURIComponent(number)}`))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Complaint not found')
    }
  }
  return (
    <>
      <PageBanner title="Track Complaint" text="Use your complaint number to view public-safe status details." />
      <Section title="Complaint Status" eyebrow="Tracking">
        <form className="lookup-form" onSubmit={submit}><PublicInput name="complaintNumber" label="Complaint number" value={number} onChange={setNumber} required /><PublicButton type="submit">Track Complaint</PublicButton></form>
        {error && <PublicAlert tone="danger" title="Track failed" message={error} />}
        {result && <PublicCard className="result-card"><DetailList record={result} fields={['complaintNumber', 'subject', 'category', 'submittedDate', 'status', 'updatedAt', 'publicResponse']} /><StatusTimeline status={toText(result.status)} /></PublicCard>}
      </Section>
    </>
  )
}

function LegalPage({ data, path }: { data: PublicSiteData; path: string }) {
  const slug = path.slice(1)
  const page = getCmsPage(data.cms, slug)
  const title = titleStatus(slug)
  return (
    <>
      <PageBanner title={title} text="CMS-managed legal content." />
      <Section title={title} eyebrow="Legal">
        {page ? <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(articleHtml(page)) }} /> : <EmptyState title={`${title} is not published in CMS`} />}
      </Section>
    </>
  )
}

function NotFoundPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <PageBanner title="404" text="The requested public page was not found." />
      <Section title="Page Not Found" eyebrow="Error">
        <PublicAlert tone="warning" title="This route is not available" message="Use the public navigation to continue." />
        <PublicButton onClick={() => navigate('/')}>Go Home</PublicButton>
      </Section>
    </>
  )
}

function Section({ eyebrow, title, action, children }: { eyebrow: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="public-section" data-reveal>
      <div className="public-container">
        <div className="section-heading">
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  )
}

function PageBanner({ title, text }: { title: string; text: string }) {
  return (
    <section className="page-banner">
      <div className="public-container">
        <PublicBreadcrumb items={[{ label: 'Home', href: '/' }, { label: title }]} />
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  )
}

function PublicFooter({ data, navigate }: { data: PublicSiteData; navigate: (path: string) => void }) {
  const home = getCmsPage(data.cms, 'home')
  const content = publicContent(home)
  const organizationName = publicSetting(data.settings, 'organization_official_name') || toText(home?.titleEnglish) || 'Defenders of Pakistan Organization'
  const logo = publicSetting(data.settings, 'brand_logo_path') || toText(content.logo) || '/dpo-assets/logo-transparent.png'
  const address = publicSetting(data.settings, 'organization_office_address')
  return (
    <footer className="public-footer">
      <div className="public-container footer-grid">
        <div className="footer-brand">
          <img src={logo} alt={`${organizationName} logo`} onError={fallbackImage('/dpo-assets/logo-transparent.png')} />
          <h2>{organizationName}</h2>
          <p>{toText(content.mission)}</p>
        </div>
        <FooterLinks title="Quick Links" links={publicNav.map(([label, href]) => ({ label, href }))} navigate={navigate} />
        <FooterLinks title="Membership" links={[
          { label: 'Become a Member', href: '/membership/apply' },
          { label: 'Verify Membership', href: '/membership/verify' },
          { label: 'Membership Renewal', href: '/membership/renewal' },
          { label: 'Card Regeneration', href: '/membership/card-regeneration' },
        ]} navigate={navigate} />
        <FooterLinks title="Support" links={[
          { label: 'Submit Complaint', href: '/complaints/submit' },
          { label: 'Track Complaint', href: '/complaints/track' },
          { label: 'Privacy Policy', href: '/privacy-policy' },
          { label: 'Terms and Conditions', href: '/terms-and-conditions' },
          { label: 'Refund Policy', href: '/refund-policy' },
        ]} navigate={navigate} />
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>{address || 'Contact details are not configured in backend settings.'}</p>
          <div className="social-links"><span>Social links are managed from CMS settings</span></div>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links, navigate }: { title: string; links: { label: string; href: string }[]; navigate: (path: string) => void }) {
  return (
    <div className="footer-links">
      <h3>{title}</h3>
      {links.map((link) => <button type="button" key={link.href} onClick={() => navigate(link.href)}>{link.label}</button>)}
    </div>
  )
}

function PublicButton({ children, variant = 'primary', type = 'button', disabled, onClick }: { children: React.ReactNode; variant?: 'primary' | 'outline' | 'ghost'; type?: 'button' | 'submit'; disabled?: boolean; onClick?: () => void }) {
  return <button className={`public-btn ${variant}`} type={type} disabled={disabled} onClick={onClick}>{children}</button>
}

function PublicCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <article className={`public-card ${className}`}>{children}</article>
}

function PublicBadge({ children }: { children: React.ReactNode }) {
  return <span className="public-badge">{children}</span>
}

function PublicAlert({ title, message, tone = 'info' }: { title: string; message: string; tone?: 'info' | 'warning' | 'danger' }) {
  return <div className={`public-alert ${tone}`}><AlertTriangle size={18} /><span><b>{title}</b>{message && <small>{message}</small>}</span></div>
}

function PublicToast({ title, message, onRetry, onClose }: { title: string; message: string; onRetry?: () => void; onClose?: () => void }) {
  return (
    <div className="public-toast" role="status">
      <div><b>{title}</b><span>{message}</span></div>
      {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
      {onClose && <button type="button" onClick={onClose}>Close</button>}
    </div>
  )
}

function PublicSheet({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="sheet-layer" role="dialog" aria-modal="true">
      <button className="sheet-backdrop" type="button" aria-label="Close navigation" onClick={onClose} />
      <aside className="public-sheet">
        <div className="sheet-head"><h2>{title}</h2><button type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        {children}
      </aside>
    </div>
  )
}

function PublicDialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="dialog-layer" role="dialog" aria-modal="true">
      <button className="dialog-backdrop" type="button" aria-label="Close dialog" onClick={onClose} />
      <div className="public-dialog">
        <div className="dialog-head"><h2>{title}</h2><button type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        {children}
      </div>
    </div>
  )
}

function PublicTabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="public-tabs">
      <div className="tab-list">{tabs.map((tab, index) => <button className={active === index ? 'active' : ''} type="button" key={tab.label} onClick={() => setActive(index)}>{tab.label}</button>)}</div>
      <div className="tab-panel">{tabs[active]?.content}</div>
    </div>
  )
}

function PublicAccordion({ items }: { items: { title: string; content: string }[] }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="public-accordion">
      {items.map((item, index) => (
        <div className="accordion-item" key={item.title}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)}><span>{item.title}</span><ChevronDown size={18} /></button>
          {open === index && <p>{item.content}</p>}
        </div>
      ))}
    </div>
  )
}

function PublicBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return <div className="public-breadcrumb">{items.map((item, index) => <span key={item.label}>{index > 0 && '/'} {item.label}</span>)}</div>
}

function PublicPagination({ current, total }: { current: number; total: number }) {
  return <div className="public-pagination"><button type="button" disabled={current <= 1}>Prev</button><span>{current} / {total}</span><button type="button" disabled={current >= total}>Next</button></div>
}

function PublicInput({ name, label, type = 'text', required, value, defaultValue, onChange }: { name: string; label: string; type?: string; required?: boolean; value?: string; defaultValue?: string; onChange?: (value: string) => void }) {
  return <label className="public-field"><span>{label}</span><input name={name} type={type} required={required} value={value} defaultValue={defaultValue} onChange={(event) => onChange?.(event.target.value)} /></label>
}

function PublicTextarea({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return <label className="public-field"><span>{label}</span><textarea name={name} required={required} rows={5} /></label>
}

function PublicSelect({ name, label, options, required, value, onValueChange }: { name?: string; label: string; options: string[]; required?: boolean; value?: string; onValueChange?: (value: string) => void }) {
  return (
    <label className="public-field">
      <span>{label}</span>
      <select name={name} required={required} value={value} onChange={(event) => onValueChange?.(event.target.value)}>
        {!options.length && <option value="">No backend options found</option>}
        {options.map((option) => <option value={option} key={option}>{titleStatus(option)}</option>)}
      </select>
    </label>
  )
}

function StepTabs({ steps, active, setActive }: { steps: string[]; active: number; setActive: (index: number) => void }) {
  return <div className="step-tabs">{steps.map((step, index) => <button className={active === index ? 'active' : ''} type="button" key={step} onClick={() => setActive(index)}>{index + 1}. {step}</button>)}</div>
}

function RecordGrid({ loading, records, emptyTitle, children }: { loading: boolean; records: unknown[]; emptyTitle: string; children: React.ReactNode }) {
  if (loading) return <div className="public-grid three">{Array.from({ length: 3 }).map((_, index) => <div className="public-skeleton" key={index} />)}</div>
  if (!records.length) return <EmptyState title={emptyTitle} />
  return <div className="public-grid three">{children}</div>
}

function EmptyState({ title }: { title: string }) {
  return <div className="empty-state"><ImageIcon size={28} /><h3>{title}</h3><p>Backend returned no public records for this module.</p></div>
}

function ProgramCard({ program, navigate }: { program: DpoRecord; navigate: (path: string) => void }) {
  return (
    <PublicCard className="program-card">
      <img src={assetPath(program.image) || getAlbumCover(program)} alt={toText(program.title)} onError={fallbackImage('/dpo-assets/home-mission-v2.jpg')} />
      <PublicBadge>{toText(program.cause) || 'Program'}</PublicBadge>
      <h3>{toText(program.title)}</h3>
      <p>{formatDate(program.startDate)} - {formatDate(program.endDate)}</p>
      <Status>{titleStatus(program.status)}</Status>
      <PublicButton variant="outline" onClick={() => navigate(`/action-plan/${program.id}`)}>View Details</PublicButton>
    </PublicCard>
  )
}

function LeaderCard({ leader, navigate }: { leader: DpoRecord; navigate: (path: string) => void }) {
  return (
    <PublicCard className="leader-card">
      <img src={toText(leader.photo) || '/dpo-assets/logo-transparent.png'} alt={toText(leader.name)} onError={fallbackImage('/dpo-assets/logo-transparent.png')} />
      <h3>{toText(leader.name)}</h3>
      <p>{toText(leader.designation)}</p>
      <span>{toText(leader.region)}</span>
      <PublicButton variant="outline" onClick={() => navigate(`/leadership/${leader.id}`)}>View Profile</PublicButton>
    </PublicCard>
  )
}

function NewsCard({ item, navigate }: { item: DpoRecord; navigate: (path: string) => void }) {
  const slug = toText(item.slug) || toText(item.id)
  return (
    <PublicCard className="news-card">
      <img src={toText(item.image) || '/dpo-assets/front-2.png'} alt={toText(item.titleEnglish)} onError={fallbackImage('/dpo-assets/front-2.png')} />
      <PublicBadge>{toText(item.category) || 'News'}</PublicBadge>
      <small>{formatDate(item.publishedAt ?? item.createdAt)}</small>
      <h3>{toText(item.titleEnglish)}</h3>
      <p>{toText(item.excerpt)}</p>
      <PublicButton variant="outline" onClick={() => navigate(`/news/${slug}`)}>Read More</PublicButton>
    </PublicCard>
  )
}

function MembershipSummary({ data, navigate }: { data: PublicSiteData; navigate: (path: string) => void }) {
  const types = settingArray(data.settings, 'membership_types')
  const docs = settingArray(data.settings, 'membership_required_documents')
  const fee = publicSetting(data.settings, 'membership_fee_pk')
  return (
    <div className="membership-summary">
      <PublicCard>
        <h3>Membership Benefits</h3>
        <ListBlock items={['Official backend membership record', 'Public membership verification', 'Membership renewal support', 'Card regeneration request support']} />
      </PublicCard>
      <PublicCard>
        <h3>Membership Types</h3>
        <ListBlock items={types} empty="No membership types configured in backend settings." />
        {fee && <p className="fee-note">Fee from backend settings: {formatCurrency(fee)}</p>}
      </PublicCard>
      <PublicCard>
        <h3>Required Documents</h3>
        <ListBlock items={docs} empty="No required documents configured in backend settings." />
        <div className="card-actions"><PublicButton onClick={() => navigate('/membership/apply')}>Become a Member</PublicButton><PublicButton variant="outline" onClick={() => navigate('/membership/verify')}>Verify Membership</PublicButton></div>
      </PublicCard>
    </div>
  )
}

function StatsSection({ stats, loading }: { stats: Record<string, number>; loading: boolean }) {
  const rows = [
    ['Active Members', stats.activeMembers],
    ['Projects Completed', stats.projectsCompleted],
    ['Volunteers', stats.volunteers],
    ['Regions', stats.regions],
  ].filter(([, value]) => typeof value === 'number')
  return (
    <Section title="Impact Statistics" eyebrow="Impact">
      {loading ? <div className="stats-grid">{Array.from({ length: 4 }).map((_, index) => <div className="public-skeleton small" key={index} />)}</div> : rows.length ? <div className="stats-grid">{rows.map(([label, value]) => <PublicCard className="stat-card" key={label}><b>{formatNumber(value)}</b><span>{label}</span></PublicCard>)}</div> : <EmptyState title="No public statistics available" />}
    </Section>
  )
}

function FinalCta({ navigate }: { navigate: (path: string) => void }) {
  return (
    <section className="final-cta">
      <div className="public-container">
        <h2>One Flag, One Nation, One Pakistan</h2>
        <p>Join the public mission of unity, service and responsible citizenship.</p>
        <div><PublicButton onClick={() => navigate('/membership/apply')}>Become a Member</PublicButton><PublicButton variant="outline" onClick={() => navigate('/contact-us')}>Contact Us</PublicButton></div>
      </div>
    </section>
  )
}

function ListBlock({ items, empty }: { items: string[]; empty?: string }) {
  if (!items.length) return <p>{empty || 'No backend records found.'}</p>
  return <ul className="clean-list">{items.map((item) => <li key={item}><CircleCheck size={16} /> {item}</li>)}</ul>
}

function DetailList({ record, fields }: { record: DpoRecord; fields: string[] }) {
  return <dl className="detail-list">{fields.map((field) => <div key={field}><dt>{titleStatus(field)}</dt><dd>{formatCompactValue(record[field]) || '-'}</dd></div>)}</dl>
}

function Filters({ query, setQuery, first, setFirst, firstLabel, firstOptions, second, setSecond, secondLabel, secondOptions }: { query: string; setQuery: (value: string) => void; first: string; setFirst: (value: string) => void; firstLabel: string; firstOptions: string[]; second: string; setSecond: (value: string) => void; secondLabel: string; secondOptions: string[] }) {
  return (
    <div className="filter-bar">
      <PublicInput name="search" label="Search" value={query} onChange={setQuery} />
      <PublicSelect label={firstLabel} value={first} onValueChange={setFirst} options={firstOptions} />
      <PublicSelect label={secondLabel} value={second} onValueChange={setSecond} options={secondOptions} />
    </div>
  )
}

function RequestFlow({ title, text, identifier, setIdentifier, onLookup, lookup, error, fee, action, onAction, message }: { title: string; text: string; identifier: string; setIdentifier: (value: string) => void; onLookup: (event: FormEvent) => void; lookup: DpoRecord | null; error: string; fee?: string; action: string; onAction: () => void; message: string }) {
  return (
    <>
      <PageBanner title={title} text={text} />
      <Section title={title} eyebrow="Membership">
        <form className="lookup-form" onSubmit={onLookup}><PublicInput name="identifier" label="CNIC / membership number" value={identifier} onChange={setIdentifier} required /><PublicButton type="submit">Search Member</PublicButton></form>
        {error && <PublicAlert tone="danger" title="Lookup failed" message={error} />}
        {lookup && <PublicCard className="result-card"><DetailList record={asObject(lookup.member) as DpoRecord} fields={['name', 'membershipNumber', 'membershipType', 'district', 'currentExpiry', 'status']} />{fee && <p className="fee-note">Backend fee: {formatCurrency(fee)}</p>}<PublicButton onClick={onAction}>{action}</PublicButton></PublicCard>}
      </Section>
      {message && <PublicToast title="Request submitted" message={message} />}
    </>
  )
}

function StatusTimeline({ status }: { status: string }) {
  const steps = ['Pending', 'Under Review', 'Resolved', 'Closed']
  const activeIndex = Math.max(0, steps.findIndex((step) => normalizeStatus(step) === normalizeStatus(status)))
  return <div className="status-timeline">{steps.map((step, index) => <span className={index <= activeIndex ? 'active' : ''} key={step}>{step}</span>)}</div>
}

function getCmsPage(pages: DpoRecord[], slug: string) {
  return pages.find((page) => toText(page.slug) === slug)
}

function publicContent(page?: DpoRecord) {
  return asObject(page?.content)
}

function publicSetting(settings: DpoRecord[], key: string) {
  const setting = settings.find((item) => toText(item.key) === key)
  return toText(setting?.value)
}

function settingArray(settings: DpoRecord[], key: string) {
  const value = settings.find((item) => toText(item.key) === key)?.value
  return Array.isArray(value) ? value.map(toText).filter(Boolean) : []
}

function valueList(value: unknown) {
  return Array.isArray(value) ? value.map(toText).filter(Boolean) : []
}

function cmsText(page: DpoRecord | undefined, keys: string[]) {
  const content = publicContent(page)
  return keys.map((key) => toText(content[key])).find(Boolean) ?? ''
}

function coreValueCopy(value: string) {
  const text = value.toLowerCase()
  if (text.includes('education')) return 'Learning, awareness and responsible civic growth.'
  if (text.includes('welfare') || text.includes('service')) return 'Community support through organized public service.'
  if (text.includes('youth')) return 'Preparing young citizens for leadership and contribution.'
  if (text.includes('unity')) return 'Bringing citizens together under national purpose.'
  if (text.includes('patriot')) return 'Serving Pakistan with dignity, discipline and loyalty.'
  return 'A published value from the organization CMS.'
}

function assetPath(value: unknown) {
  const text = toText(value)
  if (!text) return ''
  if (text.startsWith('/')) return text
  if (/^https?:\/\//.test(text)) return text
  return `/dpo-assets/cms/${text}`
}

function fallbackImage(path: string) {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.src.endsWith(path)) return
    event.currentTarget.src = path
  }
}

function formPayload(form: HTMLFormElement, fileFields: string[] = []) {
  const data = new FormData(form)
  const payload: Record<string, unknown> = {}
  data.forEach((value, key) => {
    if (value instanceof File) {
      if (value.name) payload[key] = value.name
      return
    }
    payload[key] = value
  })
  const documents = fileFields.map((field) => payload[field]).map(toText).filter(Boolean)
  if (documents.length) payload.documents = documents
  return payload
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

function articleHtml(record: DpoRecord) {
  const content = record.content
  if (typeof content === 'string') return content
  if (typeof content === 'object' && content !== null) {
    const object = content as Record<string, unknown>
    return toText(object.bodyEnglish ?? object.body ?? object.description ?? object.mission ?? '')
  }
  return toText(record.excerpt)
}

function Navbar({ activeNav, apiState, searchQuery, setSearchQuery, session, theme, onToggleTheme, onLogout, toggleSidebar }: { activeNav: string; apiState: ApiState; searchQuery: string; setSearchQuery: (value: string) => void; session: AdminSession; theme: string; onToggleTheme: () => void; onLogout: () => void; toggleSidebar: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifications = (apiState.records['notification-logs'] ?? []).slice(0, 6)
  return (
    <header className="supplier-navbar">
      <div className="navbar-left">
        <button className="outline-icon" type="button" aria-label="Sidebar toggle" onClick={toggleSidebar}>
          <PanelLeftClose size={21} />
        </button>
        <p>{activeNav}</p>
      </div>

      <label className="navbar-search">
        <Search size={17} />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={apiState.loading ? 'Connecting backend...' : apiState.error ? `Backend offline: ${apiState.error}` : `Search ${activeNav.toLowerCase()}...`} />
      </label>

      <div className="navbar-actions">
        <button className="ai-button" type="button" onClick={() => void apiState.reload()}><ArrowUpRight size={16} /> Refresh</button>
        <button className="outline-icon" type="button" aria-label="Toggle theme" onClick={onToggleTheme}>{theme === 'dark' ? <Sun size={21} /> : <Moon size={21} />}</button>
        <div className="notification-wrap">
          <button className={`outline-icon notify-btn ${notifications.length ? 'has-items' : ''}`} type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={20} /></button>
          {notificationsOpen && (
            <div className="notification-menu">
              <div className="notification-head">
                <b>Notifications</b>
                <button type="button" onClick={() => setNotificationsOpen(false)}>Close</button>
              </div>
              {notifications.length ? notifications.map((notification) => (
                <button className="notification-item" type="button" key={notification.id}>
                  <span>{toText(notification.channel) || 'system'}</span>
                  <b>{toText(notification.subject) || toText(notification.message) || toText(notification.event)}</b>
                  <small>{formatDate(notification.sentAt ?? notification.createdAt)}</small>
                </button>
              )) : <p className="empty-notifications">No notifications found.</p>}
            </div>
          )}
        </div>
        <button className="profile-trigger" type="button">
          <span className="profile-avatar">{initialsFrom(session.name)}</span>
          <span className="profile-copy">
            <b>{session.name}</b>
            <small>{session.role}</small>
          </span>
          <ChevronDown size={16} />
        </button>
        <button className="outline-icon" type="button" aria-label="Logout" onClick={onLogout}><LogOut size={19} /></button>
      </div>
    </header>
  )
}

function Dashboard({ period, setPeriod, areaFilter, setAreaFilter, apiState, searchQuery, setActiveNav }: { period: string; setPeriod: (value: string) => void; areaFilter: string; setAreaFilter: (value: string) => void; apiState: ApiState; searchQuery: string; setActiveNav: (value: string) => void }) {
  return (
    <div className="dashboard-wrap">
      <div className="dashboard-grid">
        <div className="col-12">
          <OverviewHeader period={period} setPeriod={setPeriod} areaFilter={areaFilter} setAreaFilter={setAreaFilter} />
        </div>

        <div className="col-12">
          <KpiGrid dashboard={apiState.dashboard} />
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-6"><MapCard areaFilter={areaFilter} apiState={apiState} /></div>
            <div className="col-3"><IncomingApplications dashboard={apiState.dashboard} /></div>
            <div className="col-3"><ActionItems dashboard={apiState.dashboard} database={apiState.database} setActiveNav={setActiveNav} /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-7"><FinancialInsights dashboard={apiState.dashboard} /></div>
            <div className="col-5"><TopDistricts members={apiState.records.members ?? []} /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-12"><MembersManagement membersData={apiState.records.members ?? []} apiState={apiState} searchQuery={searchQuery} /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-12"><ComplaintManagement complaintsData={apiState.records.complaints ?? []} /></div>
          </div>
        </div>

        <div className="col-12">
          <RecentRequirementTables apiState={apiState} setActiveNav={setActiveNav} />
        </div>
      </div>
    </div>
  )
}

function KpiGrid({ dashboard }: { dashboard: DashboardSummary | null }) {
  const kpis: [string, unknown, LucideIcon, string][] = [
    ['Total Members', dashboard?.kpis.totalMembers, UsersRound, 'success'],
    ['Pending Applications', dashboard?.kpis.pendingApplications, FileText, 'warning'],
    ['Active Members', dashboard?.kpis.activeMembers, CircleCheck, 'success'],
    ['Expired Members', dashboard?.kpis.expiredMembers, CircleX, 'danger'],
    ['Total Designations', dashboard?.kpis.totalDesignations, ShieldCheck, 'info'],
    ['Open Complaints', dashboard?.kpis.openComplaints, CircleHelp, 'warning'],
    ['Urgent Complaints', dashboard?.kpis.urgentComplaints, CircleHelp, 'danger'],
    ['Today Payments', dashboard?.kpis.todayPayments, Banknote, 'success'],
  ]

  return (
    <section className="kpi-grid">
      {kpis.map(([label, value, Icon, tone]) => (
        <div className="kpi-card" key={label}>
          <Icon className={`status-icon ${tone}`} size={19} />
          <span>{label}</span>
          <b>{typeof value === 'string' && value.startsWith('PKR') ? value : formatNumber(value ?? 0)}</b>
        </div>
      ))}
    </section>
  )
}

function RecentRequirementTables({ apiState, setActiveNav }: { apiState: ApiState; setActiveNav: (value: string) => void }) {
  const groups: [string, string, DpoRecord[], string[]][] = [
    ['Recent Membership Applications', 'Membership Applications', apiState.records['membership-applications'] ?? [], ['applicationNumber', 'name', 'district', 'paymentStatus', 'status']],
    ['Recent Complaints', 'Complaint Management', apiState.records.complaints ?? [], ['complaintNumber', 'name', 'category', 'subject', 'status']],
    ['Recent Payments', 'Payments & Finance', apiState.records.payments ?? [], ['orderId', 'user', 'paymentType', 'amount', 'status']],
  ]

  return (
    <div className="recent-grid">
      {groups.map(([title, target, rows, fields]) => (
        <section className="logicsols-card mini-table-card" key={title}>
          <div className="table-title">
            <h2>{title}</h2>
            <button type="button" onClick={() => setActiveNav(target)}>Open</button>
          </div>
          <div className="mini-records">
            {rows.slice(0, 5).map((record) => (
              <button type="button" key={record.id} onClick={() => setActiveNav(target)}>
                {fields.map((field) => (
                  <span key={field}>{isStatusField(field) ? <Status>{titleStatus(record[field])}</Status> : formatCompactValue(record[field])}</span>
                ))}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function OverviewHeader({ period, setPeriod, areaFilter, setAreaFilter }: { period: string; setPeriod: (value: string) => void; areaFilter: string; setAreaFilter: (value: string) => void }) {
  const periods = ['Today', 'Last 7 Days', 'This Month', 'Custom Date']
  const areas = ['All Provinces', 'Punjab', 'Sindh', 'KPK', 'Balochistan']

  return (
    <div className="overview-header">
      <h2>Overview</h2>
      <div className="overview-controls">
        <div className="filter-tabs">
          {periods.map((label) => (
            <button className={period === label ? 'active' : ''} type="button" key={label} onClick={() => setPeriod(label)}>{label}</button>
          ))}
        </div>
        <select className="area-select" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} aria-label="Province filter">
          {areas.map((area) => <option key={area}>{area}</option>)}
        </select>
      </div>
      <p className="filter-result">Showing dashboard data for <b>{period}</b> in <b>{areaFilter}</b>.</p>
    </div>
  )
}

function MapCard({ areaFilter, apiState }: { areaFilter: string; apiState: ApiState }) {
  const totalMembers = Number(apiState.dashboard?.kpis.totalMembers ?? 0)
  const totalDesignations = Number(apiState.dashboard?.kpis.totalDesignations ?? 0)
  const regions = [
    ['Punjab', String(Math.max(totalMembers - 1, 0)), '45%', '72%', `${totalDesignations} designations`, `${apiState.records.complaints?.length ?? 0} complaints`],
    ['Sindh', String(apiState.records.members?.filter((member) => toText(member.district).toLowerCase().includes('karachi')).length ?? 0), '30%', '64%', `${apiState.records['active-designations']?.filter((item) => toText(item.province) === 'Sindh').length ?? 0} designations`, 'Live DB'],
    ['KPK', '0', '15%', '35%', '0 designations', 'No live records'],
    ['Balochistan', '0', '10%', '28%', '0 designations', 'No live records'],
  ]
  const visibleRegions = areaFilter === 'All Provinces' ? regions : regions.filter(([name]) => name === areaFilter)

  return (
    <section className="logicsols-card map-panel">
      <div className="map-top">
        <h2>Pakistan Coverage</h2>
        <button type="button">{areaFilter}</button>
      </div>
      <div className="coverage-card no-map">
        <div className="coverage-list">
          {visibleRegions.map(([name, members, share, coverage, designations, complaintsCount]) => (
            <div key={name}>
              <div className="coverage-region-head">
                <span><b>{name}</b><small>{members} members</small></span>
                <em>{share}</em>
              </div>
              <div className="coverage-progress"><i style={{ width: coverage }} /></div>
              <div className="coverage-mini">
                <small>{coverage} active coverage</small>
                <small>{designations}</small>
                <small>{complaintsCount}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="map-summary">
        <SummaryStat label="Total Members" value={formatNumber(totalMembers)} />
        <SummaryStat label="Active Designations" value={formatNumber(totalDesignations)} />
      </div>
    </section>
  )
}

function IncomingApplications({ dashboard }: { dashboard: DashboardSummary | null }) {
  const stats: [string, string, LucideIcon, string][] = [
    ['Membership Applications', formatNumber(dashboard?.kpis.pendingApplications ?? 0), FileText, 'primary'],
    ['Approved', formatNumber(dashboard?.kpis.activeMembers ?? 0), CircleCheck, 'success'],
    ['Under Review', formatNumber(dashboard?.kpis.pendingDesignations ?? 0), CalendarDays, 'warning'],
    ['Rejected', formatNumber(dashboard?.kpis.expiredMembers ?? 0), CircleX, 'danger'],
  ]
  return (
    <section className="logicsols-card incoming-card">
      <div className="section-title">
        <h3>Incoming Applications</h3>
        <div><strong>{formatNumber(dashboard?.kpis.pendingApplications ?? 0)}</strong><Tag tone="success">Live backend</Tag></div>
      </div>
      <div className="status-list">
        {stats.map(([label, count, Icon, tone]) => (
          <div className="status-row" key={label}>
            <div><Icon className={`status-icon ${tone}`} size={21} /><h4>{label}</h4></div>
            <p>{count}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionItems({ dashboard, database, setActiveNav }: { dashboard: DashboardSummary | null; database: DatabaseStatus | null; setActiveNav: (value: string) => void }) {
  const liveActions: [string, string, LucideIcon, string][] = [
    [`${formatNumber(dashboard?.kpis.urgentComplaints ?? 0)} urgent complaints need assignment`, 'Live', CircleHelp, 'Complaints'],
    [`${formatNumber(database?.resourceCounts['membership-cards'] ?? 0)} cards available for review`, 'DB', CreditCard, 'Applications'],
    [`${formatNumber(database?.resourceCounts.payments ?? 0)} payment records synced`, 'DB', Banknote, 'Payments'],
  ]
  return (
    <section className="logicsols-card action-card">
      <h3>Action Required</h3>
      <div className="action-list">
        {liveActions.map(([title, time, Icon, target]) => (
          <button type="button" key={title} onClick={() => setActiveNav(target)}>
            <Icon size={24} />
            <span><b>{title}</b><small>{time}</small></span>
            <ChevronRight className="action-chevron" size={14} />
          </button>
        ))}
      </div>
    </section>
  )
}

function FinancialInsights({ dashboard }: { dashboard: DashboardSummary | null }) {
  const monthlyRevenue = Number(dashboard?.kpis.monthlyRevenue ?? 0)
  const revenueRows = ((dashboard?.charts.revenueByMonth as { month: string; revenue: number }[] | undefined) ?? []).slice(-5)
  return (
    <section className="logicsols-card financial-card">
      <div className="financial-head">
        <h2>Financial Insights</h2>
        <div className="legend">
          <span><i className="muted" /> Total Revenue</span>
          <span><i className="green" /> Service Fee</span>
        </div>
      </div>
      <h3>{formatCurrency(monthlyRevenue)} <Tag tone="success">Live finance</Tag></h3>
      <div className="financial-body">
        <div className="bar-chart">
          {(revenueRows.length ? revenueRows : [{ month: 'Now', revenue: monthlyRevenue }]).map((row, index) => {
            const revenue = Math.max(18, Math.min(95, Math.round((Number(row.revenue) / Math.max(monthlyRevenue, 1)) * 90)))
            const fee = Math.max(12, Math.round(revenue * 0.55))
            return (
            <div className="bar-week" key={index}>
              <span className="expected" style={{ height: `${revenue}%` }} />
              <span className="actual" style={{ height: `${fee}%` }} />
              <small>{row.month}</small>
            </div>
            )
          })}
        </div>
        <div className="finance-side">
          <SummaryStat label="Paid Records" value={formatNumber(dashboard?.kpis.todayPayments ?? 0)} />
        </div>
      </div>
    </section>
  )
}

function TopDistricts({ members }: { members: DpoRecord[] }) {
  const districtCounts = Object.entries(
    members.reduce<Record<string, number>>((acc, member) => {
      const district = toText(member.district) || 'Unknown'
      acc[district] = (acc[district] ?? 0) + 1
      return acc
    }, {}),
  )
  const rows = districtCounts.length ? districtCounts : [['No records', 0]]
  return (
    <section className="logicsols-card district-card">
      <h2>Top Districts</h2>
      {rows.map(([name, count]) => {
        const pct = `${Math.max(18, Math.min(100, Number(count) * 34))}%`
        return (
        <div className="district-row" key={name}>
          <span><b>{name}</b><small>{formatNumber(count)} members</small></span>
          <div className="district-progress"><i style={{ width: pct }} /></div>
          <em>{pct}</em>
        </div>
        )
      })}
    </section>
  )
}

function MembersManagement({ membersData, apiState, searchQuery }: { membersData: DpoRecord[]; apiState: ApiState; searchQuery: string }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selected, setSelected] = useState<DpoRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const filters = ['All', 'Active', 'Pending', 'Under Review', 'Failed']
  const searchedMembers = searchQuery
    ? membersData.filter((row) => searchableText(row).includes(searchQuery.toLowerCase()))
    : membersData
  const filteredMembers = activeFilter === 'All'
    ? searchedMembers
    : searchedMembers.filter((row) => normalizeStatus(row.status) === normalizeStatus(activeFilter) || normalizeStatus(row.paymentStatus) === normalizeStatus(activeFilter))

  return (
    <section className="logicsols-card table-card">
      <div className="table-title">
        <h2>Members Management</h2>
        <button type="button" onClick={() => setCreating(true)}>+ Add Member</button>
      </div>
      <div className="table-filters">
        {filters.map((filter) => <button className={activeFilter === filter ? 'active' : ''} type="button" key={filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
      </div>
      <p className="filter-result inline-result">Members filter: <b>{activeFilter}</b> ({filteredMembers.length} records)</p>
      <div className="table-scroll">
        <table>
          <thead><tr>{['Membership No', 'Name', 'CNIC', 'District', 'Payment', 'Application', 'Status', 'Actions'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredMembers.map((row) => (
              <tr key={row.id}>
                <td>{toText(row.membershipNumber)}</td>
                <td>{toText(row.name)}</td>
                <td>{toText(row.cnicMasked)}</td>
                <td>{toText(row.district)}</td>
                <td><Status>{titleStatus(row.paymentStatus)}</Status></td>
                <td><Status>{titleStatus(row.applicationStatus)}</Status></td>
                <td><Status>{titleStatus(row.status)}</Status></td>
                <td><button className="row-btn" type="button" onClick={() => setSelected(row)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <RecordDrawer title="Member Detail" resource="members" record={selected} apiState={apiState} onClose={() => setSelected(null)} />}
      {creating && <CreateRecordModal resource="members" apiState={apiState} onClose={() => setCreating(false)} />}
    </section>
  )
}

function ComplaintManagement({ complaintsData }: { complaintsData: DpoRecord[] }) {
  return (
    <section className="logicsols-card complaint-card">
      <div className="table-title">
        <h2>Complaint Management</h2>
      </div>
      <div className="complaint-layout">
        <div className="table-scroll">
          <table>
            <thead><tr>{['Complaint No', 'Name', 'Phone', 'Category', 'Subject', 'Status'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {complaintsData.map((row) => (
                <tr key={row.id}>
                  <td>{toText(row.complaintNumber)}</td><td>{toText(row.name)}</td><td>{toText(row.phone)}</td><td>{toText(row.category)}</td><td>{toText(row.subject)}</td><td><Status>{titleStatus(row.status)}</Status></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ModuleScreen({ moduleName, apiState, searchQuery }: { moduleName: string; apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState<{ resource: string; record: DpoRecord } | null>(null)
  const [creatingResource, setCreatingResource] = useState<string | null>(null)
  const showTools = !['Designation Master List', 'Complaint Management', 'Payments & Finance', 'Website CMS'].includes(moduleName)
  const { columns, rows, resourceTitle } = useMemo(
    () => getLiveModuleTable(moduleName, status, apiState, searchQuery),
    [moduleName, status, apiState, searchQuery],
  )
  const primaryResource = moduleResources[moduleName]?.[0] ?? 'members'
  const selectedResource = selected?.resource ?? primaryResource
  const selectedRecord = selected?.record ?? apiState.records[selectedResource]?.[0]
  const statusFilters = moduleName === 'Complaint Management'
    ? ['All', 'Pending', 'Under Review', 'Resolved', 'Closed']
    : moduleName === 'Payments & Finance'
      ? ['All', 'Pending', 'Paid']
      : ['All', 'Active', 'Pending', 'Under Review', 'Failed']
  const runTool = (tool: string) => {
    if (tool.includes('Create') || tool.includes('Register') || tool.includes('Upload') || tool.includes('Add')) {
      setCreatingResource(primaryResource)
      return
    }
    if (!selectedRecord) return
    const lower = tool.toLowerCase()
    if (lower.includes('approve') || lower.includes('publish')) {
      void apiState.runAction(selectedResource, selectedRecord.id, lower.includes('publish') ? 'publish' : 'approve')
    } else if (lower.includes('reject')) {
      void apiState.runAction(selectedResource, selectedRecord.id, 'reject')
    } else if (lower.includes('suspend') || lower.includes('deactivate')) {
      void apiState.runAction(selectedResource, selectedRecord.id, 'suspend')
    } else if (lower.includes('close')) {
      void apiState.runAction(selectedResource, selectedRecord.id, 'close')
    } else if (lower.includes('resolve')) {
      void apiState.runAction(selectedResource, selectedRecord.id, 'resolve')
    } else if (lower.includes('paid') || lower.includes('verify')) {
      void apiState.runAction(selectedResource, selectedRecord.id, 'markPaid')
    } else if (lower.includes('export')) {
      downloadCsv(moduleName, rows)
    } else {
      setSelected({ resource: selectedResource, record: selectedRecord })
    }
  }

  if (moduleName === 'Members Management') {
    return <MembersProductionScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Membership Applications') {
    return <MembershipApplicationsScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Designation Applications') {
    return <DesignationApplicationsScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Active Designations') {
    return <ActiveDesignationsScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Designation Renewals') {
    return <DesignationRenewalsScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Website CMS') {
    return <WebsiteCmsScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Gallery Management') {
    return <GalleryManagementScreen apiState={apiState} searchQuery={searchQuery} />
  }
  if (moduleName === 'Payments & Finance') {
    return <PaymentsFinanceScreen apiState={apiState} searchQuery={searchQuery} />
  }

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-grid">
        <div className="col-12">
          <div className="inner-grid">
            <div className={showTools ? 'col-8' : 'col-12'}>
              <section className="logicsols-card table-card">
                <div className="table-title">
                  <h2>{resourceTitle}</h2>
                  <button type="button" onClick={() => setCreatingResource(primaryResource)}>+ Add New</button>
                </div>
                <div className="table-filters">
                  {statusFilters.map((filter) => (
                    <button className={status === filter ? 'active' : ''} type="button" key={filter} onClick={() => setStatus(filter)}>{filter}</button>
                  ))}
                </div>
                <p className="filter-result inline-result">Showing <b>{rows.length}</b> records for <b>{status}</b>.</p>
                <div className="table-scroll">
                  <table>
                    <thead><tr>{columns.map((head) => <th key={head}>{head}</th>)}</tr></thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} onClick={() => setSelected({ resource: row.resource, record: row.record })}>
                          {row.cells.map((cell, index) => (
                            <td key={`${row.id}-${columns[index]}`}>
                              {isStatusCell(columns[index]) ? <Status>{cell}</Status> : cell}
                            </td>
                          ))}
                          <td><button className="row-btn" type="button" onClick={(event) => { event.stopPropagation(); setSelected({ resource: row.resource, record: row.record }) }}>Open</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {showTools && (
              <div className="col-4">
                <section className="logicsols-card module-side-panel">
                  <h2>{moduleName} Tools</h2>
                  {getModuleTools(moduleName).map((tool) => (
                    <button type="button" key={tool} onClick={() => runTool(tool)}>
                      <span>{tool}</span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
      {selected && <RecordDrawer title={resourceTitle} resource={selected.resource} record={selected.record} apiState={apiState} onClose={() => setSelected(null)} />}
      {creatingResource && <CreateRecordModal resource={creatingResource} apiState={apiState} onClose={() => setCreatingResource(null)} />}
    </div>
  )
}

function MembersProductionScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [province, setProvince] = useState('All Provinces')
  const [district, setDistrict] = useState('All Districts')
  const [drawerRecord, setDrawerRecord] = useState<DpoRecord | null>(null)
  const [cardRecord, setCardRecord] = useState<DpoRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const members = apiState.records.members ?? []
  const membershipCards = apiState.records['membership-cards'] ?? []
  const activeMembers = members.filter((member) => normalizeStatus(member.status) === 'active')
  const pendingMembers = members.filter((member) => ['pending', 'underreview', 'requestinfo'].includes(normalizeStatus(member.status)))
  const districts = ['All Districts', ...Array.from(new Set(members.map((member) => toText(member.district)).filter(Boolean)))]
  const provinces = ['All Provinces', ...Array.from(new Set(members.map((member) => toText(member.province ?? member.country)).filter(Boolean)))]
  const visibleMembers = members.filter((member) => {
    const matchesSearch = searchQuery ? searchableText(member).includes(searchQuery.toLowerCase()) : true
    const matchesStatus = status === 'All' || normalizeStatus(member.status) === normalizeStatus(status) || normalizeStatus(member.paymentStatus) === normalizeStatus(status)
    const matchesDistrict = district === 'All Districts' || toText(member.district) === district
    const area = toText(member.province ?? member.country)
    const matchesProvince = province === 'All Provinces' || area === province
    return matchesSearch && matchesStatus && matchesDistrict && matchesProvince
  })
  const exportMembers = () => downloadCsv('Members Management', visibleMembers.map((record) => ({
    id: `members-${record.id}`,
    resource: 'members',
    record,
    cells: getLiveColumns('Members Management').map((column) => formatCell(column, record, 'members')),
  })))
  const canGenerateCard = (member: DpoRecord) => {
    const memberStatus = normalizeStatus(member.status)
    const paymentStatus = normalizeStatus(member.paymentStatus)
    return ['approved', 'active'].includes(memberStatus) && ['paid', 'approved', 'verified'].includes(paymentStatus)
  }
  const cardForMember = (member: DpoRecord) => membershipCards.find((card) =>
    toText(card.membershipNumber) === toText(member.membershipNumber) ||
    toText(card.name) === toText(member.name),
  )
  const handleMemberAction = async (member: DpoRecord, action: 'generate' | 'approve' | 'reject' | 'suspend' | 'reactivate' | 'markPaid' | 'markPending') => {
    setOpenMenuId(null)
    if (action === 'generate') {
      const existingCard = cardForMember(member)
      if (existingCard) {
        setCardRecord(existingCard)
        return
      }
      const card = await apiState.createRecord('membership-cards', {
        cardNumber: `CARD-${String(membershipCards.length + 1).padStart(6, '0')}`,
        membershipNumber: member.membershipNumber,
        name: member.name,
        templateVersion: 'Membership Card v2.1',
        qrValue: `DPO:${toText(member.membershipNumber)}`,
        status: 'active',
      })
      setCardRecord(card)
      setActionMessage(`Card generated for ${toText(member.name) || 'member'}.`)
      return
    }
    if (action === 'approve') {
      await apiState.updateRecord('members', member.id, { status: 'approved' })
      setActionMessage(`${toText(member.name) || 'Member'} marked approved.`)
      return
    }
    if (action === 'reject') {
      await apiState.updateRecord('members', member.id, { status: 'rejected' })
      setActionMessage(`${toText(member.name) || 'Member'} rejected.`)
      return
    }
    if (action === 'suspend') {
      await apiState.runAction('members', member.id, 'suspend')
      setActionMessage(`${toText(member.name) || 'Member'} suspended.`)
      return
    }
    if (action === 'reactivate') {
      await apiState.runAction('members', member.id, 'reactivate')
      setActionMessage(`${toText(member.name) || 'Member'} reactivated.`)
      return
    }
    if (action === 'markPaid') {
      await apiState.updateRecord('members', member.id, { paymentStatus: 'paid' })
      setActionMessage(`Payment marked paid for ${toText(member.name) || 'member'}.`)
      return
    }
    await apiState.updateRecord('members', member.id, { paymentStatus: 'pending' })
    setActionMessage(`Payment marked pending for ${toText(member.name) || 'member'}.`)
  }

  return (
    <div className="dashboard-wrap members-page">
      <section className="member-kpis">
        <MemberKpi icon={UsersRound} label="Total Members" value={members.length} note="All registered members" tone="success" />
        <MemberKpi icon={CircleCheck} label="Active Members" value={activeMembers.length} note={`${members.length ? Math.round((activeMembers.length / members.length) * 100) : 0}% of total members`} tone="success" />
        <MemberKpi icon={Clock} label="Pending Review" value={pendingMembers.length} note="Awaiting verification" tone="warning" />
        <MemberKpi icon={CreditCard} label="Cards Generated" value={membershipCards.length} note="Managed inside members" tone="success" />
      </section>

      <div className="members-workspace">
        <section className="members-table-panel">
          <div className="members-toolbar">
            <button className="primary-action" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Add Member</button>
            <button className="soft-action" type="button" onClick={exportMembers}><Download size={15} /> Export</button>
            <div className="status-segment">
              {['All', 'Pending', 'Expired'].map((filter) => (
                <button className={status === filter ? 'active' : ''} type="button" key={filter} onClick={() => setStatus(filter)}>{filter}</button>
              ))}
            </div>
            <select value={province} onChange={(event) => setProvince(event.target.value)} aria-label="Province">
              {provinces.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="District">
              {districts.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="production-table-scroll">
            <table className="production-members-table">
              <thead>
                <tr>
                  {['Member ID', 'Name', 'CNIC', 'Phone', 'District', 'Payment', 'Status', 'Expiry', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((member) => (
                  <tr key={member.id} onClick={() => setDrawerRecord(member)}>
                    <td>{toText(member.membershipNumber)}</td>
                    <td><b>{toText(member.name)}</b><small>{toText(member.country) || 'Pakistan'}</small></td>
                    <td>{toText(member.cnicMasked)}</td>
                    <td>{toText(member.phone)}</td>
                    <td>{toText(member.district)}</td>
                    <td><Status>{titleStatus(member.paymentStatus)}</Status></td>
                    <td><Status>{titleStatus(member.status)}</Status></td>
                    <td>{formatDate(member.expiryDate)}</td>
                    <td>
                      <div className="member-row-actions">
                        {(canGenerateCard(member) || cardForMember(member)) && (
                          <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); void handleMemberAction(member, 'generate') }}>
                            <CreditCard size={14} /> {cardForMember(member) ? 'View Card' : 'Generate Card'}
                          </button>
                        )}
                        <button className="icon-table-btn view-btn" type="button" aria-label="View member" onClick={(event) => { event.stopPropagation(); setDrawerRecord(member) }}><Eye size={16} /></button>
                        <div className="row-menu-wrap">
                          <button className="icon-table-btn more-btn" type="button" aria-label="More member actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === member.id ? null : member.id) }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === member.id && (
                            <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                              <button type="button" onClick={() => void handleMemberAction(member, 'approve')}>Approve</button>
                              <button type="button" onClick={() => void handleMemberAction(member, 'reject')}>Reject</button>
                              <button type="button" onClick={() => void handleMemberAction(member, 'suspend')}>Suspend</button>
                              <button type="button" onClick={() => void handleMemberAction(member, 'reactivate')}>Reactivate</button>
                              <button type="button" onClick={() => void handleMemberAction(member, 'markPaid')}>Payment Paid</button>
                              <button type="button" onClick={() => void handleMemberAction(member, 'markPending')}>Payment Pending</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="members-pagination">
            <span>Showing 1 to {visibleMembers.length} of {members.length} members</span>
            <div>
              <button type="button">‹</button>
              <button className="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">›</button>
            </div>
          </div>
        </section>

      </div>

      {drawerRecord && <RecordDrawer title="Members Management" resource="members" record={drawerRecord} apiState={apiState} onClose={() => setDrawerRecord(null)} />}
      {cardRecord && <RecordDrawer title="Membership Card" resource="membership-cards" record={cardRecord} apiState={apiState} onClose={() => setCardRecord(null)} />}
      {creating && <CreateRecordModal resource="members" apiState={apiState} onClose={() => setCreating(false)} />}
      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function MemberKpi({ icon: Icon, label, value, note, tone }: { icon: LucideIcon; label: string; value: number; note: string; tone: 'success' | 'warning' | 'danger' }) {
  return (
    <article className="member-kpi-card">
      <span className={`member-kpi-icon ${tone}`}><Icon size={24} /></span>
      <div>
        <p>{label}</p>
        <b>{formatNumber(value)}</b>
        <small>{note}</small>
      </div>
    </article>
  )
}

const paymentSettingFields = [
  ['payment_account_title', 'Account Title'],
  ['payment_bank_name', 'Bank Name'],
  ['payment_account_number', 'Account Number'],
  ['payment_iban', 'IBAN'],
  ['payment_instructions_note', 'Payment Note'],
] as const

function PaymentsFinanceScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState<{ resource: string; record: DpoRecord } | null>(null)
  const [creating, setCreating] = useState(false)
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const paymentSettings = apiState.records.settings?.filter((setting) => paymentSettingFields.some(([key]) => key === toText(setting.key))) ?? []
  const { columns, rows } = useMemo(
    () => getLiveModuleTable('Payments & Finance', status, apiState, searchQuery),
    [status, apiState, searchQuery],
  )

  useEffect(() => {
    const nextDraft = Object.fromEntries(paymentSettingFields.map(([key]) => {
      const setting = paymentSettings.find((item) => toText(item.key) === key)
      return [key, formatSettingValue(setting?.value ?? '')]
    }))
    setDraft(nextDraft)
  }, [apiState.records.settings])

  const saveBankDetails = async () => {
    setSaving(true)
    setMessage('')
    try {
      for (const [key] of paymentSettingFields) {
        const setting = paymentSettings.find((item) => toText(item.key) === key)
        if (setting) {
          await apiState.updateRecord('settings', setting.id, { value: draft[key] ?? '', status: 'active' })
        }
      }
      setMessage('Bank details updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bank details could not be updated.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-grid">
        <div className="col-12">
          <section className="logicsols-card table-card">
            <div className="table-title">
              <h2>Manual Payments</h2>
              <div className="toolbar-actions">
                <button type="button" onClick={() => setBankModalOpen(true)}>Bank Details</button>
                <button type="button" onClick={() => setCreating(true)}>+ Add Payment</button>
              </div>
            </div>
            <div className="table-filters">
              {['All', 'Pending', 'Paid'].map((filter) => (
                <button className={status === filter ? 'active' : ''} type="button" key={filter} onClick={() => setStatus(filter)}>{filter}</button>
              ))}
            </div>
            <p className="filter-result inline-result">Showing <b>{rows.length}</b> records for <b>{status}</b>.</p>
            <div className="table-scroll">
              <table>
                <thead><tr>{columns.map((head) => <th key={head}>{head}</th>)}</tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} onClick={() => setSelected({ resource: row.resource, record: row.record })}>
                      {row.cells.map((cell, index) => (
                        <td key={`${row.id}-${columns[index]}`}>
                          {isStatusCell(columns[index]) ? <Status>{cell}</Status> : cell}
                        </td>
                      ))}
                      <td><button className="row-btn" type="button" onClick={(event) => { event.stopPropagation(); setSelected({ resource: row.resource, record: row.record }) }}>Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      {bankModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <aside className="record-drawer compact-drawer">
            <div className="drawer-head">
              <div>
                <span>Payments & Finance</span>
                <h2>Bank Details</h2>
              </div>
              <button type="button" onClick={() => setBankModalOpen(false)}>Close</button>
            </div>
            <div className="drawer-form">
              {paymentSettingFields.map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input value={draft[key] ?? ''} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} />
                </label>
              ))}
            </div>
            {message && <p className="filter-result inline-result">{message}</p>}
            <div className="drawer-footer">
              <button type="button" onClick={() => setBankModalOpen(false)}>Cancel</button>
              <button type="button" disabled={saving} onClick={() => void saveBankDetails()}>{saving ? 'Saving...' : 'Save Details'}</button>
            </div>
          </aside>
        </div>
      )}
      {selected && <RecordDrawer title="Manual Payment" resource={selected.resource} record={selected.record} apiState={apiState} onClose={() => setSelected(null)} />}
      {creating && <CreateRecordModal resource="payments" apiState={apiState} onClose={() => setCreating(false)} />}
    </div>
  )
}

function MembershipApplicationsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [paymentStatus, setPaymentStatus] = useState('All')
  const [district, setDistrict] = useState('All Districts')
  const [drawerRecord, setDrawerRecord] = useState<DpoRecord | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const applications = apiState.records['membership-applications'] ?? []
  const statusOptions = ['All', ...Array.from(new Set(applications.map((item) => titleStatus(item.status)).filter(Boolean)))]
  const paymentOptions = ['All', ...Array.from(new Set(applications.map((item) => titleStatus(item.paymentStatus)).filter(Boolean)))]
  const visibleApplications = applications.filter((application) => {
    const matchesSearch = searchQuery ? searchableText(application).includes(searchQuery.toLowerCase()) : true
    const matchesStatus = status === 'All' || normalizeStatus(application.status) === normalizeStatus(status)
    const matchesPayment = paymentStatus === 'All' || normalizeStatus(application.paymentStatus) === normalizeStatus(paymentStatus)
    const matchesDistrict = district === 'All Districts' || toText(application.district) === district
    return matchesSearch && matchesStatus && matchesPayment && matchesDistrict
  })
  const districtOptions = ['All Districts', ...Array.from(new Set(applications.map((item) => toText(item.district)).filter(Boolean)))]
  const documentNeeds = applications.filter((item) => documentSummary(item).tone !== 'success').length
  const paymentVerified = applications.filter((item) => ['paid', 'verified', 'approved'].includes(normalizeStatus(item.paymentStatus))).length
  const rejected = applications.filter((item) => normalizeStatus(item.status) === 'rejected').length
  const exportApplications = () => downloadCsv('Membership Applications', visibleApplications.map((record) => ({
    cells: ['applicationNumber', 'name', 'cnicMasked', 'phone', 'district', 'paymentStatus', 'status', 'createdAt'].map((key) => formatCompactValue(record[key])),
  })))
  const handleApplicationAction = async (application: DpoRecord, action: 'approve' | 'reject' | 'requestInfo' | 'markPaid' | 'markPending') => {
    setOpenMenuId(null)
    try {
      if (action === 'approve') {
        await apiState.updateRecord('membership-applications', application.id, { status: 'approved' })
        setActionMessage(`${toText(application.name) || 'Application'} approved.`)
        return
      }
      if (action === 'reject') {
        await apiState.updateRecord('membership-applications', application.id, { status: 'rejected' })
        setActionMessage(`${toText(application.name) || 'Application'} rejected.`)
        return
      }
      if (action === 'markPaid') {
        await apiState.updateRecord('membership-applications', application.id, { paymentStatus: 'paid' })
        setActionMessage(`Payment marked paid for ${toText(application.name) || 'application'}.`)
        return
      }
      if (action === 'markPending') {
        await apiState.updateRecord('membership-applications', application.id, { paymentStatus: 'pending' })
        setActionMessage(`Payment marked pending for ${toText(application.name) || 'application'}.`)
        return
      }
      await apiState.updateRecord('membership-applications', application.id, { status: 'requestInfo' })
      setActionMessage(`Information requested from ${toText(application.name) || 'applicant'}.`)
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Application action failed.')
    }
  }

  return (
    <div className="dashboard-wrap members-page applications-page">
      <section className="member-kpis">
        <MemberKpi icon={UsersRound} label="New Applications" value={applications.length} note="Total received requests" tone="success" />
        <MemberKpi icon={FileText} label="Pending Documents" value={documentNeeds} note="Need verification" tone="warning" />
        <MemberKpi icon={CreditCard} label="Payment Verified" value={paymentVerified} note="Ready for review" tone="success" />
        <MemberKpi icon={CircleX} label="Rejected This Month" value={rejected} note="Not approved" tone="danger" />
      </section>

      <div className="members-workspace">
        <section className="members-table-panel">
          <div className="members-toolbar applications-toolbar">
            <button className="primary-action" type="button" onClick={() => visibleApplications[0] && void handleApplicationAction(visibleApplications[0], 'approve')}><CircleCheck size={16} /> Approve Selected</button>
            <button className="soft-action" type="button" onClick={exportApplications}><Download size={15} /> Export</button>
            <label className="filter-field">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Application status">
                {statusOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="filter-field">
              <span>Payment</span>
              <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} aria-label="Payment status">
                {paymentOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="filter-field">
              <span>District</span>
              <select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="District">
                {districtOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="application-alert">
            <AlertTriangle size={16} />
            <span>{documentNeeds || 0} applications need document verification</span>
          </div>

          <div className="production-table-scroll">
            <table className="production-members-table applications-table">
              <thead>
                <tr>
                  {['Application ID', 'Applicant', 'CNIC', 'Phone', 'District', 'Payment', 'Documents', 'Status', 'Submitted', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((application) => (
                  <tr key={application.id} onClick={() => setDrawerRecord(application)}>
                    {(() => {
                      const docs = documentSummary(application)
                      const isApproved = normalizeStatus(application.status) === 'approved'
                      const isRejected = normalizeStatus(application.status) === 'rejected'
                      return (
                        <>
                    <td>{toText(application.applicationNumber ?? application.id)}</td>
                    <td><b>{toText(application.name)}</b><small>{toText(application.country) || 'Pakistan'}</small></td>
                    <td>{toText(application.cnicMasked)}</td>
                    <td>{toText(application.phone)}</td>
                    <td>{toText(application.district)}</td>
                    <td><Status>{titleStatus(application.paymentStatus)}</Status></td>
                    <td><Tag tone={docs.tone}>{docs.label}</Tag></td>
                    <td><Status>{titleStatus(application.status)}</Status></td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <div className="member-row-actions">
                        {!isApproved && (
                          <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); void handleApplicationAction(application, 'approve') }}>
                            <CircleCheck size={14} /> Approve
                          </button>
                        )}
                        {!isRejected && <button className="reject-row" type="button" onClick={(event) => { event.stopPropagation(); void handleApplicationAction(application, 'reject') }}>Reject</button>}
                        <button className="icon-table-btn view-btn" type="button" aria-label="View application" onClick={(event) => { event.stopPropagation(); setDrawerRecord(application) }}><Eye size={16} /></button>
                        <div className="row-menu-wrap">
                          <button className="icon-table-btn more-btn" type="button" aria-label="More application actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === application.id ? null : application.id) }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === application.id && (
                            <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                              {!isApproved && <button type="button" onClick={() => void handleApplicationAction(application, 'approve')}>Approve</button>}
                              {!isRejected && <button type="button" onClick={() => void handleApplicationAction(application, 'reject')}>Reject</button>}
                              <button type="button" onClick={() => void handleApplicationAction(application, 'requestInfo')}>Request Info</button>
                              <button type="button" onClick={() => void handleApplicationAction(application, 'markPaid')}>Payment Paid</button>
                              <button type="button" onClick={() => void handleApplicationAction(application, 'markPending')}>Payment Pending</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                        </>
                      )
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="members-pagination">
            <span>Showing 1 to {visibleApplications.length} of {applications.length} applications</span>
            <div>
              <button type="button">&lt;</button>
              <button className="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">&gt;</button>
            </div>
          </div>
        </section>
      </div>

      {drawerRecord && <RecordDrawer title="Membership Applications" resource="membership-applications" record={drawerRecord} apiState={apiState} onClose={() => setDrawerRecord(null)} />}
      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function DesignationApplicationsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [province, setProvince] = useState('All Provinces')
  const [district, setDistrict] = useState('All Districts')
  const [designation, setDesignation] = useState('All Designations')
  const [paymentStatus, setPaymentStatus] = useState('All Payments')
  const [selectedApplication, setSelectedApplication] = useState<DpoRecord | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const applications = apiState.records['designation-applications'] ?? []
  const visibleApplications = applications.filter((application) => {
    const matchesSearch = searchQuery ? searchableText(application).includes(searchQuery.toLowerCase()) : true
    const matchesStatus = status === 'All' || normalizeStatus(application.status) === normalizeStatus(status)
    const matchesProvince = province === 'All Provinces' || toText(application.province) === province
    const matchesDistrict = district === 'All Districts' || toText(application.district) === district
    const matchesDesignation = designation === 'All Designations' || toText(application.designation) === designation
    const matchesPayment = paymentStatus === 'All Payments' || normalizeStatus(application.paymentStatus) === normalizeStatus(paymentStatus)
    return matchesSearch && matchesStatus && matchesProvince && matchesDistrict && matchesDesignation && matchesPayment
  })
  const activeApplication = selectedApplication ?? visibleApplications[0]
  const statusOptions = ['All', ...Array.from(new Set(applications.map((item) => titleStatus(item.status)).filter(Boolean)))]
  const provinceOptions = ['All Provinces', ...Array.from(new Set(applications.map((item) => toText(item.province)).filter(Boolean)))]
  const districtOptions = ['All Districts', ...Array.from(new Set(applications.map((item) => toText(item.district)).filter(Boolean)))]
  const designationOptions = ['All Designations', ...Array.from(new Set(applications.map((item) => toText(item.designation)).filter(Boolean)))]
  const paymentOptions = ['All Payments', ...Array.from(new Set(applications.map((item) => titleStatus(item.paymentStatus)).filter(Boolean)))]
  const pending = applications.filter((item) => normalizeStatus(item.status) === 'pending').length
  const approved = applications.filter((item) => normalizeStatus(item.status) === 'approved').length
  const rejected = applications.filter((item) => normalizeStatus(item.status) === 'rejected').length
  const paid = applications.filter((item) => ['paid', 'verified', 'approved'].includes(normalizeStatus(item.paymentStatus))).length
  const syncSelectedApplication = (application: DpoRecord, patch: Record<string, unknown>) => {
    setSelectedApplication((current) => {
      if (!current || current.id !== application.id) {
        return { ...application, ...patch }
      }
      return { ...current, ...patch }
    })
  }
  const openDesignationReview = (application: DpoRecord) => {
    setOpenMenuId(null)
    setSelectedApplication(application)
    setActionMessage(`${toText(application.applicant ?? application.name) || 'Application'} opened for review.`)
  }
  const handleDesignationAction = async (application: DpoRecord, action: 'approve' | 'reject') => {
    setOpenMenuId(null)
    const nextStatus = action === 'approve' ? 'approved' : 'rejected'
    try {
      if (action === 'approve') {
        await apiState.runAction('designation-applications', application.id, 'approve')
        syncSelectedApplication(application, { status: nextStatus })
        setActionMessage(`${toText(application.applicant ?? application.name) || 'Application'} approved.`)
        return
      }
      await apiState.updateRecord('designation-applications', application.id, { status: 'rejected' })
      syncSelectedApplication(application, { status: nextStatus })
      setActionMessage(`${toText(application.applicant ?? application.name) || 'Application'} rejected.`)
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Designation action failed.')
    }
  }

  return (
    <div className="dashboard-wrap members-page designation-page">
      <section className="member-kpis">
        <MemberKpi icon={Clock} label="Pending Reviews" value={pending} note="Awaiting admin decision" tone="warning" />
        <MemberKpi icon={CircleCheck} label="Approved" value={approved} note="Moved to active designations" tone="success" />
        <MemberKpi icon={CircleX} label="Rejected" value={rejected} note="Not approved" tone="danger" />
        <MemberKpi icon={CreditCard} label="Fee Verified" value={paid} note="Ready for review" tone="success" />
      </section>

      <section className="members-table-panel designation-table-panel">
        <div className="members-toolbar designation-toolbar">
          <label className="filter-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="filter-field">
            <span>Province</span>
            <select value={province} onChange={(event) => setProvince(event.target.value)}>{provinceOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="filter-field">
            <span>District</span>
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>{districtOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="filter-field">
            <span>Designation</span>
            <select value={designation} onChange={(event) => setDesignation(event.target.value)}>{designationOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="filter-field">
            <span>Payment</span>
            <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>{paymentOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
        </div>

        <div className="production-table-scroll">
          <table className="production-members-table designation-applications-table">
            <thead>
              <tr>{['Application ID', 'Applicant', 'CNIC', 'Designation', 'Province', 'District', 'Payment', 'Documents', 'Status', 'Submitted', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}</tr>
            </thead>
            <tbody>
              {visibleApplications.map((application) => {
                const docs = documentSummary(application)
                const isApproved = normalizeStatus(application.status) === 'approved'
                const isRejected = normalizeStatus(application.status) === 'rejected'
                const canApprove = canApproveDesignationApplication(application)
                return (
                  <tr className={activeApplication?.id === application.id ? 'selected-row' : ''} key={application.id} onClick={() => setSelectedApplication(application)}>
                    <td>{toText(application.applicationNumber ?? application.id)}</td>
                    <td><b>{toText(application.applicant ?? application.name)}</b><small>{toText(application.wing) || 'DPO'}</small></td>
                    <td>{toText(application.cnicMasked ?? application.cnic) || '-'}</td>
                    <td>{toText(application.designation)}</td>
                    <td>{toText(application.province)}</td>
                    <td>{toText(application.district)}</td>
                    <td><Status>{titleStatus(application.paymentStatus)}</Status></td>
                    <td><Tag tone={docs.tone}>{docs.label}</Tag></td>
                    <td><Status>{titleStatus(application.status)}</Status></td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <div className="member-row-actions">
                        {!isApproved && <button className="generate-card-row" type="button" disabled={!canApprove} title={canApprove ? 'Approve application' : 'Verify payment and documents first'} onClick={(event) => { event.stopPropagation(); void handleDesignationAction(application, 'approve') }}>Approve</button>}
                        {!isRejected && <button className="reject-row" type="button" onClick={(event) => { event.stopPropagation(); void handleDesignationAction(application, 'reject') }}>Reject</button>}
                        <button className="icon-table-btn view-btn" type="button" aria-label="Review designation application" onClick={(event) => { event.stopPropagation(); openDesignationReview(application) }}><Eye size={16} /></button>
                        <div className="row-menu-wrap">
                          <button className="icon-table-btn more-btn" type="button" aria-label="More designation actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === application.id ? null : application.id) }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === application.id && (
                            <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                              {!isApproved && <button type="button" disabled={!canApprove} onClick={() => void handleDesignationAction(application, 'approve')}>Approve</button>}
                              {!isRejected && <button type="button" onClick={() => void handleDesignationAction(application, 'reject')}>Reject</button>}
                              <button type="button" onClick={() => openDesignationReview(application)}>Review</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="members-pagination">
          <span>Showing 1 to {visibleApplications.length} of {applications.length} designation applications</span>
          <div>
            <button type="button">&lt;</button>
            <button className="active" type="button">1</button>
            <button type="button">&gt;</button>
          </div>
        </div>
      </section>

      {activeApplication && (
        <section className="designation-review-panel">
          <div className="designation-review-head">
            <div>
              <span>Reviewing Application</span>
              <h2>{toText(activeApplication.applicationNumber ?? activeApplication.id)}</h2>
            </div>
            <Status>{titleStatus(activeApplication.status)}</Status>
          </div>
          <div className="designation-review-grid">
            <ReviewBlock title="Personal Information" pairs={[
              ['Name', toText(activeApplication.applicant ?? activeApplication.name)],
              ['CNIC', toText(activeApplication.cnicMasked ?? activeApplication.cnic) || '-'],
              ['Phone', toText(activeApplication.phone) || '-'],
              ['Email', toText(activeApplication.email) || '-'],
            ]} />
            <ReviewBlock title="Designation Details" pairs={[
              ['Designation', toText(activeApplication.designation)],
              ['Wing', toText(activeApplication.wing)],
              ['Validity', activeApplication.validityMonths ? `${toText(activeApplication.validityMonths)} months` : '-'],
              ['Payment', titleStatus(activeApplication.paymentStatus)],
            ]} />
            <ReviewBlock title="Area Details" pairs={[
              ['Province', toText(activeApplication.province)],
              ['District', toText(activeApplication.district)],
              ['Area', toText(activeApplication.area)],
              ['Country', toText(activeApplication.country) || 'Pakistan'],
            ]} />
            <div className="designation-docs-panel">
              <h3>Required Documents</h3>
              <ApplicationDocumentReview key={activeApplication.id} resource="designation-applications" record={activeApplication} apiState={apiState} compact onUpdated={(patch) => syncSelectedApplication(activeApplication, patch)} />
            </div>
          </div>
          <footer className="designation-decision-bar">
            <div>
              <b>Admin Decision</b>
              <span>Review application details and take action.</span>
            </div>
            <div>
              {normalizeStatus(activeApplication.status) !== 'approved' && <button className="primary-action" type="button" disabled={!canApproveDesignationApplication(activeApplication)} title={canApproveDesignationApplication(activeApplication) ? 'Approve application' : 'Verify payment and documents first'} onClick={() => void handleDesignationAction(activeApplication, 'approve')}>Approve Application</button>}
              {normalizeStatus(activeApplication.status) !== 'rejected' && <button className="reject-row" type="button" onClick={() => void handleDesignationAction(activeApplication, 'reject')}>Reject Application</button>}
            </div>
          </footer>
        </section>
      )}

      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function ReviewBlock({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <div className="designation-review-block">
      <h3>{title}</h3>
      {pairs.map(([label, value]) => (
        <p key={label}><span>{label}</span><b>{value || '-'}</b></p>
      ))}
    </div>
  )
}

function ActiveDesignationsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [localSearch, setLocalSearch] = useState('')
  const [province, setProvince] = useState('All Provinces')
  const [status, setStatus] = useState('All Statuses')
  const [selectedDesignation, setSelectedDesignation] = useState<DpoRecord | null>(null)
  const [drawerState, setDrawerState] = useState<{ record: DpoRecord; editing: boolean } | null>(null)
  const [creating, setCreating] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const designations = apiState.records['active-designations'] ?? []
  const activeDesignations = designations.filter((item) => normalizeStatus(item.status) === 'active')
  const today = new Date()
  const inThirtyDays = new Date(today)
  inThirtyDays.setDate(today.getDate() + 30)
  const expiringSoon = designations.filter((item) => {
    const expiry = new Date(toText(item.expiryDate))
    return Number.isFinite(expiry.getTime()) && expiry >= today && expiry <= inThirtyDays
  })
  const provinceOptions = ['All Provinces', ...Array.from(new Set(designations.map((item) => toText(item.province)).filter(Boolean)))]
  const statusOptions = ['All Statuses', ...Array.from(new Set(designations.map((item) => titleStatus(item.status)).filter(Boolean)))]
  const visibleDesignations = designations.filter((designationRecord) => {
    const searchTerms = [searchQuery, localSearch].filter(Boolean).map((term) => term.toLowerCase())
    const rowSearch = searchableText(designationRecord)
    const matchesSearch = searchTerms.every((term) => rowSearch.includes(term))
    const matchesProvince = province === 'All Provinces' || toText(designationRecord.province) === province
    const matchesStatus = status === 'All Statuses' || normalizeStatus(designationRecord.status) === normalizeStatus(status)
    return matchesSearch && matchesProvince && matchesStatus
  })
  const activeDesignation = selectedDesignation ?? visibleDesignations[0]
  const provinceCoverage = [
    { name: 'Punjab', aliases: ['punjab'] },
    { name: 'Sindh', aliases: ['sindh'] },
    { name: 'KPK', aliases: ['kpk', 'khyber pakhtunkhwa'] },
    { name: 'Balochistan', aliases: ['balochistan'] },
    { name: 'Islamabad', aliases: ['islamabad', 'capital territory'] },
  ].map((provinceItem) => ({
    name: provinceItem.name,
    count: designations.filter((item) => provinceItem.aliases.some((alias) => toText(item.province).toLowerCase().includes(alias))).length,
    aliases: provinceItem.aliases,
  }))
  const maxProvinceCount = Math.max(...provinceCoverage.map((item) => item.count), 1)
  const suspendDesignation = async (designationRecord: DpoRecord) => {
    try {
      await apiState.updateRecord('active-designations', designationRecord.id, { status: 'suspended' })
      setSelectedDesignation({ ...designationRecord, status: 'suspended' })
      setActionMessage(`${toText(designationRecord.holder ?? designationRecord.name) || 'Designation'} suspended.`)
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Designation action failed.')
    }
  }

  return (
    <div className="dashboard-wrap active-designations-page">
      <section className="member-kpis">
        <MemberKpi icon={BadgeCheck} label="Active Designations" value={activeDesignations.length} note="Currently assigned" tone="success" />
        <MemberKpi icon={MapPinned} label="Covered Districts" value={new Set(designations.map((item) => toText(item.district)).filter(Boolean)).size} note="District presence" tone="success" />
        <MemberKpi icon={AlertTriangle} label="Vacant Areas" value={Math.max(0, 24 - activeDesignations.length)} note="Need assignment" tone="warning" />
        <MemberKpi icon={CalendarDays} label="Expiring Soon" value={expiringSoon.length} note="Within 30 days" tone="danger" />
      </section>

      <section className="active-analytics-grid">
        <div className="active-analytics-card province-coverage-card">
          <h3><MapPinned size={17} /> Province Coverage</h3>
          {provinceCoverage.map((item) => (
            <div className="coverage-row" key={item.name}>
              <span>{item.name}</span>
              <div><i style={{ width: `${Math.max(12, (item.count / maxProvinceCount) * 100)}%` }} /></div>
              <b>{item.count}</b>
            </div>
          ))}
          <p>Total covered districts: {new Set(designations.map((item) => toText(item.district)).filter(Boolean)).size}</p>
        </div>
      </section>

      <section className="members-table-panel active-designations-table-panel">
        <div className="members-toolbar active-designations-toolbar">
          <label className="filter-field search-filter">
            <span>Search</span>
            <div className="local-search-box"><Search size={16} /><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search holder or district..." /></div>
          </label>
          <label className="filter-field">
            <span>Province</span>
            <select value={province} onChange={(event) => setProvince(event.target.value)}>{provinceOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="filter-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <button className="primary-action" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Add Designation</button>
        </div>
        <div className="production-table-scroll">
          <table className="production-members-table active-designations-table">
            <thead>
              <tr>{['Holder', 'Designation', 'Province', 'District', 'Area', 'Expiry', 'Status', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}</tr>
            </thead>
            <tbody>
              {visibleDesignations.map((designationRecord) => (
                <tr className={activeDesignation?.id === designationRecord.id ? 'selected-row' : ''} key={designationRecord.id} onClick={() => setSelectedDesignation(designationRecord)}>
                  <td><b>{toText(designationRecord.holder ?? designationRecord.name)}</b><small>{toText(designationRecord.membershipNumber) || '-'}</small></td>
                  <td>{toText(designationRecord.designation)}</td>
                  <td>{toText(designationRecord.province)}</td>
                  <td>{toText(designationRecord.district)}</td>
                  <td>{toText(designationRecord.area)}</td>
                  <td>{formatDate(designationRecord.expiryDate)}</td>
                  <td><Status>{titleStatus(designationRecord.status)}</Status></td>
                  <td>
                    <div className="member-row-actions">
                      <button className="icon-table-btn view-btn" type="button" aria-label="View designation" onClick={(event) => { event.stopPropagation(); setSelectedDesignation(designationRecord); setDrawerState({ record: designationRecord, editing: false }) }}><Eye size={16} /></button>
                      <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); setSelectedDesignation(designationRecord); setDrawerState({ record: designationRecord, editing: true }) }}>Edit</button>
                      {normalizeStatus(designationRecord.status) !== 'suspended' && <button className="reject-row" type="button" onClick={(event) => { event.stopPropagation(); void suspendDesignation(designationRecord) }}>Suspend</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="members-pagination">
          <span>Showing 1 to {visibleDesignations.length} of {designations.length} active designations</span>
          <div>
            <button type="button">&lt;</button>
            <button className="active" type="button">1</button>
            <button type="button">&gt;</button>
          </div>
        </div>
      </section>

      {activeDesignation && (
        <section className="active-designation-details">
          <ReviewBlock title="Holder Info" pairs={[
            ['Holder', toText(activeDesignation.holder ?? activeDesignation.name)],
            ['Membership', toText(activeDesignation.membershipNumber) || '-'],
            ['Designation', toText(activeDesignation.designation)],
            ['Wing', toText(activeDesignation.wing) || '-'],
          ]} />
          <ReviewBlock title="Area Assignment" pairs={[
            ['Province', toText(activeDesignation.province)],
            ['District', toText(activeDesignation.district)],
            ['Area', toText(activeDesignation.area)],
            ['Assigned On', formatDate(activeDesignation.issueDate)],
          ]} />
          <div className="active-quick-actions">
            <h3>Quick Actions</h3>
            <button type="button" onClick={() => setDrawerState({ record: activeDesignation, editing: false })}><Eye size={15} /> View Details</button>
            <button type="button" onClick={() => setDrawerState({ record: activeDesignation, editing: true })}>Edit Designation</button>
            {normalizeStatus(activeDesignation.status) !== 'suspended' && <button className="danger-action" type="button" onClick={() => void suspendDesignation(activeDesignation)}>Suspend</button>}
          </div>
        </section>
      )}

      {creating && <CreateRecordModal resource="active-designations" apiState={apiState} onClose={() => setCreating(false)} />}
      {drawerState && <RecordDrawer title="Active Designation" resource="active-designations" record={drawerState.record} apiState={apiState} startEditing={drawerState.editing} onClose={() => setDrawerState(null)} />}
      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function DesignationRenewalsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [district, setDistrict] = useState('All Districts')
  const [selectedRenewal, setSelectedRenewal] = useState<DpoRecord | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const renewals = apiState.records['designation-renewals'] ?? []
  const today = new Date()
  const inThirtyDays = new Date(today)
  inThirtyDays.setDate(today.getDate() + 30)
  const visibleRenewals = renewals.filter((renewal) => {
    const matchesSearch = searchQuery ? searchableText(renewal).includes(searchQuery.toLowerCase()) : true
    const matchesStatus = status === 'All' || normalizeStatus(renewal.status) === normalizeStatus(status)
    const matchesDistrict = district === 'All Districts' || toText(renewal.district) === district
    return matchesSearch && matchesStatus && matchesDistrict
  })
  const activeRenewal = selectedRenewal ?? visibleRenewals[0]
  const pending = renewals.filter((renewal) => normalizeStatus(renewal.status) === 'pending').length
  const approved = renewals.filter((renewal) => normalizeStatus(renewal.status) === 'approved').length
  const expiringThisMonth = renewals.filter((renewal) => {
    const expiry = new Date(toText(renewal.expiryDate))
    return Number.isFinite(expiry.getTime()) && expiry >= today && expiry <= inThirtyDays
  }).length
  const statusOptions = ['All', ...Array.from(new Set(renewals.map((renewal) => titleStatus(renewal.status)).filter(Boolean)))]
  const districtOptions = ['All Districts', ...Array.from(new Set(renewals.map((renewal) => toText(renewal.district)).filter(Boolean)))]
  const exportRenewals = () => downloadCsv('Designation Renewals', visibleRenewals.map((record) => ({
    cells: ['renewalNumber', 'holder', 'designation', 'district', 'expiryDate', 'paymentStatus', 'status'].map((key) => formatCompactValue(record[key])),
  })))
  const handleRenewalAction = async (renewal: DpoRecord, nextStatus: 'approved' | 'rejected') => {
    try {
      await apiState.updateRecord('designation-renewals', renewal.id, { status: nextStatus })
      setSelectedRenewal({ ...renewal, status: nextStatus })
      setActionMessage(`${toText(renewal.holder) || 'Renewal'} ${nextStatus}.`)
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Renewal action failed.')
    }
  }

  return (
    <div className="dashboard-wrap renewal-page">
      <section className="member-kpis">
        <MemberKpi icon={Clock} label="Pending Renewals" value={pending} note="Requires your action" tone="warning" />
        <MemberKpi icon={CircleCheck} label="Approved Renewals" value={approved} note="This year" tone="success" />
        <MemberKpi icon={CalendarDays} label="Expiring This Month" value={expiringThisMonth} note="Due within 30 days" tone="warning" />
      </section>

      <section className="members-table-panel renewal-table-panel">
        <div className="members-toolbar renewal-toolbar">
          <label className="filter-field search-filter">
            <span>Search</span>
            <div className="local-search-box"><Search size={16} /><input value={searchQuery} readOnly placeholder="Use top search bar" /></div>
          </label>
          <label className="filter-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="filter-field">
            <span>District</span>
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>{districtOptions.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <button className="soft-action" type="button" onClick={exportRenewals}><Download size={15} /> Export</button>
        </div>
        <div className="production-table-scroll">
          <table className="production-members-table renewal-table">
            <thead>
              <tr>{['Renewal No', 'Holder', 'Designation', 'District', 'Expiry Date', 'Payment', 'Status', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}</tr>
            </thead>
            <tbody>
              {visibleRenewals.map((renewal) => {
                const isApproved = normalizeStatus(renewal.status) === 'approved'
                const isRejected = normalizeStatus(renewal.status) === 'rejected'
                return (
                  <tr className={activeRenewal?.id === renewal.id ? 'selected-row' : ''} key={renewal.id} onClick={() => setSelectedRenewal(renewal)}>
                    <td>{toText(renewal.renewalNumber ?? renewal.id)}</td>
                    <td><b>{toText(renewal.holder ?? renewal.name)}</b></td>
                    <td>{toText(renewal.designation)}</td>
                    <td>{toText(renewal.district)}</td>
                    <td>{formatDate(renewal.expiryDate)}</td>
                    <td><Status>{titleStatus(renewal.paymentStatus)}</Status></td>
                    <td><Status>{titleStatus(renewal.status)}</Status></td>
                    <td>
                      <div className="member-row-actions">
                        {!isApproved && <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); void handleRenewalAction(renewal, 'approved') }}>Approve</button>}
                        {!isRejected && <button className="reject-row" type="button" onClick={(event) => { event.stopPropagation(); void handleRenewalAction(renewal, 'rejected') }}>Reject</button>}
                        <button className="icon-table-btn view-btn" type="button" aria-label="View renewal" onClick={(event) => { event.stopPropagation(); setSelectedRenewal(renewal) }}><Eye size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="members-pagination">
          <span>Showing 1 to {visibleRenewals.length} of {renewals.length} designation renewals</span>
          <div>
            <button type="button">&lt;</button>
            <button className="active" type="button">1</button>
            <button type="button">&gt;</button>
          </div>
        </div>
      </section>

      {activeRenewal && (
        <section className="renewal-review-panel">
          <ReviewBlock title="Renewal Details" pairs={[
            ['Renewal No', toText(activeRenewal.renewalNumber ?? activeRenewal.id)],
            ['Holder', toText(activeRenewal.holder ?? activeRenewal.name)],
            ['Designation', toText(activeRenewal.designation)],
            ['District', toText(activeRenewal.district)],
            ['Expiry Date', formatDate(activeRenewal.expiryDate)],
            ['Payment', titleStatus(activeRenewal.paymentStatus)],
          ]} />
          <div className="renewal-decision-card">
            <h3>Admin Decision</h3>
            <span>Review the renewal request and take action.</span>
            <textarea placeholder="Add remarks here..." />
            <div>
              {normalizeStatus(activeRenewal.status) !== 'approved' && <button className="primary-action" type="button" onClick={() => void handleRenewalAction(activeRenewal, 'approved')}>Approve Renewal</button>}
              {normalizeStatus(activeRenewal.status) !== 'rejected' && <button className="reject-row" type="button" onClick={() => void handleRenewalAction(activeRenewal, 'rejected')}>Reject</button>}
            </div>
          </div>
        </section>
      )}

      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function GalleryManagementScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [tab, setTab] = useState('Albums')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All Categories')
  const [year, setYear] = useState('All Years')
  const [galleryDialog, setGalleryDialog] = useState<{ mode: 'edit' | 'view'; record: DpoRecord } | null>(null)
  const [creating, setCreating] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const albums = apiState.records['gallery-albums'] ?? []
  const visibleAlbums = albums.filter((album) => {
    const albumYear = toText(album.eventDate).slice(0, 4)
    const matchesSearch = searchQuery ? searchableText(album).includes(searchQuery.toLowerCase()) : true
    const matchesStatus = status === 'All' || galleryPublishStatus(album.status) === status
    const matchesCategory = category === 'All Categories' || toText(album.category) === category
    const matchesYear = year === 'All Years' || albumYear === year
    return matchesSearch && matchesStatus && matchesCategory && matchesYear
  })
  const mediaRows = getGalleryMediaRows(visibleAlbums)
  const published = albums.filter((album) => normalizeStatus(album.status) === 'published').length
  const drafts = albums.filter((album) => normalizeStatus(album.status) === 'draft').length
  const totalMedia = albums.reduce((sum, album) => sum + getAlbumImages(album).length, 0)
  const storageUsed = Math.max(totalMedia * 2, totalMedia)
  const statusOptions = ['All', 'Published', 'Unpublished']
  const categoryOptions = ['All Categories', ...Array.from(new Set(albums.map((album) => toText(album.category)).filter(Boolean)))]
  const yearOptions = ['All Years', ...Array.from(new Set(albums.map((album) => toText(album.eventDate).slice(0, 4)).filter(Boolean)))]
  const handleGalleryAction = async (album: DpoRecord, action: 'publish' | 'unpublish' | 'delete') => {
    setOpenMenuId(null)
    if (action === 'delete') {
      await apiState.deleteRecord('gallery-albums', album.id)
      setActionMessage(`${toText(album.titleEnglish) || 'Album'} deleted.`)
      return
    }
    await apiState.runAction('gallery-albums', album.id, action)
    setActionMessage(`${toText(album.titleEnglish) || 'Album'} ${action === 'publish' ? 'published' : 'unpublished'}.`)
  }

  return (
    <div className="dashboard-wrap members-page gallery-page">
      <section className="member-kpis">
        <MemberKpi icon={GalleryHorizontalEnd} label="Published Albums" value={published} note="Live on website" tone="success" />
        <MemberKpi icon={FileText} label="Unpublished Albums" value={drafts} note="Hidden from website" tone="warning" />
        <MemberKpi icon={GalleryHorizontalEnd} label="Total Media" value={totalMedia} note="Images from database" tone="success" />
        <MemberKpi icon={CreditCard} label="Storage Used" value={storageUsed} note="Estimated MB" tone="danger" />
      </section>

      <section className="members-table-panel gallery-workspace-panel">
        <div className="cms-tabs gallery-tabs">
          {['Albums', 'Media Library'].map((item) => (
            <button className={tab === item ? 'active' : ''} type="button" key={item} onClick={() => setTab(item)}>{item}</button>
          ))}
        </div>

        <div className="members-toolbar gallery-toolbar">
          <button className="primary-action" type="button" onClick={() => setCreating(true)}><Plus size={16} /> New Album</button>
          <label className="filter-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Year</span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              {yearOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {tab === 'Albums' ? (
          <div className="gallery-album-grid">
            {visibleAlbums.map((album) => {
              const cover = getAlbumCover(album)
              const images = getAlbumImages(album)
              return (
                <article className="gallery-album-card" key={album.id} onClick={() => setGalleryDialog({ mode: 'view', record: album })}>
                  <div className="gallery-cover">
                    <img src={cover} alt={toText(album.titleEnglish) || 'Gallery album'} />
                    <span><GalleryHorizontalEnd size={14} /> {formatNumber(toText(album.imageCount) || images.length)}</span>
                  </div>
                  <div className="gallery-card-body">
                    <div>
                      <h3>{toText(album.titleEnglish) || '-'}</h3>
                      <p>{toText(album.category) || 'Gallery'} · {images.length} media files</p>
                    </div>
                    <Status>{galleryPublishStatus(album.status)}</Status>
                  </div>
                  <div className="gallery-card-meta">
                    <span>{images.length} linked files</span>
                  </div>
                  <div className="gallery-card-actions">
                    <button type="button" onClick={(event) => { event.stopPropagation(); setGalleryDialog({ mode: 'edit', record: album }) }}>Edit</button>
                    <button className="icon-table-btn view-btn" type="button" aria-label="Preview album" onClick={(event) => { event.stopPropagation(); setGalleryDialog({ mode: 'view', record: album }) }}><Eye size={16} /></button>
                    <div className="row-menu-wrap">
                      <button className="icon-table-btn more-btn" type="button" aria-label="More gallery actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === album.id ? null : album.id) }}>
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === album.id && (
                        <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                          <button type="button" onClick={() => void handleGalleryAction(album, 'publish')}>Publish</button>
                          <button type="button" onClick={() => void handleGalleryAction(album, 'unpublish')}>Unpublish</button>
                          <button type="button" onClick={() => void handleGalleryAction(album, 'delete')}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="cms-tab-empty">
            <h2>{tab}</h2>
            <p>Gallery content is loaded from uploaded album records and media assets.</p>
          </div>
        )}
      </section>

      <section className="members-table-panel gallery-media-panel">
        <div className="table-title gallery-table-title">
          <h2>Recent Media</h2>
          <button type="button" onClick={() => setTab('Media Library')}>View All Media</button>
        </div>
        <div className="production-table-scroll">
          <table className="production-members-table gallery-media-table">
            <thead>
              <tr>{['Thumbnail', 'File Name', 'Type', 'Linked Album', 'Alt Text', 'Publish Status', 'Uploaded Date', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}</tr>
            </thead>
            <tbody>
              {mediaRows.map((media) => (
                <tr key={media.fileName}>
                  <td><img className="gallery-table-thumb" src={media.src} alt={media.altText} /></td>
                  <td><b>{media.fileName}</b><small>{media.size}</small></td>
                  <td>{media.type}</td>
                  <td>{media.albumTitle}</td>
                  <td>{media.altText ? <Tag tone="success">Added</Tag> : <Tag tone="danger">Missing</Tag>}</td>
                  <td><Status>{media.status}</Status></td>
                  <td>{media.uploadedDate}</td>
                  <td>
                    <div className="member-row-actions">
                      <button className="icon-table-btn view-btn" type="button" aria-label="Preview media" onClick={() => setGalleryDialog({ mode: 'view', record: media.album })}><Eye size={16} /></button>
                      <button className="icon-table-btn more-btn" type="button" aria-label="More media actions"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {galleryDialog && (
        <GalleryAlbumModal
          mode={galleryDialog.mode}
          record={galleryDialog.record}
          apiState={apiState}
          onClose={() => setGalleryDialog(null)}
          onSaved={(message) => setActionMessage(message)}
        />
      )}
      {creating && <NewGalleryAlbumModal apiState={apiState} onClose={() => setCreating(false)} onSaved={(message) => setActionMessage(message)} />}
      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function GalleryAlbumModal({
  mode,
  record,
  apiState,
  onClose,
  onSaved,
}: {
  mode: 'edit' | 'view'
  record: DpoRecord
  apiState: ApiState
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const images = getAlbumImages(record)
  const carouselImages = images.length ? images : [getAlbumCover(record)]
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [largeViewerOpen, setLargeViewerOpen] = useState(false)
  const [imageList, setImageList] = useState<string[]>(carouselImages)
  const [draft, setDraft] = useState({
    titleEnglish: toText(record.titleEnglish),
    titleUrdu: toText(record.titleUrdu),
    category: toText(record.category) || 'Gallery',
    eventDate: toText(record.eventDate),
    coverImage: getAlbumCover(record),
    status: normalizeStatus(record.status) || 'draft',
  })
  const [saving, setSaving] = useState(false)
  const updateDraft = (key: keyof typeof draft, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const goToImage = (direction: 'previous' | 'next', event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    setActiveImageIndex((current) => {
      const offset = direction === 'next' ? 1 : -1
      return (current + offset + carouselImages.length) % carouselImages.length
    })
  }
  const uploadAlbumImages = async (files: FileList | null) => {
    if (!files?.length) return
    const uploadedImages = await Promise.all(Array.from(files).map(readFileAsDataUrl))
    setImageList((current) => {
      const nextImages = [...current, ...uploadedImages]
      setDraft((currentDraft) => ({
        ...currentDraft,
        coverImage: currentDraft.coverImage || nextImages[0] || '',
      }))
      return nextImages
    })
  }
  const removeAlbumImage = (index: number) => {
    setImageList((current) => {
      const nextImages = current.filter((_, imageIndex) => imageIndex !== index)
      setActiveImageIndex((currentIndex) => Math.min(currentIndex, Math.max(nextImages.length - 1, 0)))
      setDraft((currentDraft) => ({
        ...currentDraft,
        coverImage: currentDraft.coverImage === current[index] ? nextImages[0] || '' : currentDraft.coverImage,
      }))
      return nextImages
    })
  }
  const moveAlbumImage = (index: number, direction: 'up' | 'down') => {
    setImageList((current) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const nextImages = [...current]
      const [image] = nextImages.splice(index, 1)
      nextImages.splice(nextIndex, 0, image)
      setActiveImageIndex(nextIndex)
      return nextImages
    })
  }
  const saveAlbum = async () => {
    setSaving(true)
    try {
      await apiState.updateRecord('gallery-albums', record.id, {
        titleEnglish: draft.titleEnglish.trim() || 'Untitled Album',
        titleUrdu: draft.titleUrdu.trim(),
        category: draft.category.trim() || 'Gallery',
        eventDate: draft.eventDate,
        coverImage: imageList[0] || '',
        imageCount: imageList.length,
        status: draft.status,
        images: imageList,
      })
      onSaved(`${draft.titleEnglish || 'Album'} updated.`)
      onClose()
    } catch (error) {
      onSaved(error instanceof Error ? error.message : 'Gallery album could not be saved.')
      setSaving(false)
    }
  }

  return (
    <div className="gallery-modal-backdrop" role="dialog" aria-modal="true">
      <section className="gallery-modal">
        <header className="gallery-modal-head">
          <div>
            <span>Gallery Management</span>
            <h2>{mode === 'edit' ? 'Edit Album' : 'Album Preview'}</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        <div className="gallery-modal-body">
          <div className="gallery-preview-panel">
            <div className="gallery-carousel-stage">
              <button className="gallery-large-trigger" type="button" onClick={() => mode === 'view' && setLargeViewerOpen(true)}>
                <img src={mode === 'view' ? carouselImages[activeImageIndex] : imageList[0] || getAlbumCover(record)} alt={draft.titleEnglish || 'Gallery album'} />
              </button>
              {mode === 'view' && carouselImages.length > 1 && (
                <div className="gallery-carousel-controls">
                  <button type="button" onClick={(event) => goToImage('previous', event)}>Previous</button>
                  <span>{activeImageIndex + 1} / {carouselImages.length}</span>
                  <button type="button" onClick={(event) => goToImage('next', event)}>Next</button>
                </div>
              )}
            </div>
            <div>
              <h3>{draft.titleEnglish || '-'}</h3>
              <p>Album · {formatDate(draft.eventDate)}</p>
              <Status>{galleryPublishStatus(draft.status)}</Status>
            </div>
          </div>

          {mode === 'edit' ? (
            <div className="gallery-edit-form">
              <label><span>English Title</span><input value={draft.titleEnglish} onChange={(event) => updateDraft('titleEnglish', event.target.value)} /></label>
              <label><span>Urdu Title</span><input dir="rtl" lang="ur" value={draft.titleUrdu} onChange={(event) => updateDraft('titleUrdu', event.target.value)} /></label>
              <label><span>Category</span><input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} placeholder="Events, Campaigns, Membership" /></label>
              <label><span>Publish Status</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}><option value="published">Published</option><option value="draft">Unpublished</option></select></label>
              <GalleryDropzone onUpload={(files) => void uploadAlbumImages(files)} />
              <div className="gallery-image-manager wide">
                {imageList.map((image, index) => (
                  <figure key={`${image}-${index}`}>
                    <img src={image} alt={`Album media ${index + 1}`} />
                    <figcaption>
                      <button type="button" disabled={index === 0} onClick={() => moveAlbumImage(index, 'up')}>Up</button>
                      <button type="button" disabled={index === imageList.length - 1} onClick={() => moveAlbumImage(index, 'down')}>Down</button>
                      <button type="button" onClick={() => removeAlbumImage(index)}>Delete</button>
                    </figcaption>
                  </figure>
                ))}
                {!imageList.length && <p>No images in this album.</p>}
              </div>
            </div>
          ) : (
            <div className="gallery-preview-grid">
              {carouselImages.map((image, index) => (
                <button className={activeImageIndex === index ? 'active' : ''} type="button" onClick={() => { setActiveImageIndex(index); setLargeViewerOpen(true) }} key={image}>
                  <img src={image} alt={toText(record.titleEnglish)} />
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="gallery-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          {mode === 'edit' && <button className="primary-action" type="button" disabled={saving} onClick={() => void saveAlbum()}>{saving ? 'Saving...' : 'Save Changes'}</button>}
        </footer>
      </section>
      {largeViewerOpen && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" onClick={() => setLargeViewerOpen(false)}>
          <div className="gallery-lightbox-shell" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-lightbox-top">
              <div>
                <b>{draft.titleEnglish || 'Gallery image'}</b>
                <span>{activeImageIndex + 1} of {carouselImages.length}</span>
              </div>
              <button className="gallery-lightbox-close" type="button" onClick={() => setLargeViewerOpen(false)}>Close</button>
            </div>
            <button className="gallery-lightbox-nav previous" type="button" onClick={(event) => goToImage('previous', event)}>Previous</button>
            <img className="gallery-lightbox-image" src={carouselImages[activeImageIndex]} alt={draft.titleEnglish || 'Gallery preview'} />
            <button className="gallery-lightbox-nav next" type="button" onClick={(event) => goToImage('next', event)}>Next</button>
            <div className="gallery-lightbox-thumbs">
              {carouselImages.map((image, index) => (
                <button className={activeImageIndex === index ? 'active' : ''} type="button" onClick={() => setActiveImageIndex(index)} key={`large-${image}`}>
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NewGalleryAlbumModal({ apiState, onClose, onSaved }: { apiState: ApiState; onClose: () => void; onSaved: (message: string) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('published')
  const [imageList, setImageList] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return
    const uploadedImages = await Promise.all(Array.from(files).map(readFileAsDataUrl))
    setImageList((current) => [...current, ...uploadedImages])
  }
  const removeImage = (index: number) => {
    setImageList((current) => current.filter((_, imageIndex) => imageIndex !== index))
  }
  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImageList((current) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const nextImages = [...current]
      const [image] = nextImages.splice(index, 1)
      nextImages.splice(nextIndex, 0, image)
      return nextImages
    })
  }
  const saveAlbum = async () => {
    if (!title.trim()) {
      onSaved('Album title is required.')
      return
    }
    setSaving(true)
    try {
      await apiState.createRecord('gallery-albums', {
        titleEnglish: title.trim(),
        titleUrdu: '',
        category: category.trim() || 'Gallery',
        eventDate: new Date().toISOString().slice(0, 10),
        coverImage: imageList[0] || '',
        imageCount: imageList.length,
        status,
        images: imageList,
      })
      onSaved(`${title.trim()} created.`)
      onClose()
    } catch (error) {
      onSaved(error instanceof Error ? error.message : 'Album could not be created.')
      setSaving(false)
    }
  }

  return (
    <div className="gallery-modal-backdrop" role="dialog" aria-modal="true">
      <section className="gallery-modal compact-gallery-modal">
        <header className="gallery-modal-head">
          <div>
            <span>Gallery Management</span>
            <h2>New Album</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>
        <div className="gallery-modal-body">
          <div className="gallery-edit-form">
            <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Album title" /></label>
            <label><span>Category</span><input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Events, Campaigns, Membership" /></label>
            <label><span>Publish Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="published">Published</option><option value="draft">Unpublished</option></select></label>
            <GalleryDropzone onUpload={(files) => void uploadImages(files)} />
            <div className="gallery-image-manager wide">
              {imageList.map((image, index) => (
                <figure key={`${image}-${index}`}>
                  <img src={image} alt={`Album upload ${index + 1}`} />
                  <figcaption>
                    <button type="button" disabled={index === 0} onClick={() => moveImage(index, 'up')}>Up</button>
                    <button type="button" disabled={index === imageList.length - 1} onClick={() => moveImage(index, 'down')}>Down</button>
                    <button type="button" onClick={() => removeImage(index)}>Delete</button>
                  </figcaption>
                </figure>
              ))}
              {!imageList.length && <p>No images selected.</p>}
            </div>
          </div>
        </div>
        <footer className="gallery-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary-action" type="button" disabled={saving} onClick={() => void saveAlbum()}>{saving ? 'Saving...' : 'Create Album'}</button>
        </footer>
      </section>
    </div>
  )
}

function GalleryDropzone({ onUpload }: { onUpload: (files: FileList | null) => void }) {
  const [dragging, setDragging] = useState(false)
  return (
    <label
      className={`gallery-dropzone wide ${dragging ? 'dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        onUpload(event.dataTransfer.files)
      }}
    >
      <span>Upload Images</span>
      <strong>Drag and drop images here</strong>
      <small>or click to choose multiple image files</small>
      <input type="file" accept="image/*" multiple onChange={(event) => onUpload(event.target.files)} />
    </label>
  )
}

const cmsPageGroups = [
  { label: 'Home', sections: ['home', 'home-pillars', 'home-portals', 'home-who-we-are', 'home-impact', 'home-values', 'home-membership-journey', 'home-cta'] },
  { label: 'About', sections: ['about'] },
  { label: 'Action Plan', sections: ['action-plan'] },
  { label: 'Membership', sections: ['membership'] },
  { label: 'Designations', sections: ['designations'] },
  { label: 'Cards', sections: ['card-design'] },
  { label: 'Gallery', sections: ['gallery'] },
  { label: 'Legal', sections: ['legal', 'privacy-policy', 'terms-and-conditions', 'refund-policy', 'donation-policy', 'data-cnic-privacy-policy'] },
  { label: 'Contact', sections: ['contact'] },
  { label: 'Member Services', sections: ['member-services'] },
  { label: 'Apply Pages', sections: ['membership-application', 'designation-application', 'application-status'] },
]

function WebsiteCmsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [selectedPage, setSelectedPage] = useState(cmsPageGroups[0].label)
  const [status, setStatus] = useState('All')
  const [editorState, setEditorState] = useState<{ mode: 'create' | 'edit'; record?: DpoRecord } | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const pages = apiState.records['cms-pages'] ?? []
  const cmsAssets = collectCmsAssets(pages)
  const selectedGroup = cmsPageGroups.find((group) => group.label === selectedPage) ?? cmsPageGroups[0]
  const visiblePages = pages.filter((page) => {
    const slug = toText(page.slug)
    const matchesPage = selectedGroup.sections.includes(slug)
    const matchesSearch = searchQuery ? searchableText(page).includes(searchQuery.toLowerCase()) : true
    const matchesStatus = status === 'All' || normalizeStatus(page.status) === normalizeStatus(status)
    return matchesPage && matchesSearch && matchesStatus
  }).sort((first, second) => selectedGroup.sections.indexOf(toText(first.slug)) - selectedGroup.sections.indexOf(toText(second.slug)))
  const statusOptions = ['All', 'Published', 'Draft']
  const drafts = pages.filter((page) => normalizeStatus(page.status) === 'draft').length
  const published = pages.filter((page) => normalizeStatus(page.status) === 'published').length
  const handleCmsAction = async (page: DpoRecord, action: 'publish' | 'draft') => {
    setOpenMenuId(null)
    if (action === 'publish') {
      await apiState.runAction('cms-pages', page.id, 'publish')
      invalidatePublicSiteCache()
      setActionMessage(`${toText(page.titleEnglish) || 'Page'} published.`)
      return
    }
    await apiState.updateRecord('cms-pages', page.id, { status: 'draft' })
    invalidatePublicSiteCache()
    setActionMessage(`${toText(page.titleEnglish) || 'Page'} saved as draft.`)
  }

  return (
    <div className="dashboard-wrap members-page cms-page">
      <section className="member-kpis">
        <MemberKpi icon={FileText} label="Published Pages" value={published} note="Live website content" tone="success" />
        <MemberKpi icon={FileText} label="Draft Updates" value={drafts} note="Waiting to publish" tone="warning" />
        <MemberKpi icon={GalleryHorizontalEnd} label="Media Files" value={cmsAssets.length} note="Used by pages" tone="success" />
      </section>

      <section className="members-table-panel cms-workspace-panel">
        <div className="cms-tabs">
          {cmsPageGroups.map((group) => (
            <button className={selectedPage === group.label ? 'active' : ''} type="button" key={group.label} onClick={() => setSelectedPage(group.label)}>
              {group.label}
            </button>
          ))}
        </div>

        <div className="members-toolbar cms-toolbar">
          <button className="primary-action" type="button" onClick={() => setEditorState({ mode: 'create', record: { id: '', slug: `${selectedGroup.sections[0]}-section`, type: 'page', status: 'draft' } })}><Plus size={16} /> New Section</button>
          <label className="filter-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="production-table-scroll">
          <table className="production-members-table cms-table">
            <thead>
              <tr>{['Section', 'Image', 'Last Updated', 'Status', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}</tr>
            </thead>
            <tbody>
              {visiblePages.map((page) => (
                <tr key={page.id} onClick={() => setEditorState({ mode: 'edit', record: page })}>
                  <td><b>{cmsSectionLabel(page)}</b><small>{toText(page.titleEnglish) || toText(asObject(page.content).bodyEnglish ?? page.excerpt)}</small></td>
                  <td>{toText(page.image ?? asObject(page.content).image) || '-'}</td>
                  <td>{formatDate(page.updatedAt)}</td>
                  <td><Status>{titleStatus(page.status)}</Status></td>
                  <td>
                    <div className="member-row-actions">
                      <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); setEditorState({ mode: 'edit', record: page }) }}>Edit</button>
                      <div className="row-menu-wrap">
                        <button className="icon-table-btn more-btn" type="button" aria-label="More CMS actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === page.id ? null : page.id) }}>
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === page.id && (
                          <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                            <button type="button" onClick={() => void handleCmsAction(page, 'publish')}>Publish</button>
                            <button type="button" onClick={() => void handleCmsAction(page, 'draft')}>Draft</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {!visiblePages.length && (
                <tr>
                  <td colSpan={5}>
                    <div className="cms-tab-empty">
                      <h2>No sections found</h2>
                      <p>Create a section for {selectedPage} or change the status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="cms-media-strip">
          <div>
            <h3>Media Assets</h3>
            <p>{cmsAssets.length} files connected from CMS database content</p>
          </div>
          <div className="cms-assets-row">
            {cmsAssets.slice(0, 8).map((asset) => (
              <span className="cms-asset-chip" key={asset}>
                {isImageAsset(asset) ? <img src={asset} alt="CMS media asset" /> : <FileText size={20} />}
                <small>{asset.split('/').pop()}</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      {editorState && (
        <CmsContentEditor
          mode={editorState.mode}
          record={editorState.record}
          apiState={apiState}
          onClose={() => setEditorState(null)}
          onSaved={(message) => setActionMessage(message)}
        />
      )}
      {actionMessage && (
        <div className="action-toast" role="status">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

function cmsEditorConfig(slug: string) {
  const defaults = {
    title: 'Section Title',
    eyebrow: '',
    heroTitle: '',
    text: 'Section Text',
    image: 'Upload Image',
    items: '',
    mission: '',
    vision: '',
    buttons: false,
    secondaryImage: '',
    portalCards: false,
    customFields: [] as { key: string; label: string; multiline?: boolean }[],
  }
  const configs: Record<string, typeof defaults> = {
    home: {
      ...defaults,
      title: '',
      heroTitle: 'Hero Title Lines',
      text: 'Hero Text',
      image: 'Hero Image',
      items: 'Hero Value Boxes (Title | Text)',
      buttons: true,
      customFields: [{ key: 'emblemText', label: 'Emblem Text' }],
    },
    'home-pillars': {
      ...defaults,
      title: '',
      text: '',
      image: '',
      items: 'Pillar Cards (Title | Text)',
    },
    'home-portals': {
      ...defaults,
      title: '',
      eyebrow: 'First Card Small Heading',
      text: '',
      image: 'Join Mission Image',
      secondaryImage: 'Merchandise Image',
      portalCards: true,
      items: '',
      buttons: true,
      customFields: [
        { key: 'missionFeatures', label: 'First Card Features (one per line)', multiline: true },
        { key: 'merchandiseFeatures', label: 'Second Card Features (one per line)', multiline: true },
        { key: 'quickEyebrow', label: 'Third Card Small Heading' },
        { key: 'quickLinks', label: 'Quick Links (Label | Link)', multiline: true },
      ],
    },
    'home-who-we-are': {
      ...defaults,
      eyebrow: 'Small Heading',
      title: 'Who We Are Title',
      text: 'Who We Are Text',
      image: 'Who We Are Image',
      mission: 'Mission Text',
      vision: 'Vision Text',
      customFields: [
        { key: 'sealTitle', label: 'Image Badge Title' },
        { key: 'sealText', label: 'Image Badge Text' },
        { key: 'mediaCaption', label: 'Image Caption' },
        { key: 'missionTitle', label: 'Mission Heading' },
        { key: 'visionTitle', label: 'Vision Heading' },
        { key: 'linkLabel', label: 'Link Text' },
        { key: 'linkHref', label: 'Link URL' },
      ],
    },
    'home-impact': {
      ...defaults,
      title: 'Impact Title',
      eyebrow: 'Impact Small Heading',
      text: 'Impact Text',
      image: 'Background Image',
      items: 'Impact Stats (Label | Value)',
    },
    'home-values': {
      ...defaults,
      title: 'Values Title',
      eyebrow: 'Small Heading',
      text: 'Values Text',
      image: 'Background Image',
      items: 'Value Rows (Title | Text)',
    },
    'home-membership-journey': {
      ...defaults,
      title: 'Membership Journey Title',
      eyebrow: 'Small Heading',
      text: 'Membership Journey Text',
      image: 'Background Image',
      items: 'Journey Steps (Title | Text)',
      buttons: true,
    },
    'home-cta': {
      ...defaults,
      title: 'CTA Title',
      eyebrow: 'Small Heading',
      text: 'CTA Text',
      image: 'Background Image',
      buttons: true,
    },
    'card-design': {
      ...defaults,
      title: 'Card Page Title',
      text: 'Card Page Text',
      image: 'Card Page Image',
      items: '',
    },
  }
  return configs[slug] ?? defaults
}

function CmsContentEditor({
  mode,
  record,
  apiState,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  record?: DpoRecord
  apiState: ApiState
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const recordContent = asObject(record?.content)
  const slug = toText(record?.slug)
  const fieldConfig = cmsEditorConfig(slug)
  const existingImage = toText(record?.image ?? recordContent.image) || valueList(recordContent.heroSlides)[0] || ''
  const [draft, setDraft] = useState<Record<string, string>>({
    titleEnglish: toText(record?.titleEnglish),
    titleUrdu: toText(record?.titleUrdu),
    eyebrow: toText(recordContent.eyebrow),
    heroTitle: toText(recordContent.heroTitle),
    mission: toText(recordContent.mission),
    vision: toText(recordContent.vision),
    primaryCta: toText(recordContent.primaryCta),
    primaryHref: toText(recordContent.primaryHref),
    secondaryCta: toText(recordContent.secondaryCta),
    secondaryHref: toText(recordContent.secondaryHref),
    secondaryImage: toText(recordContent.secondaryImage),
    slug: toText(record?.slug),
    type: toText(record?.type) || 'page',
    status: normalizeStatus(record?.status) || 'draft',
    image: existingImage,
    language: toText(record?.language ?? record?.lang) || 'EN',
    seoTitle: toText(record?.seoTitle),
    metaDescription: toText(recordContent.metaDescription ?? recordContent.description ?? record?.metaDescription),
    contentEnglish: cmsEditorText(record, 'en'),
    contentUrdu: cmsEditorText(record, 'ur'),
    items: valueList(recordContent.items).join('\n'),
    portalCard1Title: cmsItemParts(recordContent.items, 0).title,
    portalCard1Text: cmsItemParts(recordContent.items, 0).text,
    portalCard2Title: cmsItemParts(recordContent.items, 1).title,
    portalCard2Text: cmsItemParts(recordContent.items, 1).text,
    portalCard3Title: cmsItemParts(recordContent.items, 2).title,
    portalCard3Text: cmsItemParts(recordContent.items, 2).text,
    ...Object.fromEntries(fieldConfig.customFields.map((field) => {
      const value = recordContent[field.key]
      return [field.key, Array.isArray(value) ? value.map(toText).join('\n') : toText(value)]
    })),
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const updateDraft = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const uploadImage = async (file: File | null, target: 'image' | 'secondaryImage' = 'image') => {
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const uploaded = await apiSend<{ url: string }>('/admin/cms/upload', 'POST', { name: file.name, dataUrl }, getStoredSession()?.token)
      updateDraft(target, uploaded.url)
      onSaved('Image uploaded.')
    } catch (error) {
      onSaved(error instanceof Error ? error.message : 'Image could not be uploaded.')
    } finally {
      setUploading(false)
    }
  }
  const saveCmsPage = async (nextStatus = draft.status) => {
    setSaving(true)
    try {
      const cleanSlug = (draft.slug || slugify(draft.titleEnglish || 'cms-page')).replace(/^\/+/, '')
      const sectionItems = fieldConfig.portalCards
        ? [
          `${draft.portalCard1Title} | ${draft.portalCard1Text}`,
          `${draft.portalCard2Title} | ${draft.portalCard2Text}`,
          `${draft.portalCard3Title} | ${draft.portalCard3Text}`,
        ].filter((item) => item.replace('|', '').trim())
        : draft.items.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
      const payload = {
        titleEnglish: draft.titleEnglish.trim() || 'Untitled Page',
        slug: cleanSlug,
        type: draft.type,
        language: draft.language,
        status: nextStatus,
        image: draft.image.trim(),
        excerpt: draft.contentEnglish.trim(),
        seoTitle: draft.seoTitle.trim(),
        content: {
          ...recordContent,
          bodyEnglish: draft.contentEnglish,
          bodyUrdu: draft.contentUrdu,
          eyebrow: draft.eyebrow,
          heroTitle: draft.heroTitle,
          mission: draft.mission,
          vision: draft.vision,
          primaryCta: draft.primaryCta,
          primaryHref: draft.primaryHref,
          secondaryCta: draft.secondaryCta,
          secondaryHref: draft.secondaryHref,
          secondaryImage: draft.secondaryImage,
          image: draft.image.trim(),
          items: sectionItems,
          metaDescription: draft.metaDescription,
          ...Object.fromEntries(fieldConfig.customFields.map((field) => [
            field.key,
            field.multiline ? (draft[field.key] ?? '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : (draft[field.key] ?? ''),
          ])),
          updatedFromCmsEditor: true,
        },
      }
      if (mode === 'create') {
        await apiState.createRecord('cms-pages', payload)
      } else if (record) {
        await apiState.updateRecord('cms-pages', record.id, payload)
      }
      invalidatePublicSiteCache()
      onSaved(`${payload.titleEnglish} ${nextStatus === 'published' ? 'published' : 'saved'} in CMS.`)
      setSaving(false)
      onClose()
    } catch (error) {
      onSaved(error instanceof Error ? error.message : 'CMS content could not be saved.')
      setSaving(false)
    }
  }

  return (
    <div className="cms-editor-backdrop" role="dialog" aria-modal="true">
      <section className="cms-editor-modal">
        <header className="cms-editor-head">
          <div>
            <span>Website CMS</span>
            <h2>{mode === 'create' ? 'Create Dynamic Content' : 'Edit Dynamic Content'}</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        <div className="cms-editor-grid">
          {fieldConfig.title && <label className="cms-editor-field">
            <span>{fieldConfig.title}</span>
            <input value={draft.titleEnglish} onChange={(event) => updateDraft('titleEnglish', event.target.value)} placeholder="Section title" />
          </label>}
          {fieldConfig.heroTitle && <label className="cms-editor-field wide">
            <span>{fieldConfig.heroTitle}</span>
            <textarea value={draft.heroTitle} onChange={(event) => updateDraft('heroTitle', event.target.value)} placeholder="One Flag&#10;One Nation&#10;One Pakistan" />
          </label>}
          {fieldConfig.eyebrow && <label className="cms-editor-field">
            <span>{fieldConfig.eyebrow}</span>
            <input value={draft.eyebrow} onChange={(event) => updateDraft('eyebrow', event.target.value)} placeholder="Small heading" />
          </label>}
          <label className="cms-editor-field urdu-field">
            <span>Urdu Title</span>
            <input dir="rtl" lang="ur" value={draft.titleUrdu} onChange={(event) => updateDraft('titleUrdu', event.target.value)} placeholder="پاکستان کے محافظ" />
          </label>
          <label className="cms-editor-field cms-system-field">
            <span>Page Slug</span>
            <input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} placeholder="about" />
          </label>
          <label className="cms-editor-field cms-system-field">
            <span>Page Type</span>
            <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value)}>
              {['page', 'legal', 'news'].map((item) => <option key={item} value={item}>{titleStatus(item)}</option>)}
            </select>
          </label>
          <label className="cms-editor-field cms-system-field">
            <span>Language</span>
            <select value={draft.language} onChange={(event) => updateDraft('language', event.target.value)}>
              <option value="EN">English</option>
              <option value="UR">Urdu</option>
              <option value="EN_UR">English + Urdu</option>
            </select>
          </label>
          <label className="cms-editor-field">
            <span>Status</span>
            <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          {fieldConfig.image && <label className="cms-editor-field wide cms-upload-field">
            <span>{fieldConfig.image}</span>
            <input type="file" accept="image/*" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0] ?? null)} />
            {draft.image ? <div className="cms-upload-preview"><img src={assetPath(draft.image)} alt="" /><small>{draft.image.split('/').pop()}</small></div> : <small>No image selected</small>}
          </label>}
          {fieldConfig.secondaryImage && <label className="cms-editor-field wide cms-upload-field">
            <span>{fieldConfig.secondaryImage}</span>
            <input type="file" accept="image/*" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0] ?? null, 'secondaryImage')} />
            {draft.secondaryImage ? <div className="cms-upload-preview"><img src={assetPath(draft.secondaryImage)} alt="" /><small>{draft.secondaryImage.split('/').pop()}</small></div> : <small>No image selected</small>}
          </label>}
          {fieldConfig.portalCards && <>
            <label className="cms-editor-field"><span>Card 1 Title</span><input value={draft.portalCard1Title} onChange={(event) => updateDraft('portalCard1Title', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Card 1 Text</span><input value={draft.portalCard1Text} onChange={(event) => updateDraft('portalCard1Text', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Card 2 Title</span><input value={draft.portalCard2Title} onChange={(event) => updateDraft('portalCard2Title', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Card 2 Text</span><input value={draft.portalCard2Text} onChange={(event) => updateDraft('portalCard2Text', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Card 3 Title</span><input value={draft.portalCard3Title} onChange={(event) => updateDraft('portalCard3Title', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Card 3 Text</span><input value={draft.portalCard3Text} onChange={(event) => updateDraft('portalCard3Text', event.target.value)} /></label>
          </>}
          {fieldConfig.items && <label className="cms-editor-field wide">
            <span>{fieldConfig.items}</span>
            <textarea value={draft.items} onChange={(event) => updateDraft('items', event.target.value)} placeholder="One item per line" />
          </label>}
          {fieldConfig.customFields.map((field) => (
            <label className="cms-editor-field wide" key={field.key}>
              <span>{field.label}</span>
              {field.multiline
                ? <textarea value={draft[field.key] ?? ''} onChange={(event) => updateDraft(field.key, event.target.value)} placeholder="One item per line" />
                : <input value={draft[field.key] ?? ''} onChange={(event) => updateDraft(field.key, event.target.value)} />}
            </label>
          ))}
          {fieldConfig.text && <label className="cms-editor-field wide">
            <span>{fieldConfig.text}</span>
            <textarea className="cms-text-editor" value={draft.contentEnglish} onChange={(event) => updateDraft('contentEnglish', event.target.value)} placeholder="Write page text here..." />
          </label>}
          {fieldConfig.mission && <label className="cms-editor-field wide">
            <span>{fieldConfig.mission}</span>
            <textarea value={draft.mission} onChange={(event) => updateDraft('mission', event.target.value)} placeholder="Mission text" />
          </label>}
          {fieldConfig.vision && <label className="cms-editor-field wide">
            <span>{fieldConfig.vision}</span>
            <textarea value={draft.vision} onChange={(event) => updateDraft('vision', event.target.value)} placeholder="Vision text" />
          </label>}
          {fieldConfig.buttons && <>
            <label className="cms-editor-field"><span>Primary Button Text</span><input value={draft.primaryCta} onChange={(event) => updateDraft('primaryCta', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Primary Button Link</span><input value={draft.primaryHref} onChange={(event) => updateDraft('primaryHref', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Secondary Button Text</span><input value={draft.secondaryCta} onChange={(event) => updateDraft('secondaryCta', event.target.value)} /></label>
            <label className="cms-editor-field"><span>Secondary Button Link</span><input value={draft.secondaryHref} onChange={(event) => updateDraft('secondaryHref', event.target.value)} /></label>
          </>}
          <label className="cms-editor-field wide">
            <span>Urdu Content Editor</span>
            <textarea className="cms-text-editor urdu-editor" dir="rtl" lang="ur" value={draft.contentUrdu} onChange={(event) => updateDraft('contentUrdu', event.target.value)} placeholder="یہاں مکمل اردو مواد لکھیں..." />
          </label>
        </div>

        <footer className="cms-editor-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" disabled={saving} onClick={() => void saveCmsPage()}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button className="primary-action" type="button" disabled={saving} onClick={() => void saveCmsPage('published')}>Publish</button>
        </footer>
      </section>
    </div>
  )
}

function getModuleTools(moduleName: string) {
  const tools: Record<string, string[]> = {
    'Members Management': ['Approve Member', 'Reject', 'Request Info', 'Suspend', 'Reactivate', 'Renew Membership', 'Regenerate Card', 'Download Card', 'Send SMS / Email', 'View Payment', 'View History', 'Archive'],
    'Membership Applications': ['Approve', 'Reject', 'Request Information', 'View Documents', 'Generate Card'],
    'Designation Applications': ['Approve', 'Reject', 'Request Changes', 'Change Area', 'Change Designation', 'Generate Card', 'Generate Appointment Letter'],
    'Active Designations': ['Change Area', 'Change Designation', 'Generate Appointment Letter', 'Suspend', 'Revoke', 'Renew'],
    'Designation Renewals': ['Approve Renewal', 'Reject', 'Mark Paid', 'Export CSV'],
    'Geographic Areas': ['Add Area', 'Edit Hierarchy', 'Deactivate Area', 'Office Bearers', 'International Region'],
    'Gallery Management': ['Upload Images', 'Set Cover', 'Reorder Images', 'Publish Album', 'Archive'],
    'Website CMS': ['Edit Hero Slides', 'Edit Mission', 'SEO Settings', 'Legal Pages', 'Social Links', 'Publish'],
    'Card Templates': ['Preview', 'Edit Front Layout', 'Edit Back Layout', 'Version History', 'Activate Template'],
    Notifications: ['Template Editor', 'Manual Send', 'Bulk Send', 'Retry Failed', 'Delivery Logs'],
    'Admin Users': ['Add Admin', 'Assign Role', 'Deactivate', 'Reset Password', 'View Login History'],
    'Roles & Permissions': ['Add Role', 'Edit Permissions', 'Duplicate Role', 'Deactivate', 'Audit Access'],
    Reports: ['Export CSV', 'Export Excel', 'Export PDF', 'Print', 'Schedule Report'],
    Settings: ['Fees', 'Payment Gateway', 'SMS SMTP', 'Formats', 'Maintenance Mode'],
    'Audit Logs': ['Filter Activity', 'Export CSV', 'Print', 'View Resource'],
  }

  return tools[moduleName] ?? ['View', 'Create', 'Edit', 'Export', 'Audit History']
}

function isStatusCell(column: string) {
  return ['Status', 'Payment Status', 'Application Status', 'Publish Status', 'Refund Status', 'Priority'].includes(column)
}

function isStatusField(field: string) {
  return ['status', 'paymentStatus', 'applicationStatus', 'priority', 'refundStatus'].includes(field)
}

function formatCompactValue(value: unknown) {
  if (typeof value === 'number') return formatNumber(value)
  const text = toText(value)
  return text.length > 34 ? `${text.slice(0, 31)}...` : text || '-'
}

function formatDate(value: unknown) {
  const date = new Date(toText(value))
  if (!Number.isFinite(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function documentSummary(record: DpoRecord): { label: string; tone: 'success' | 'warning' | 'danger' | 'info' } {
  const documents = Array.isArray(record.documents) ? record.documents : []
  const reviewStatuses = documents
    .filter((document) => document && typeof document === 'object' && !Array.isArray(document))
    .map((document) => normalizeStatus((document as Record<string, unknown>).status))
  if (reviewStatuses.length && reviewStatuses.every((status) => status === 'verified')) return { label: 'Verified', tone: 'success' }
  if (reviewStatuses.includes('rejected')) return { label: 'Rejected file', tone: 'danger' }
  if (documents.length >= 3) return { label: `${documents.length} Files`, tone: 'success' }
  if (documents.length > 0) return { label: `Missing ${3 - documents.length}`, tone: 'warning' }
  return { label: 'No Files', tone: 'danger' }
}

function getLiveModuleTable(moduleName: string, status: string, apiState: ApiState, searchQuery = '') {
  const resources = moduleResources[moduleName] ?? ['members']
  const schemaMap = new Map(apiState.schemas.map((schema) => [schema.resource, schema]))
  const records = resources.flatMap((resource) =>
    (apiState.records[resource] ?? []).map((record) => ({ resource, record })),
  )
  const searched = searchQuery
    ? records.filter(({ record }) => searchableText(record).includes(searchQuery.toLowerCase()))
    : records
  const filtered = status === 'All'
    ? searched
    : searched.filter(({ record }) =>
      normalizeStatus(record.status) === normalizeStatus(status) ||
      normalizeStatus(record.paymentStatus) === normalizeStatus(status) ||
      normalizeStatus(record.applicationStatus) === normalizeStatus(status),
    )

  const dataColumns = getLiveColumns(moduleName)
  const rows = filtered.map(({ resource, record }) => ({
    id: `${resource}-${record.id}`,
    resource,
    record,
    cells: dataColumns.map((column) => formatCell(column, record, resource)),
  }))

  return {
    columns: [...dataColumns, 'Actions'],
    rows,
    resourceTitle: resources.map((resource) => schemaMap.get(resource)?.title ?? resource).join(' / '),
  }
}

function getLiveColumns(moduleName: string) {
  const columns: Record<string, string[]> = {
    'Members Management': ['Membership No', 'Name', 'Phone', 'District', 'Status'],
    'Membership Applications': ['Record No', 'Name', 'CNIC', 'Country', 'District', 'Payment Status', 'Status', 'Updated'],
    'Designation Applications': ['Record No', 'Name', 'CNIC', 'Designation', 'Wing', 'Province', 'District', 'Area', 'Payment Status', 'Status', 'Validity'],
    'Active Designations': ['Name', 'Membership No', 'Designation', 'Wing', 'Province', 'District', 'Area', 'Issue Date', 'Expiry Date', 'Status'],
    'Designation Renewals': ['Record No', 'Name', 'Designation', 'District', 'Payment Status', 'Status', 'Updated'],
    'Designation Master List': ['Designation', 'Amount', 'Validity', 'Status'],
    'Geographic Areas': ['Area ID', 'Country', 'Province', 'Division', 'District', 'Tehsil', 'Union Council', 'Status'],
    'Complaint Management': ['Complaint No', 'Name', 'Phone', 'Category', 'Subject', 'Description', 'Status'],
    'Payments & Finance': ['Payment No', 'User', 'Payment Type', 'Amount', 'Method', 'Reference No', 'Status'],
    'Gallery Management': ['Album ID', 'Title English', 'Title Urdu', 'Images', 'Cover', 'Event Date', 'Publish Status', 'Status'],
    'Website CMS': ['Setting Key', 'Description', 'Current Value', 'Scope', 'Last Updated', 'Updated By', 'Status'],
    'Card Templates': ['Record No', 'Type', 'Template Version', 'QR Code', 'Status', 'Updated'],
    Notifications: ['Setting Key', 'Description', 'Current Value', 'Scope', 'Status'],
    'Admin Users': ['Name', 'Email', 'Role', 'Status', 'Last Run'],
    'Roles & Permissions': ['Name', 'Description', 'Current Value', 'Status'],
    Reports: ['Report ID', 'Report Name', 'Module', 'Period', 'Format', 'Generated By', 'Status', 'Last Run'],
    Settings: ['Setting Key', 'Description', 'Current Value', 'Scope', 'Last Updated', 'Updated By', 'Status'],
    'Audit Logs': ['Report ID', 'Generated By', 'Module', 'Description', 'Last Run'],
  }

  return columns[moduleName] ?? columns['Members Management']
}

function formatCell(column: string, record: DpoRecord, resource: string) {
  const valueMap: Record<string, unknown> = {
    Photo: initialsFrom(toText(record.name ?? record.applicant ?? record.holder ?? record.donorName ?? 'DPO')),
    'Membership No': record.membershipNumber,
    Email: record.email,
    Role: record.role,
    Name: record.name ?? record.applicant ?? record.holder ?? record.donorName ?? record.title ?? record.titleEnglish,
    CNIC: record.cnicMasked,
    Phone: record.phone,
    Type: record.templateType ?? record.type ?? resource,
    Country: record.country,
    District: record.district,
    'Payment Status': record.paymentStatus,
    'Application Status': record.applicationStatus ?? record.status,
    Status: record.status,
    'Expiry Date': record.expiryDate,
    'Record No': record.applicationNumber ?? record.renewalNumber ?? record.cardNumber ?? record.id,
    'Issue Date': record.issueDate,
    Updated: record.updatedAt,
    Designation: record.designation,
    Wing: record.wing,
    Province: record.province,
    Area: record.area,
    Validity: record.validityMonths ? `${toText(record.validityMonths)} Months` : record.expiryDate,
    'Complaint No': record.complaintNumber,
    Category: record.category,
    Subject: record.subject,
    'Submitted Date': record.submittedDate,
    'Last Update': record.updatedAt,
    'Order ID': record.orderId,
    'Payment No': record.orderId,
    'Transaction ID': record.gatewayTransactionId,
    'Reference No': record.gatewayTransactionId,
    User: record.user,
    'Payment Type': record.paymentType,
    'Base Amount': formatCurrency(record.baseAmount),
    'Service Fee': formatCurrency(record.serviceFee),
    'Total Amount': formatCurrency(record.totalAmount),
    Amount: formatCurrency(record.amount),
    Method: record.gateway,
    Gateway: record.gateway,
    'Paid Date': record.paidDate,
    'Refund Status': record.refundStatus,
    IMEI: record.imei,
    Brand: record.brand,
    Model: record.model,
    'Serial No': record.serialNumber,
    'Assigned Person': record.assignedPerson,
    Department: record.department,
    'Registration No': record.registrationNumber,
    Cause: record.cause,
    'Target Amount': formatCurrency(record.targetAmount),
    'Raised Amount': formatCurrency(record.raisedAmount),
    'Start Date': record.startDate,
    'End Date': record.endDate,
    'Publish Status': record.status,
    'Album ID': record.id,
    'Title English': record.titleEnglish,
    'Title Urdu': record.titleUrdu,
    Images: record.imageCount,
    Cover: record.coverImage,
    'Event Date': record.eventDate,
    'Area ID': record.id,
    Division: record.division ?? record.parentName,
    Tehsil: record.tehsil,
    'Union Council': record.unionCouncil,
    'Report ID': record.id,
    'Report Name': record.name,
    Module: record.module,
    'Template Version': record.templateVersion ?? record.version,
    'QR Code': record.qrValue ?? record.qrPosition,
    Period: record.period ?? '-',
    Format: record.format,
    'Generated By': record.generatedBy ?? record.actor ?? '-',
    'Last Run': record.lastRunAt ?? record.createdAt,
    'Setting Key': record.key ?? record.name,
    Description: record.description ?? record.message ?? record.label,
    'Current Value': formatSettingValue(record.value ?? record.permissions),
    Scope: record.group ?? record.role ?? resource,
    'Last Updated': record.updatedAt,
    'Updated By': record.updatedBy ?? 'System',
    Actions: '',
  }

  return titleStatus(valueMap[column])
}

function RecordDrawer({ title, resource, record, apiState, startEditing = false, onClose }: { title: string; resource: string; record: DpoRecord; apiState: ApiState; startEditing?: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => editableDraft(record, resource))
  const [editing, setEditing] = useState(startEditing)
  const actionButtons = getRecordActions(resource)
  const save = async () => {
    await apiState.updateRecord(resource, record.id, normalizeDraft(draft))
    onClose()
  }
  const details = detailPairs(record, resource)

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <aside className="record-drawer">
        <div className="drawer-head">
          <div>
            <span>{resource}</span>
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        {actionButtons.length > 0 && (
          <div className="drawer-actions">
            {actionButtons.map((action) => (
              <button type="button" key={action.label} onClick={() => void apiState.runAction(resource, record.id, action.action)}>
                {action.label}
              </button>
            ))}
          </div>
        )}
        {resource.includes('applications') && <ApplicationDocumentReview key={record.id} resource={resource} record={record} apiState={apiState} />}
        {editing ? (
          <div className="drawer-form">
            {Object.entries(draft).map(([key, value]) => (
              <label key={key}>
                <span>{titleStatus(key)}</span>
                <DraftField resource={resource} fieldKey={key} value={value} apiState={apiState} onChange={(nextValue) => setDraft((current) => ({ ...current, [key]: nextValue }))} />
              </label>
            ))}
          </div>
        ) : (
          <div className="drawer-details">
            {details.map(([key, value]) => (
              <div className="drawer-detail-row" key={key}>
                <span>{key}</span>
                <b>{value || '-'}</b>
              </div>
            ))}
          </div>
        )}
        <div className="drawer-footer">
          <button type="button" onClick={onClose}>{editing ? 'Cancel' : 'Close'}</button>
          {editing ? (
            <button type="button" onClick={() => void save()}>Save Changes</button>
          ) : (
            <button type="button" onClick={() => setEditing(true)}>Edit Record</button>
          )}
        </div>
      </aside>
    </div>
  )
}

type ApplicationDocument = {
  kind: string
  label: string
  name: string
  url: string
  mimeType: string
  size: number
  status: string
}

function ApplicationDocumentReview({ resource, record, apiState, compact = false, onUpdated }: { resource: string; record: DpoRecord; apiState: ApiState; compact?: boolean; onUpdated?: (patch: Record<string, unknown>) => void }) {
  const [documents, setDocuments] = useState<ApplicationDocument[]>(() => applicationDocuments(record))
  const [savingKind, setSavingKind] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  if (!documents.length) {
    return <div className={`application-document-review empty ${compact ? 'compact' : ''}`}><FileText size={18} /><span>No uploaded documents are attached to this application.</span></div>
  }

  const updateDocument = async (kind: string, status: 'verified' | 'rejected') => {
    setSavingKind(kind)
    setMessage('')
    const nextDocuments = documents.map((document) => document.kind === kind ? { ...document, status } : document)
    const documentStatus = nextDocuments.some((document) => document.status === 'rejected')
      ? 'rejected'
      : nextDocuments.every((document) => document.status === 'verified')
        ? 'verified'
        : 'pending'
    try {
      const patch = {
        documents: nextDocuments,
        documentStatus,
        documentsVerified: documentStatus === 'verified',
      }
      await apiState.updateRecord(resource, record.id, patch)
      setDocuments(nextDocuments)
      onUpdated?.(patch)
      setMessage(`${nextDocuments.find((document) => document.kind === kind)?.label || 'Document'} marked ${status}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Document status could not be updated.')
    } finally {
      setSavingKind(null)
    }
  }

  return (
    <section className={`application-document-review ${compact ? 'compact' : ''}`}>
      {!compact && <div className="application-document-review-head"><div><span>Identity review</span><h3>Uploaded documents</h3></div><Tag tone={documentSummary({ ...record, documents }).tone}>{documentSummary({ ...record, documents }).label}</Tag></div>}
      <div className="application-document-grid">
        {documents.map((document) => (
          <article key={document.kind}>
            <a href={document.url} target="_blank" rel="noreferrer" aria-label={`Open ${document.label}`}>
              {document.mimeType.startsWith('image/')
                ? <img src={document.url} alt={document.label} />
                : <span className="application-pdf-preview"><FileText size={28} /> PDF document</span>}
            </a>
            <div className="application-document-meta">
              <div><b>{document.label}</b><small>{document.name} | {formatFileSize(document.size)}</small></div>
              <Status>{titleStatus(document.status || 'pending')}</Status>
            </div>
            <div className="application-document-actions">
              <button type="button" disabled={savingKind === document.kind || document.status === 'verified'} onClick={() => void updateDocument(document.kind, 'verified')}><CircleCheck size={14} /> Verify</button>
              <button type="button" disabled={savingKind === document.kind || document.status === 'rejected'} onClick={() => void updateDocument(document.kind, 'rejected')}><CircleX size={14} /> Reject</button>
            </div>
          </article>
        ))}
      </div>
      {message && <p className="application-document-message" role="status">{message}</p>}
    </section>
  )
}

function applicationDocuments(record: DpoRecord): ApplicationDocument[] {
  if (!Array.isArray(record.documents)) return []
  return record.documents.flatMap((document, index) => {
    if (!document || typeof document !== 'object' || Array.isArray(document)) return []
    const item = document as Record<string, unknown>
    const url = toText(item.url)
    if (!url) return []
    return [{
      kind: toText(item.kind) || `document-${index + 1}`,
      label: toText(item.label) || `Document ${index + 1}`,
      name: toText(item.name) || 'Uploaded file',
      url,
      mimeType: toText(item.mimeType) || 'application/octet-stream',
      size: Number(item.size) || 0,
      status: toText(item.status) || 'pending',
    }]
  })
}

function canApproveDesignationApplication(record: DpoRecord) {
  const paymentReady = ['paid', 'verified', 'approved'].includes(normalizeStatus(record.paymentStatus))
  const documents = applicationDocuments(record)
  const documentsReady = !documents.length || documents.every((document) => normalizeStatus(document.status) === 'verified')
  return paymentReady && documentsReady
}

function formatFileSize(size: number) {
  if (!size) return 'Unknown size'
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(size / 1024)} KB`
}

function CreateRecordModal({ resource, apiState, onClose }: { resource: string; apiState: ApiState; onClose: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => defaultDraft(resource))
  const create = async () => {
    await apiState.createRecord(resource, normalizeDraft(draft))
    onClose()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <aside className="record-drawer compact-drawer">
        <div className="drawer-head">
          <div>
            <span>{resource}</span>
            <h2>Add New Record</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        <div className="drawer-form">
          {Object.entries(draft).map(([key, value]) => (
            <label key={key}>
              <span>{titleStatus(key)}</span>
              <DraftField resource={resource} fieldKey={key} value={value} apiState={apiState} onChange={(nextValue) => setDraft((current) => ({ ...current, [key]: nextValue }))} />
            </label>
          ))}
        </div>
        <div className="drawer-footer">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" onClick={() => void create()}>Create</button>
        </div>
      </aside>
    </div>
  )
}

function DraftField({ resource, fieldKey, value, apiState, onChange }: { resource: string; fieldKey: string; value: string; apiState: ApiState; onChange: (value: string) => void }) {
  const options = selectOptions(resource, fieldKey, apiState)
  const fieldOptions = value && options.length && !options.some((option) => option.value === value)
    ? [{ label: value, value }, ...options]
    : options
  if (fieldOptions.length) {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select {titleStatus(fieldKey).toLowerCase()}</option>
        {fieldOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    )
  }
  return <input value={value} placeholder={fieldPlaceholder(resource, fieldKey)} onChange={(event) => onChange(event.target.value)} />
}

function editableDraft(record: DpoRecord, resource?: string) {
  const resourceFields: Record<string, string[]> = {
    'designation-master-list': ['designation', 'amount', 'validityMonths', 'status'],
    complaints: ['complaintNumber', 'name', 'phone', 'category', 'subject', 'description', 'status'],
  }
  const keys = resourceFields[resource ?? ''] ?? Object.keys(record).filter((key) => !['id', 'createdAt', 'updatedAt'].includes(key)).slice(0, 12)
  return Object.fromEntries(keys.map((key) => [key, formatSettingValue(record[key])]))
}

function defaultDraft(resource: string): Record<string, string> {
  const suffix = Date.now().toString().slice(-5)
  const fields: Record<string, string[]> = {
    members: ['membershipNumber', 'name', 'email', 'phone', 'cnicMasked', 'district', 'country', 'paymentStatus', 'status'],
    complaints: ['complaintNumber', 'name', 'phone', 'category', 'subject', 'description', 'status'],
    payments: ['orderId', 'user', 'paymentType', 'amount', 'gateway', 'gatewayTransactionId', 'status'],
    'active-designations': ['holder', 'membershipNumber', 'designation', 'wing', 'province', 'district', 'area', 'issueDate', 'expiryDate', 'status'],
    'designation-master-list': ['designation', 'amount', 'validityMonths', 'status'],
    settings: ['key', 'label', 'group', 'value', 'status'],
  }

  const draft = Object.fromEntries((fields[resource] ?? ['name', 'title', 'status']).map((field) => [field, '']))
  if (resource === 'members') {
    draft.membershipNumber = `DPO-${new Date().getFullYear()}-${suffix}`
  }
  if (resource === 'designation-master-list') {
    draft.validityMonths = '12'
    draft.status = 'active'
  }
  if (resource === 'complaints') {
    draft.complaintNumber = `CMP-${Date.now()}`
    draft.status = 'pending'
  }
  if (resource === 'payments') {
    draft.orderId = `PAY-${Date.now()}`
    draft.gateway = 'Manual Transfer'
    draft.status = 'pending'
  }
  return draft
}

function fieldPlaceholder(resource: string, key: string) {
  const placeholders: Record<string, string> = {
    membershipNumber: 'DPO-00001',
    complaintNumber: 'CMP-00001',
    orderId: 'ORD-00001',
    gatewayTransactionId: 'TXN-00001',
    cnicMasked: '35202-*****-1',
    phone: '+92 300 0000000',
    email: 'name@example.com',
    totalAmount: '2000',
    amount: '2000',
    baseAmount: '1800',
    serviceFee: '200',
    imei: '356000000000000',
    status: resource === 'designation-master-list' ? 'active / inactive' : resource === 'payments' ? 'pending / paid' : 'active / pending / suspended',
  }
  return placeholders[key] ?? `Enter ${titleStatus(key).toLowerCase()}`
}

function selectOptions(resource: string, key: string, apiState?: ApiState) {
  if (resource === 'complaints' && key === 'status') {
    return [
      { label: 'Pending', value: 'pending' },
      { label: 'Under Review', value: 'under_review' },
      { label: 'Resolved', value: 'resolved' },
      { label: 'Closed', value: 'closed' },
    ]
  }

  if (resource === 'designation-master-list' && key === 'status') {
    return [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ]
  }

  if (key === 'designation' && resource !== 'designation-master-list') {
    const designationOptions = (apiState?.records['designation-master-list'] ?? [])
      .map((record) => toText(record.designation))
      .filter(Boolean)
    return Array.from(new Set(designationOptions)).map((designation) => ({ label: designation, value: designation }))
  }

  const shared: Record<string, { label: string; value: string }[]> = {
    status: [
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Active', value: 'active' },
      { label: 'Rejected', value: 'rejected' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Expired', value: 'expired' },
    ],
    paymentStatus: [
      { label: 'Pending', value: 'pending' },
      { label: 'Paid', value: 'paid' },
      { label: 'Failed', value: 'failed' },
      { label: 'Refunded', value: 'refunded' },
    ],
    country: [
      { label: 'Pakistan', value: 'Pakistan' },
      { label: 'UAE', value: 'UAE' },
      { label: 'Saudi Arabia', value: 'Saudi Arabia' },
      { label: 'United Kingdom', value: 'United Kingdom' },
    ],
    district: [
      { label: 'Karachi', value: 'Karachi' },
      { label: 'Lahore', value: 'Lahore' },
      { label: 'Multan', value: 'Multan' },
      { label: 'Rawalpindi', value: 'Rawalpindi' },
      { label: 'Peshawar', value: 'Peshawar' },
      { label: 'Quetta', value: 'Quetta' },
      { label: 'Dubai', value: 'Dubai' },
    ],
    priority: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Urgent', value: 'urgent' },
    ],
    gateway: [
      { label: 'Manual', value: 'Manual' },
      { label: 'JazzCash', value: 'JazzCash' },
      { label: 'EasyPaisa', value: 'EasyPaisa' },
      { label: 'Bank Transfer', value: 'Bank Transfer' },
    ],
    wing: [
      { label: 'General', value: 'General' },
      { label: 'Youth Wing', value: 'Youth Wing' },
      { label: 'Women Wing', value: 'Women Wing' },
      { label: 'Welfare', value: 'Welfare' },
      { label: 'Membership', value: 'Membership' },
      { label: 'Media', value: 'Media' },
    ],
    validityMonths: [
      { label: '12 Months', value: '12' },
      { label: '24 Months', value: '24' },
      { label: '36 Months', value: '36' },
    ],
  }
  if (resource === 'payments' && key === 'status') {
    return [
      { label: 'Pending', value: 'pending' },
      { label: 'Paid', value: 'paid' },
    ]
  }
  return shared[key] ?? []
}


function detailPairs(record: DpoRecord, resource: string): [string, string][] {
  const moduleName = resourceModuleName(resource)
  const preferred = getLiveColumns(moduleName).filter((column) => column !== 'Actions')
  const fallback = Object.keys(record).filter((key) => !['id', 'createdAt', 'updatedAt'].includes(key)).slice(0, 12).map(titleStatus)
  const labels = preferred.length ? preferred : fallback
  return labels.slice(0, 12).map((label) => [label, formatCell(label, record, resource)])
}

function resourceModuleName(resource: string) {
  return Object.entries(moduleResources).find(([, resources]) => resources.includes(resource))?.[0] ?? resource
}

function normalizeDraft(draft: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(draft).map(([key, value]) => {
      const numeric = Number(value)
      return [key, value.trim() !== '' && Number.isFinite(numeric) && /^\d+(\.\d+)?$/.test(value) ? numeric : value]
    }),
  )
}

function getRecordActions(resource: string) {
  if (resource === 'complaints') {
    return []
  }
  if (resource === 'payments') {
    return [{ label: 'Mark Paid', action: 'markPaid' }, { label: 'Fail', action: 'fail' }]
  }
  if (resource.includes('applications')) {
    return [{ label: 'Approve', action: 'approve' }, { label: 'Reject', action: 'reject' }]
  }
  if (resource === 'cms-pages' || resource === 'gallery-albums' || resource === 'card-templates') {
    return [{ label: 'Publish', action: 'publish' }, { label: 'Archive', action: 'archive' }]
  }
  return [{ label: 'Approve', action: 'approve' }, { label: 'Suspend', action: 'suspend' }, { label: 'Reactivate', action: 'reactivate' }]
}

function formatSettingValue(value: unknown) {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return toText(value)
}

function cmsSectionLabel(page: DpoRecord) {
  const labels: Record<string, string> = {
    home: 'Hero',
    'home-pillars': 'Pillars',
    'home-portals': 'Portal Cards',
    'home-who-we-are': 'Who We Are',
    'home-impact': 'Impact',
    'home-values': 'Values',
    'home-membership-journey': 'Membership Journey',
    'home-cta': 'Final CTA',
    about: 'About Page',
    'action-plan': 'Action Plan Page',
    membership: 'Membership Page',
    designations: 'Designations Page',
    'card-design': 'Card Page',
    gallery: 'Gallery Page',
    legal: 'Legal Page',
    contact: 'Contact Page',
    'member-services': 'Member Services Page',
    'membership-application': 'Membership Application',
    'designation-application': 'Designation Application',
    'application-status': 'Application Status',
  }
  const slug = toText(page.slug)
  return labels[slug] ?? titleStatus(slug.replace(/^(home|membership-page|designations|member-services)-/, ''))
}

function cmsItemParts(value: unknown, index: number) {
  const row = valueList(value)[index] ?? ''
  const [title, ...textParts] = row.split('|').map((part) => part.trim())
  return { title: title ?? '', text: textParts.join(' | ') }
}

function getAlbumImages(album: DpoRecord) {
  return Array.isArray(album.images) ? album.images.map((image) => toText(image)).filter(Boolean) : []
}

function getAlbumCover(album: DpoRecord) {
  const images = getAlbumImages(album)
  if (images[0]) return images[0]
  const cover = toText(album.coverImage)
  return cover || '/dpo-assets/front-1.png'
}

function getHomepageGalleryImage(album: DpoRecord) {
  const safeImage = getAlbumImages(album).find((image) => !image.endsWith('/front-1.png'))
  const cover = safeImage || getAlbumCover(album)
  return cover.endsWith('/front-1.png') ? '/dpo-assets/home-mission-v2.jpg' : cover
}

function getGalleryMediaRows(albums: DpoRecord[]) {
  return albums.flatMap((album) => {
    const images = getAlbumImages(album)
    const albumTitle = toText(album.titleEnglish) || 'Gallery Album'
    const rows = images.length ? images : [getAlbumCover(album)]
    return rows.map((src, index) => ({
      src,
      album,
      fileName: src.split('/').pop() || `gallery-image-${index + 1}.png`,
      size: `${formatNumber(Math.max(620, (index + 1) * 410))} KB`,
      type: isImageAsset(src) ? 'Image' : 'File',
      albumTitle,
      altText: `${albumTitle} media ${index + 1}`,
      status: galleryPublishStatus(album.status),
      uploadedDate: formatDate(album.eventDate ?? album.createdAt),
    }))
  }).slice(0, 8)
}

function galleryPublishStatus(status: unknown) {
  return normalizeStatus(status) === 'published' ? 'Published' : 'Unpublished'
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const source = toText(reader.result)
      const image = new Image()
      image.onload = () => {
        const maxSize = 1600
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(Math.round(image.width * ratio), 1)
        canvas.height = Math.max(Math.round(image.height * ratio), 1)
        const context = canvas.getContext('2d')
        if (!context) {
          resolve(source)
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.onerror = () => resolve(source)
      image.src = source
    }
    reader.onerror = () => reject(reader.error ?? new Error('Image upload failed'))
    reader.readAsDataURL(file)
  })
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function cmsEditorText(record: DpoRecord | undefined, language: 'en' | 'ur') {
  const content = asObject(record?.content)
  if (language === 'ur') {
    return [
      content.bodyUrdu,
      content.urdu,
      content.urduContent,
      content.titleUrdu,
    ].map(toText).find(Boolean) ?? ''
  }
  return [
    content.bodyEnglish,
    content.body,
    content.english,
    content.aboutDetails,
    content.organizationDetails,
    content.mission,
    content.vision,
    content.description,
  ].map(toText).find(Boolean) ?? ''
}

function collectCmsAssets(records: DpoRecord[]) {
  const assets = new Set<string>()
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(visit)
      return
    }
    const text = toText(value)
    if (/^\/(dpo-assets|favicon)/.test(text) || /\.(png|jpe?g|webp|svg|ico|pdf|docx?)$/i.test(text)) {
      assets.add(text)
    }
  }
  records.forEach((record) => visit(record))
  return Array.from(assets)
}

function isImageAsset(asset: string) {
  return /\.(png|jpe?g|webp|svg|ico)$/i.test(asset)
}

function slugify(value: string) {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || `cms-page-${Date.now()}`
}

function searchableText(record: DpoRecord) {
  return Object.values(record).map((value) => toText(value).toLowerCase()).join(' ')
}

function downloadCsv(moduleName: string, rows: { cells: string[] }[]) {
  const csv = rows.map((row) => row.cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${moduleName.toLowerCase().replaceAll(' ', '-')}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function toText(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function normalizeStatus(value: unknown) {
  return toText(value).replaceAll('_', ' ').toLowerCase()
}

function titleStatus(value: unknown) {
  const text = toText(value).replaceAll('_', ' ')
  if (!text) return '-'
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatNumber(value: unknown) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? new Intl.NumberFormat('en-PK').format(number) : toText(value)
}

function formatCurrency(value: unknown) {
  const number = Number(value ?? 0)
  if (!Number.isFinite(number)) return toText(value)
  return `PKR ${new Intl.NumberFormat('en-PK').format(number)}`
}

function initialsFrom(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DP'
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div className="summary-stat"><p>{label}</p><span>{value}</span></div>
}

function Tag({ tone, children }: { tone: 'success' | 'warning' | 'danger' | 'info'; children: React.ReactNode }) {
  return <span className={`tag ${tone}`}>{children}</span>
}

function Status({ children }: { children: string }) {
  const value = children
  const tone = ['Paid', 'Approved', 'Active', 'Resolved', 'Low'].includes(value)
    ? 'success'
    : ['Under Review', 'Request Info', 'In Progress'].includes(value)
      ? 'info'
      : ['Failed', 'Rejected', 'Inactive', 'High'].includes(value)
        ? 'danger'
        : 'warning'

  return <Tag tone={tone}>{children}</Tag>
}

export default App

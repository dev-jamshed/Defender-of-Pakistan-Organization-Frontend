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
  HeartHandshake,
  LayoutDashboard,
  MapPinned,
  Moon,
  MoreVertical,
  PanelLeftClose,
  Plus,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, active: true },
  { name: 'Members Management', icon: UsersRound },
  { name: 'Membership Applications', icon: FileText },
  { name: 'Membership Cards', icon: CreditCard },
  { name: 'Designation Applications', icon: ShieldCheck },
  { name: 'Active Designations', icon: BadgeCheck },
  { name: 'Designation Renewals', icon: CalendarDays },
  { name: 'Designation Master List', icon: FileText },
  { name: 'Geographic Areas', icon: MapPinned },
  { name: 'Wireless Devices', icon: RadioTower },
  { name: 'Complaint Management', icon: CircleHelp },
  { name: 'Payments & Finance', icon: Banknote },
  { name: 'Welfare & Donations', icon: HeartHandshake },
  { name: 'Gallery Management', icon: GalleryHorizontalEnd },
  { name: 'Website CMS', icon: FileText },
  { name: 'Card Templates', icon: CreditCard },
  { name: 'Notifications', icon: Bell },
  { name: 'Admin Users', icon: UsersRound },
  { name: 'Roles & Permissions', icon: ShieldCheck },
  { name: 'Reports', icon: BadgeCheck },
  { name: 'Settings', icon: Settings },
  { name: 'Audit Logs', icon: FileText },
]

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
  runAction: (resource: string, id: string, action: string, payload?: Record<string, unknown>) => Promise<unknown>
}

const moduleResources: Record<string, string[]> = {
  'Members Management': ['members'],
  'Membership Applications': ['membership-applications'],
  'Membership Cards': ['membership-cards'],
  'Designation Applications': ['designation-applications'],
  'Active Designations': ['active-designations'],
  'Designation Renewals': ['designation-renewals'],
  'Designation Master List': ['designation-master-list'],
  'Geographic Areas': ['geographic-areas'],
  'Wireless Devices': ['wireless-devices'],
  'Complaint Management': ['complaints'],
  'Payments & Finance': ['payments'],
  'Welfare & Donations': ['welfare-campaigns', 'donations'],
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

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

async function apiSend<T>(path: string, method: 'POST' | 'PATCH', payload: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

function useDpoApi(): ApiState {
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
    runAction: async () => {
      throw new Error('API is not ready')
    },
  })

  const reload = async () => {
      try {
        setState((current) => ({ ...current, loading: true, error: null }))
        const [dashboard, database, schemas] = await Promise.all([
          apiGet<DashboardSummary>('/admin/dashboard'),
          apiGet<DatabaseStatus>('/admin/database/status'),
          apiGet<ResourceSchema[]>('/admin/schemas'),
        ])
        const resourceNames = schemas.map((schema) => schema.resource)
        const lists = await Promise.all(
          resourceNames.map((resource) =>
            apiGet<ListResponse>(`/admin/${resource}?limit=100`).then((response) => [resource, response.data] as const),
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
    }

  const createRecord = async (resource: string, payload: Record<string, unknown>) => {
    const record = await apiSend<DpoRecord>(`/admin/${resource}`, 'POST', payload)
    await reload()
    setState((current) => ({ ...current, notice: `${resource} record created` }))
    return record
  }

  const updateRecord = async (resource: string, id: string, payload: Record<string, unknown>) => {
    const record = await apiSend<DpoRecord>(`/admin/${resource}/${id}`, 'PATCH', payload)
    await reload()
    setState((current) => ({ ...current, notice: `${resource} record updated` }))
    return record
  }

  const runAction = async (resource: string, id: string, action: string, payload: Record<string, unknown> = {}) => {
    const result = await apiSend<unknown>(`/admin/${resource}/${id}/actions/${action}`, 'POST', payload)
    await reload()
    setState((current) => ({ ...current, notice: `${titleStatus(action)} completed` }))
    return result
  }

  useEffect(() => {
    let active = true
    void reload().finally(() => {
      if (!active) return
    })
    return () => {
      active = false
    }
  }, [])

  return { ...state, reload, createRecord, updateRecord, runAction }
}

function getInitialNav() {
  const hashValue = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : ''
  return navItems.some((item) => item.name === hashValue) ? hashValue : 'Dashboard'
}

function App() {
  const [activeNav, setActiveNavState] = useState(getInitialNav)
  const [period, setPeriod] = useState('This Month')
  const [areaFilter, setAreaFilter] = useState('All Provinces')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const apiState = useDpoApi()
  const setActiveNav = (value: string) => {
    setActiveNavState(value)
    window.location.hash = encodeURIComponent(value)
  }

  return (
    <div className={`logicsols-app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} collapsed={sidebarCollapsed} />
      <main className="layout-main">
        <Navbar activeNav={activeNav} apiState={apiState} searchQuery={searchQuery} setSearchQuery={setSearchQuery} toggleSidebar={() => setSidebarCollapsed((value) => !value)} />
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
          <strong>Defenders of Pakistan Organization</strong>
          <small>Admin Panel</small>
        </div>}
      </div>

      <div className="sidebar-scroll">
        <ul className="nav-list">
          {navItems.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button className={activeNav === name ? 'active' : ''} type="button" onClick={() => setActiveNav(name)}>
                <Icon className="nav-icon" />
                {!collapsed && <span>{name}</span>}
              </button>
            </li>
          ))}
        </ul>

        {!collapsed && <div className="sidebar-footer">
          <a href="#help">
            <CircleHelp size={22} />
            <p>Help & Support</p>
          </a>
        </div>}
      </div>
    </aside>
  )
}

function Navbar({ activeNav, apiState, searchQuery, setSearchQuery, toggleSidebar }: { activeNav: string; apiState: ApiState; searchQuery: string; setSearchQuery: (value: string) => void; toggleSidebar: () => void }) {
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
        <div className="language-switch" aria-label="Language switch">
          <button type="button" className="active">EN</button>
          <button type="button">UR</button>
        </div>
        <button className="outline-icon" type="button" aria-label="Theme"><Moon size={21} /></button>
        <button className="outline-icon notify-btn" type="button" aria-label="Notifications"><Bell size={20} /></button>
        <button className="profile-trigger" type="button">
          <span className="profile-avatar">SA</span>
          <span className="profile-copy">
            <b>Super Admin</b>
            <small>Admin</small>
          </span>
          <ChevronDown size={16} />
        </button>
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
          <KpiGrid dashboard={apiState.dashboard} database={apiState.database} />
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
            <div className="col-8"><MembersManagement membersData={apiState.records.members ?? []} apiState={apiState} searchQuery={searchQuery} /></div>
            <div className="col-4"><MemberDetail member={(apiState.records.members ?? [])[0]} apiState={apiState} /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-7"><ComplaintManagement complaintsData={apiState.records.complaints ?? []} apiState={apiState} /></div>
            <div className="col-5"><CmsAndCards cmsPages={apiState.records['cms-pages'] ?? []} cardTemplates={apiState.records['card-templates'] ?? []} member={(apiState.records.members ?? [])[0]} apiState={apiState} /></div>
          </div>
        </div>

        <div className="col-12">
          <RecentRequirementTables apiState={apiState} setActiveNav={setActiveNav} />
        </div>
      </div>
    </div>
  )
}

function KpiGrid({ dashboard, database }: { dashboard: DashboardSummary | null; database: DatabaseStatus | null }) {
  const kpis: [string, unknown, LucideIcon, string][] = [
    ['Total Members', dashboard?.kpis.totalMembers, UsersRound, 'success'],
    ['Pending Applications', dashboard?.kpis.pendingApplications, FileText, 'warning'],
    ['Active Members', dashboard?.kpis.activeMembers, CircleCheck, 'success'],
    ['Expired Members', dashboard?.kpis.expiredMembers, CircleX, 'danger'],
    ['Total Designations', dashboard?.kpis.totalDesignations, ShieldCheck, 'info'],
    ['Pending Designations', dashboard?.kpis.pendingDesignations, CalendarDays, 'warning'],
    ['Open Complaints', dashboard?.kpis.openComplaints, CircleHelp, 'warning'],
    ['Urgent Complaints', dashboard?.kpis.urgentComplaints, CircleHelp, 'danger'],
    ['Today Payments', dashboard?.kpis.todayPayments, Banknote, 'success'],
    ['Monthly Revenue', formatCurrency(dashboard?.kpis.monthlyRevenue), Banknote, 'success'],
    ['Total Donations', formatCurrency(dashboard?.kpis.totalDonations), HeartHandshake, 'info'],
    ['Active Wireless Devices', dashboard?.kpis.activeWirelessDevices ?? database?.resourceCounts['wireless-devices'], RadioTower, 'success'],
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
    ['Recent Complaints', 'Complaint Management', apiState.records.complaints ?? [], ['complaintNumber', 'name', 'category', 'priority', 'status']],
    ['Recent Payments', 'Payments & Finance', apiState.records.payments ?? [], ['orderId', 'user', 'paymentType', 'totalAmount', 'status']],
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
  const activeWirelessDevices = Number(apiState.dashboard?.kpis.activeWirelessDevices ?? 0)
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
        <SummaryStat label="Wireless Devices" value={formatNumber(activeWirelessDevices)} />
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
    [`${formatNumber(dashboard?.kpis.pendingDesignations ?? 0)} designations pending approval`, 'Live', ShieldCheck, 'Designations'],
    [`${formatNumber(database?.resourceCounts['membership-cards'] ?? 0)} cards available for review`, 'DB', CreditCard, 'Applications'],
    [`${formatNumber(database?.resourceCounts.payments ?? 0)} payment records synced`, 'DB', Banknote, 'Payments'],
    [`${formatNumber(dashboard?.kpis.activeWirelessDevices ?? 0)} active wireless devices`, 'Live', RadioTower, 'Wireless Devices'],
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
  const totalDonations = Number(dashboard?.kpis.totalDonations ?? 0)
  const revenueRows = ((dashboard?.charts.revenueByMonth as { month: string; revenue: number }[] | undefined) ?? []).slice(-5)
  return (
    <section className="logicsols-card financial-card">
      <div className="financial-head">
        <h2>Financial Insights</h2>
        <div className="legend">
          <span><i className="muted" /> Total Revenue</span>
          <span><i className="green" /> Service Fee</span>
          <span><i className="gold" /> Donations</span>
        </div>
      </div>
      <h3>{formatCurrency(monthlyRevenue)} <Tag tone="success">Live finance</Tag></h3>
      <div className="financial-body">
        <div className="bar-chart">
          {(revenueRows.length ? revenueRows : [{ month: 'Now', revenue: monthlyRevenue }]).map((row, index) => {
            const revenue = Math.max(18, Math.min(95, Math.round((Number(row.revenue) / Math.max(monthlyRevenue, 1)) * 90)))
            const fee = Math.max(12, Math.round(revenue * 0.55))
            const donation = Math.max(10, Math.round((totalDonations / Math.max(monthlyRevenue + totalDonations, 1)) * 80))
            return (
            <div className="bar-week" key={index}>
              <span className="expected" style={{ height: `${revenue}%` }} />
              <span className="actual" style={{ height: `${fee}%` }} />
              <span className="donation" style={{ height: `${donation}%` }} />
              <small>{row.month}</small>
            </div>
            )
          })}
        </div>
        <div className="finance-side">
          <SummaryStat label="Paid Records" value={formatNumber(dashboard?.kpis.todayPayments ?? 0)} />
          <SummaryStat label="Monthly Revenue" value={formatCurrency(monthlyRevenue)} />
          <SummaryStat label="Donations" value={formatCurrency(totalDonations)} />
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

function MemberDetail({ member, apiState }: { member?: DpoRecord; apiState: ApiState }) {
  const initials = initialsFrom(toText(member?.name) || 'Member')
  const applyAction = (action: string) => {
    if (!member) return
    if (action === 'Renew') {
      void apiState.updateRecord('members', member.id, { status: 'active', expiryDate: '2027-12-31' })
      return
    }
    if (action === 'Generate Card') {
      void apiState.createRecord('membership-cards', {
        cardNumber: `CARD-${member.id}`,
        membershipNumber: member.membershipNumber,
        name: member.name,
        templateVersion: 'membership-v2.1',
        qrValue: `${API_BASE}/public/verify/member/${toText(member.membershipNumber)}`,
        status: 'active',
      })
      return
    }
    const actionMap: Record<string, string> = { Approve: 'approve', Reject: 'reject', Suspend: 'suspend' }
    void apiState.runAction('members', member.id, actionMap[action] ?? action.toLowerCase())
  }
  return (
    <section className="logicsols-card member-card">
      <h2>Member Detail</h2>
      <div className="member-profile">
        <div className="member-avatar">{initials}</div>
        <div>
          <h3>{toText(member?.name) || 'No member selected'} <Status>{titleStatus(member?.status)}</Status></h3>
          <p>{toText(member?.membershipNumber) || '-'}</p>
          <small>{toText(member?.cnicMasked) || '-'}</small>
        </div>
      </div>
      <div className="member-actions">
        {['Approve', 'Reject', 'Suspend', 'Renew', 'Generate Card'].map((action) => <button type="button" key={action} onClick={() => applyAction(action)}>{action}</button>)}
      </div>
      <div className="member-tabs">
        {['Personal Information', 'CNIC Documents', 'Payment History', 'Card Versions', 'Audit History'].map((tab, index) => <button className={index === 0 ? 'active' : ''} type="button" key={tab}>{tab}</button>)}
      </div>
      <div className="info-grid">
        <SummaryStat label="Issue Date" value={toText(member?.issueDate) || '-'} />
        <SummaryStat label="Expiry Date" value={toText(member?.expiryDate) || '-'} />
      </div>
    </section>
  )
}

function ComplaintManagement({ complaintsData, apiState }: { complaintsData: DpoRecord[]; apiState: ApiState }) {
  const [selected, setSelected] = useState<DpoRecord | undefined>(complaintsData[0])
  const activeComplaint = selected ?? complaintsData[0]
  const handleComplaintAction = (action: string) => {
    if (!activeComplaint) return
    if (action === 'Assign') {
      void apiState.updateRecord('complaints', activeComplaint.id, { assignedOfficer: 'Super Admin', status: 'under_review' })
    } else if (action === 'Priority') {
      void apiState.updateRecord('complaints', activeComplaint.id, { priority: 'high' })
    } else if (action === 'Public Update') {
      void apiState.updateRecord('complaints', activeComplaint.id, { publicResponse: 'Your complaint is under review.' })
    } else {
      void apiState.runAction('complaints', activeComplaint.id, 'resolve', { publicResponse: 'Complaint resolved.' })
    }
  }
  return (
    <section className="logicsols-card complaint-card">
      <div className="table-title">
        <h2>Complaint Management</h2>
        <button type="button">Assign Officer</button>
      </div>
      <div className="complaint-layout">
        <div className="table-scroll">
          <table>
            <thead><tr>{['Complaint No', 'Subject', 'Category', 'Priority', 'Status'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {complaintsData.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)}>
                  <td>{toText(row.complaintNumber)}</td><td>{toText(row.subject)}</td><td>{toText(row.category)}</td><td><Status>{titleStatus(row.priority)}</Status></td><td><Status>{titleStatus(row.status)}</Status></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="complaint-detail">
          <span>Selected Complaint Workflow</span>
          <h3>{toText(activeComplaint?.complaintNumber) || '-'}</h3>
          <p>{toText(activeComplaint?.subject) || 'No complaint selected.'}</p>
          <strong>{toText(activeComplaint?.slaDueAt) || 'No SLA'}</strong>
          <div>{['Assign', 'Priority', 'Public Update', 'Resolve'].map((x) => <button type="button" key={x} onClick={() => handleComplaintAction(x)}>{x}</button>)}</div>
        </aside>
      </div>
    </section>
  )
}

function CmsAndCards({ cmsPages, cardTemplates, member, apiState }: { cmsPages: DpoRecord[]; cardTemplates: DpoRecord[]; member?: DpoRecord; apiState: ApiState }) {
  const [activeTab, setActiveTab] = useState('Hero Slides')
  const activeTemplate = cardTemplates[0]
  const homePage = cmsPages.find((page) => page.slug === 'home') ?? cmsPages[0]
  const heroSlides = getHeroSlides(homePage)
  const activePageCount = cmsPages.filter((page) => page.status === 'published').length
  return (
    <section className="logicsols-card cms-card">
      <h2>Website CMS & Card Template</h2>
      <p className="section-help">Manage public website content and active membership card template from one admin workspace.</p>
      <div className="cms-buttons">
        {['Logo', 'Hero Slides', 'Mission', 'Policies', 'SEO', 'Urdu Editor'].map((x) => <button className={activeTab === x ? 'active' : ''} type="button" key={x} onClick={() => setActiveTab(x)}>{x}</button>)}
      </div>
      <div className="cms-workflow">
        <span><b>CMS Status</b>{activePageCount} published pages</span>
        <span><b>Active Template</b>{toText(activeTemplate?.name) || '-'}</span>
      </div>
      <div className="asset-strip">
        {heroSlides.slice(0, 4).map((slide) => (
          <img src={slide} alt="DPO supplied asset" key={slide} />
        ))}
      </div>
      <div className="id-card">
        <span>DPO Membership Card</span>
        <b>{toText(member?.name) || 'Member Name'}</b>
        <small>{toText(member?.membershipNumber) || 'DPO-ID'}</small>
        <i>QR</i>
      </div>
      <button className="activate-template" type="button" onClick={() => activeTemplate && void apiState.runAction('card-templates', activeTemplate.id, 'publish')}>Activate Template</button>
    </section>
  )
}

function ModuleScreen({ moduleName, apiState, searchQuery }: { moduleName: string; apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState<{ resource: string; record: DpoRecord } | null>(null)
  const [creatingResource, setCreatingResource] = useState<string | null>(null)
  const { columns, rows, resourceTitle } = useMemo(
    () => getLiveModuleTable(moduleName, status, apiState, searchQuery),
    [moduleName, status, apiState, searchQuery],
  )
  const primaryResource = moduleResources[moduleName]?.[0] ?? 'members'
  const selectedResource = selected?.resource ?? primaryResource
  const selectedRecord = selected?.record ?? apiState.records[selectedResource]?.[0]
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
  if (moduleName === 'Website CMS') {
    return <WebsiteCmsScreen apiState={apiState} searchQuery={searchQuery} />
  }

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-grid">
        <div className="col-12">
          <div className="inner-grid">
            <div className="col-8">
              <section className="logicsols-card table-card">
                <div className="table-title">
                  <h2>{resourceTitle}</h2>
                  <button type="button" onClick={() => setCreatingResource(primaryResource)}>+ Add New</button>
                </div>
                <div className="table-filters">
                  {['All', 'Active', 'Pending', 'Under Review', 'Failed'].map((filter) => (
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
  const [creating, setCreating] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const members = apiState.records.members ?? []
  const today = new Date()
  const inThirtyDays = new Date(today)
  inThirtyDays.setDate(today.getDate() + 30)
  const activeMembers = members.filter((member) => normalizeStatus(member.status) === 'active')
  const pendingMembers = members.filter((member) => ['pending', 'underreview', 'requestinfo'].includes(normalizeStatus(member.status)))
  const expiringSoon = members.filter((member) => {
    const expiry = new Date(toText(member.expiryDate))
    return Number.isFinite(expiry.getTime()) && expiry >= today && expiry <= inThirtyDays
  })
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
  const handleMemberAction = async (member: DpoRecord, action: 'generate' | 'approve' | 'reject' | 'suspend' | 'reactivate' | 'markPaid' | 'markPending') => {
    setOpenMenuId(null)
    if (action === 'generate') {
      await apiState.runAction('members', member.id, 'approve')
      setActionMessage(`Card generation started for ${toText(member.name) || 'member'}.`)
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
        <MemberKpi icon={CalendarDays} label="Expiring Soon" value={expiringSoon.length} note="Within next 30 days" tone="danger" />
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
                  {['Member ID', 'Name', 'CNIC', 'Phone', 'District', 'Type', 'Payment', 'Status', 'Expiry', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}
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
                    <td>{toText(member.membershipType)}</td>
                    <td><Status>{titleStatus(member.paymentStatus)}</Status></td>
                    <td><Status>{titleStatus(member.status)}</Status></td>
                    <td>{formatDate(member.expiryDate)}</td>
                    <td>
                      <div className="member-row-actions">
                        {canGenerateCard(member) && (
                          <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); void handleMemberAction(member, 'generate') }}>
                            <CreditCard size={14} /> Generate Card
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

function MembershipApplicationsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [status, setStatus] = useState('All')
  const [paymentStatus, setPaymentStatus] = useState('All')
  const [membershipType, setMembershipType] = useState('All')
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
    const matchesType = membershipType === 'All' || toText(application.membershipType) === membershipType
    const matchesDistrict = district === 'All Districts' || toText(application.district) === district
    return matchesSearch && matchesStatus && matchesPayment && matchesType && matchesDistrict
  })
  const typeOptions = ['All', ...Array.from(new Set(applications.map((item) => toText(item.membershipType)).filter(Boolean)))]
  const districtOptions = ['All Districts', ...Array.from(new Set(applications.map((item) => toText(item.district)).filter(Boolean)))]
  const documentNeeds = applications.filter((item) => documentSummary(item).tone !== 'success').length
  const paymentVerified = applications.filter((item) => ['paid', 'verified', 'approved'].includes(normalizeStatus(item.paymentStatus))).length
  const rejected = applications.filter((item) => normalizeStatus(item.status) === 'rejected').length
  const canApproveApplication = (application: DpoRecord) => ['paid', 'verified', 'approved'].includes(normalizeStatus(application.paymentStatus)) && normalizeStatus(application.status) !== 'rejected'
  const exportApplications = () => downloadCsv('Membership Applications', visibleApplications.map((record) => ({
    cells: ['applicationNumber', 'name', 'cnicMasked', 'phone', 'membershipType', 'district', 'paymentStatus', 'status', 'createdAt'].map((key) => formatCompactValue(record[key])),
  })))
  const handleApplicationAction = async (application: DpoRecord, action: 'approve' | 'reject' | 'requestInfo' | 'markPaid' | 'markPending') => {
    setOpenMenuId(null)
    if (action === 'approve') {
      await apiState.runAction('membership-applications', application.id, 'approve')
      setActionMessage(`${toText(application.name) || 'Application'} approved.`)
      return
    }
    if (action === 'reject') {
      await apiState.runAction('membership-applications', application.id, 'reject')
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
            <label className="filter-field wide">
              <span>Membership Type</span>
              <select value={membershipType} onChange={(event) => setMembershipType(event.target.value)} aria-label="Membership type">
                {typeOptions.map((item) => <option key={item}>{item}</option>)}
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
                  {['Application ID', 'Applicant', 'CNIC', 'Phone', 'Type', 'District', 'Payment', 'Documents', 'Status', 'Submitted', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((application) => (
                  <tr key={application.id} onClick={() => setDrawerRecord(application)}>
                    {(() => {
                      const docs = documentSummary(application)
                      return (
                        <>
                    <td>{toText(application.applicationNumber ?? application.id)}</td>
                    <td><b>{toText(application.name)}</b><small>{toText(application.country) || 'Pakistan'}</small></td>
                    <td>{toText(application.cnicMasked)}</td>
                    <td>{toText(application.phone)}</td>
                    <td>{toText(application.membershipType)}</td>
                    <td>{toText(application.district)}</td>
                    <td><Status>{titleStatus(application.paymentStatus)}</Status></td>
                    <td><Tag tone={docs.tone}>{docs.label}</Tag></td>
                    <td><Status>{titleStatus(application.status)}</Status></td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <div className="member-row-actions">
                        {canApproveApplication(application) && (
                          <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); void handleApplicationAction(application, 'approve') }}>
                            <CircleCheck size={14} /> Approve
                          </button>
                        )}
                        <button className="reject-row" type="button" onClick={(event) => { event.stopPropagation(); void handleApplicationAction(application, 'reject') }}>Reject</button>
                        <button className="icon-table-btn view-btn" type="button" aria-label="View application" onClick={(event) => { event.stopPropagation(); setDrawerRecord(application) }}><Eye size={16} /></button>
                        <div className="row-menu-wrap">
                          <button className="icon-table-btn more-btn" type="button" aria-label="More application actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === application.id ? null : application.id) }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === application.id && (
                            <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                              <button type="button" onClick={() => void handleApplicationAction(application, 'approve')}>Approve</button>
                              <button type="button" onClick={() => void handleApplicationAction(application, 'reject')}>Reject</button>
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

function WebsiteCmsScreen({ apiState, searchQuery }: { apiState: ApiState; searchQuery: string }) {
  const [tab, setTab] = useState('Pages')
  const [language, setLanguage] = useState('All')
  const [status, setStatus] = useState('All')
  const [pageType, setPageType] = useState('All')
  const [editorState, setEditorState] = useState<{ mode: 'create' | 'edit'; record?: DpoRecord } | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const pages = apiState.records['cms-pages'] ?? []
  const homePage = pages.find((page) => toText(page.slug) === 'home') ?? pages[0]
  const heroSlides = getHeroSlides(homePage)
  const cmsAssets = collectCmsAssets(pages)
  const visiblePages = pages.filter((page) => {
    const matchesSearch = searchQuery ? searchableText(page).includes(searchQuery.toLowerCase()) : true
    const pageLanguage = toText(page.language ?? page.lang ?? 'EN') || 'EN'
    const matchesLanguage = language === 'All' || pageLanguage === language
    const matchesStatus = status === 'All' || normalizeStatus(page.status) === normalizeStatus(status)
    const matchesType = pageType === 'All' || toText(page.type) === pageType
    return matchesSearch && matchesLanguage && matchesStatus && matchesType
  })
  const languageOptions = ['All', ...Array.from(new Set(pages.map((page) => toText(page.language ?? page.lang ?? 'EN') || 'EN')))]
  const statusOptions = ['All', ...Array.from(new Set(pages.map((page) => titleStatus(page.status)).filter(Boolean)))]
  const typeOptions = ['All', ...Array.from(new Set(pages.map((page) => toText(page.type)).filter(Boolean)))]
  const drafts = pages.filter((page) => normalizeStatus(page.status) === 'draft').length
  const published = pages.filter((page) => normalizeStatus(page.status) === 'published').length
  const seoIssues = pages.filter((page) => !toText(page.seoTitle)).length
  const exportPages = () => downloadCsv('Website CMS', visiblePages.map((record) => ({
    cells: ['titleEnglish', 'slug', 'type', 'seoTitle', 'status', 'updatedAt'].map((key) => formatCompactValue(record[key])),
  })))
  const handleCmsAction = async (page: DpoRecord, action: 'publish' | 'archive' | 'draft') => {
    setOpenMenuId(null)
    if (action === 'publish') {
      await apiState.runAction('cms-pages', page.id, 'publish')
      setActionMessage(`${toText(page.titleEnglish) || 'Page'} published.`)
      return
    }
    if (action === 'archive') {
      await apiState.runAction('cms-pages', page.id, 'archive')
      setActionMessage(`${toText(page.titleEnglish) || 'Page'} archived.`)
      return
    }
    await apiState.updateRecord('cms-pages', page.id, { status: 'draft' })
    setActionMessage(`${toText(page.titleEnglish) || 'Page'} saved as draft.`)
  }

  return (
    <div className="dashboard-wrap members-page cms-page">
      <section className="member-kpis">
        <MemberKpi icon={FileText} label="Published Pages" value={published} note="Live website content" tone="success" />
        <MemberKpi icon={FileText} label="Draft Updates" value={drafts} note="Waiting to publish" tone="warning" />
        <MemberKpi icon={GalleryHorizontalEnd} label="Hero Slides" value={heroSlides.length} note="DPO supplied assets" tone="success" />
        <MemberKpi icon={AlertTriangle} label="SEO Issues" value={seoIssues} note="Missing SEO title" tone="danger" />
      </section>

      <section className="members-table-panel cms-workspace-panel">
        <div className="cms-tabs">
          {['Pages', 'Hero Slides', 'Organization Content', 'Media Library', 'SEO', 'Social Links', 'Legal Pages'].map((item) => (
            <button className={tab === item ? 'active' : ''} type="button" key={item} onClick={() => setTab(item)}>{item}</button>
          ))}
        </div>

        <div className="members-toolbar cms-toolbar">
          <button className="primary-action" type="button" onClick={() => setEditorState({ mode: 'create' })}><Plus size={16} /> New Page</button>
          <button className="soft-action" type="button" onClick={() => visiblePages[0] && void handleCmsAction(visiblePages[0], 'publish')}>Publish Selected</button>
          <button className="soft-action" type="button" onClick={exportPages}><Download size={15} /> Export</button>
          <label className="filter-field">
            <span>Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languageOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Page Type</span>
            <select value={pageType} onChange={(event) => setPageType(event.target.value)}>
              {typeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {tab === 'Pages' ? (
          <div className="production-table-scroll">
            <table className="production-members-table cms-table">
              <thead>
                <tr>{['Page', 'Slug', 'Language', 'Type', 'SEO Title', 'Last Updated', 'Status', 'Actions'].map((heading) => <th key={heading}>{heading}</th>)}</tr>
              </thead>
              <tbody>
                {visiblePages.map((page) => (
                  <tr key={page.id} onClick={() => setEditorState({ mode: 'edit', record: page })}>
                    <td><b>{toText(page.titleEnglish) || toText(page.titleUrdu) || '-'}</b><small>{toText(page.titleUrdu)}</small></td>
                    <td>/{toText(page.slug).replace(/^\/+/, '')}</td>
                    <td><Tag tone="info">{toText(page.language ?? page.lang ?? 'EN') || 'EN'}</Tag></td>
                    <td>{titleStatus(page.type)}</td>
                    <td>{toText(page.seoTitle) || '-'}</td>
                    <td>{formatDate(page.updatedAt)}</td>
                    <td><Status>{titleStatus(page.status)}</Status></td>
                    <td>
                      <div className="member-row-actions">
                        <button className="generate-card-row" type="button" onClick={(event) => { event.stopPropagation(); setEditorState({ mode: 'edit', record: page }) }}>Edit</button>
                        <button className="icon-table-btn view-btn" type="button" aria-label="Preview page" onClick={(event) => { event.stopPropagation(); setEditorState({ mode: 'edit', record: page }) }}><Eye size={16} /></button>
                        <div className="row-menu-wrap">
                          <button className="icon-table-btn more-btn" type="button" aria-label="More CMS actions" onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === page.id ? null : page.id) }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === page.id && (
                            <div className="row-action-menu" onClick={(event) => event.stopPropagation()}>
                              <button type="button" onClick={() => void handleCmsAction(page, 'publish')}>Publish</button>
                              <button type="button" onClick={() => void handleCmsAction(page, 'draft')}>Save Draft</button>
                              <button type="button" onClick={() => void handleCmsAction(page, 'archive')}>Archive</button>
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
        ) : (
          <div className="cms-tab-empty">
            <h2>{tab}</h2>
            <p>Content is loaded from the CMS database and DPO assets.</p>
          </div>
        )}

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
  const [draft, setDraft] = useState({
    titleEnglish: toText(record?.titleEnglish),
    titleUrdu: toText(record?.titleUrdu),
    slug: toText(record?.slug),
    type: toText(record?.type) || 'content',
    language: toText(record?.language ?? record?.lang) || 'EN',
    status: normalizeStatus(record?.status) || 'draft',
    seoTitle: toText(record?.seoTitle),
    metaDescription: toText(recordContent.metaDescription ?? recordContent.description ?? record?.metaDescription),
    contentEnglish: cmsEditorText(record, 'en'),
    contentUrdu: cmsEditorText(record, 'ur'),
  })
  const [saving, setSaving] = useState(false)

  const updateDraft = (key: keyof typeof draft, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const saveCmsPage = async (nextStatus = draft.status) => {
    setSaving(true)
    try {
      const cleanSlug = (draft.slug || slugify(draft.titleEnglish || draft.titleUrdu || 'cms-page')).replace(/^\/+/, '')
      const payload = {
        titleEnglish: draft.titleEnglish.trim() || 'Untitled Page',
        titleUrdu: draft.titleUrdu.trim(),
        slug: cleanSlug,
        type: draft.type,
        language: draft.language,
        status: nextStatus,
        seoTitle: draft.seoTitle.trim(),
        content: {
          ...recordContent,
          bodyEnglish: draft.contentEnglish,
          bodyUrdu: draft.contentUrdu,
          metaDescription: draft.metaDescription,
          updatedFromCmsEditor: true,
        },
      }
      if (mode === 'create') {
        await apiState.createRecord('cms-pages', payload)
      } else if (record) {
        await apiState.updateRecord('cms-pages', record.id, payload)
      }
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
          <label className="cms-editor-field">
            <span>English Title</span>
            <input value={draft.titleEnglish} onChange={(event) => updateDraft('titleEnglish', event.target.value)} placeholder="About Defenders of Pakistan" />
          </label>
          <label className="cms-editor-field urdu-field">
            <span>Urdu Title</span>
            <input dir="rtl" lang="ur" value={draft.titleUrdu} onChange={(event) => updateDraft('titleUrdu', event.target.value)} placeholder="پاکستان کے محافظ" />
          </label>
          <label className="cms-editor-field">
            <span>Slug</span>
            <input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} placeholder="about" />
          </label>
          <label className="cms-editor-field">
            <span>Content Type</span>
            <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value)}>
              {['home', 'about', 'content', 'legal', 'gallery', 'hero', 'seo', 'social'].map((item) => <option key={item} value={item}>{titleStatus(item)}</option>)}
            </select>
          </label>
          <label className="cms-editor-field">
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
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="cms-editor-field wide">
            <span>SEO Title</span>
            <input value={draft.seoTitle} onChange={(event) => updateDraft('seoTitle', event.target.value)} placeholder="SEO title for website page" />
          </label>
          <label className="cms-editor-field wide">
            <span>Meta Description</span>
            <textarea value={draft.metaDescription} onChange={(event) => updateDraft('metaDescription', event.target.value)} placeholder="Short search description" />
          </label>
          <label className="cms-editor-field wide">
            <span>English Content Editor</span>
            <textarea className="cms-text-editor" value={draft.contentEnglish} onChange={(event) => updateDraft('contentEnglish', event.target.value)} placeholder="Write complete English website content here..." />
          </label>
          <label className="cms-editor-field wide">
            <span>Urdu Content Editor</span>
            <textarea className="cms-text-editor urdu-editor" dir="rtl" lang="ur" value={draft.contentUrdu} onChange={(event) => updateDraft('contentUrdu', event.target.value)} placeholder="یہاں مکمل اردو مواد لکھیں..." />
          </label>
        </div>

        <footer className="cms-editor-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" disabled={saving} onClick={() => void saveCmsPage('draft')}>{saving ? 'Saving...' : 'Save Draft'}</button>
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
    'Membership Cards': ['Preview Card', 'Download Card', 'Regenerate Card', 'Activate Template', 'Version History'],
    'Designation Applications': ['Approve', 'Reject', 'Request Changes', 'Change Area', 'Change Designation', 'Generate Card', 'Generate Appointment Letter'],
    'Active Designations': ['Change Area', 'Change Designation', 'Generate Appointment Letter', 'Suspend', 'Revoke', 'Renew'],
    'Designation Renewals': ['Approve Renewal', 'Reject', 'Mark Paid', 'Export CSV'],
    'Designation Master List': ['Add Designation', 'Edit Fee', 'Deactivate', 'Export CSV'],
    'Geographic Areas': ['Add Area', 'Edit Hierarchy', 'Deactivate Area', 'Office Bearers', 'International Region'],
    'Complaint Management': ['Assign Officer', 'Change Priority', 'Change Status', 'Internal Note', 'Public Update', 'Escalate', 'Resolve', 'Close Case', 'Reopen'],
    'Payments & Finance': ['View Callback', 'Verify Manually', 'Mark Offline Payment', 'Generate Receipt', 'Refund', 'Export CSV', 'Export PDF'],
    'Wireless Devices': ['Register Device', 'Assign Device', 'Mark Lost / Stolen', 'Import CSV', 'Verification Logs'],
    'Welfare & Donations': ['Create Campaign', 'Publish Cause', 'Review Donations', 'Donor Export', 'Cause Analytics'],
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
    'Membership Applications': ['Record No', 'Name', 'CNIC', 'Type', 'Country', 'District', 'Payment Status', 'Status', 'Updated'],
    'Membership Cards': ['Record No', 'Membership No', 'Name', 'Template Version', 'QR Code', 'Status', 'Updated'],
    'Designation Applications': ['Record No', 'Name', 'CNIC', 'Designation', 'Wing', 'Province', 'District', 'Area', 'Payment Status', 'Status', 'Validity'],
    'Active Designations': ['Name', 'Membership No', 'Designation', 'Wing', 'Province', 'District', 'Area', 'Issue Date', 'Expiry Date', 'Status'],
    'Designation Renewals': ['Record No', 'Name', 'Designation', 'District', 'Payment Status', 'Status', 'Updated'],
    'Designation Master List': ['Designation', 'Wing', 'Base Amount', 'Service Fee', 'Validity', 'Status'],
    'Geographic Areas': ['Area ID', 'Country', 'Province', 'Division', 'District', 'Tehsil', 'Union Council', 'Status'],
    'Complaint Management': ['Complaint No', 'Name', 'CNIC', 'Category', 'Priority', 'Subject', 'Status', 'Officer', 'Submitted Date', 'Last Update'],
    'Payments & Finance': ['Order ID', 'Transaction ID', 'User', 'Payment Type', 'Base Amount', 'Service Fee', 'Total Amount', 'Gateway', 'Status', 'Paid Date', 'Refund Status'],
    'Wireless Devices': ['IMEI', 'Brand', 'Model', 'Serial No', 'Assigned Person', 'Department', 'Registration No', 'Status', 'Expiry Date'],
    'Welfare & Donations': ['Record No', 'Cause', 'Target Amount', 'Raised Amount', 'Start Date', 'End Date', 'Cover', 'Publish Status', 'Status'],
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
    Type: record.membershipType ?? record.templateType ?? record.type ?? resource,
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
    Priority: record.priority,
    Subject: record.subject,
    Officer: record.assignedOfficer,
    SLA: record.slaDueAt,
    'Submitted Date': record.submittedDate,
    'Last Update': record.updatedAt,
    'Order ID': record.orderId,
    'Transaction ID': record.gatewayTransactionId,
    User: record.user,
    'Payment Type': record.paymentType,
    'Base Amount': formatCurrency(record.baseAmount),
    'Service Fee': formatCurrency(record.serviceFee),
    'Total Amount': formatCurrency(record.totalAmount),
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
    Description: record.label ?? record.description,
    'Current Value': formatSettingValue(record.value ?? record.permissions),
    Scope: record.group ?? record.role ?? resource,
    'Last Updated': record.updatedAt,
    'Updated By': record.updatedBy ?? 'System',
    Actions: '',
  }

  return titleStatus(valueMap[column])
}

function RecordDrawer({ title, resource, record, apiState, onClose }: { title: string; resource: string; record: DpoRecord; apiState: ApiState; onClose: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => editableDraft(record))
  const [editing, setEditing] = useState(false)
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
        <div className="drawer-actions">
          {actionButtons.map((action) => (
            <button type="button" key={action.label} onClick={() => void apiState.runAction(resource, record.id, action.action)}>
              {action.label}
            </button>
          ))}
        </div>
        {editing ? (
          <div className="drawer-form">
            {Object.entries(draft).map(([key, value]) => (
              <label key={key}>
                <span>{titleStatus(key)}</span>
                <DraftField resource={resource} fieldKey={key} value={value} onChange={(nextValue) => setDraft((current) => ({ ...current, [key]: nextValue }))} />
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
              <DraftField resource={resource} fieldKey={key} value={value} onChange={(nextValue) => setDraft((current) => ({ ...current, [key]: nextValue }))} />
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

function DraftField({ resource, fieldKey, value, onChange }: { resource: string; fieldKey: string; value: string; onChange: (value: string) => void }) {
  const options = selectOptions(resource, fieldKey)
  if (options.length) {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select {titleStatus(fieldKey).toLowerCase()}</option>
        {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    )
  }
  return <input value={value} placeholder={fieldPlaceholder(resource, fieldKey)} onChange={(event) => onChange(event.target.value)} />
}

function editableDraft(record: DpoRecord) {
  const keys = Object.keys(record).filter((key) => !['id', 'createdAt', 'updatedAt'].includes(key)).slice(0, 12)
  return Object.fromEntries(keys.map((key) => [key, formatSettingValue(record[key])]))
}

function defaultDraft(resource: string): Record<string, string> {
  const suffix = Date.now().toString().slice(-5)
  const fields: Record<string, string[]> = {
    members: ['membershipNumber', 'name', 'email', 'phone', 'cnicMasked', 'district', 'country', 'membershipType', 'paymentStatus', 'status'],
    complaints: ['complaintNumber', 'name', 'cnicMasked', 'category', 'priority', 'subject', 'status'],
    payments: ['orderId', 'gatewayTransactionId', 'user', 'paymentType', 'baseAmount', 'serviceFee', 'totalAmount', 'gateway', 'status'],
    'wireless-devices': ['imei', 'brand', 'model', 'serialNumber', 'assignedPerson', 'department', 'status'],
    settings: ['key', 'label', 'group', 'value', 'status'],
  }

  const draft = Object.fromEntries((fields[resource] ?? ['name', 'title', 'status']).map((field) => [field, '']))
  if (resource === 'members') {
    draft.membershipNumber = `DPO-${new Date().getFullYear()}-${suffix}`
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
    baseAmount: '1800',
    serviceFee: '200',
    imei: '356000000000000',
    status: resource === 'payments' ? 'pending / paid / failed' : 'active / pending / suspended',
  }
  return placeholders[key] ?? `Enter ${titleStatus(key).toLowerCase()}`
}

function selectOptions(resource: string, key: string) {
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
    membershipType: [
      { label: 'Regular', value: 'Regular' },
      { label: 'General Member', value: 'General Member' },
      { label: 'Volunteer Member', value: 'Volunteer Member' },
      { label: 'Student', value: 'Student' },
      { label: 'Family', value: 'Family' },
      { label: 'International', value: 'International' },
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
  }
  if (resource === 'payments' && key === 'status') return shared.paymentStatus
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
    return [{ label: 'Resolve', action: 'resolve' }, { label: 'Close', action: 'close' }]
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

function getHeroSlides(page?: DpoRecord) {
  const content = page?.content
  if (typeof content === 'object' && content !== null && 'heroSlides' in content) {
    const slides = (content as { heroSlides?: unknown }).heroSlides
    if (Array.isArray(slides)) return slides.map((slide) => toText(slide)).filter(Boolean)
  }
  return ['/dpo-assets/front-1.png', '/dpo-assets/front-2.png', '/dpo-assets/front-3.png', '/dpo-assets/front-4.png']
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

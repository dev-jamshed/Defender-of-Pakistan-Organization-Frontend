import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  CreditCard,
  FileText,
  GalleryHorizontalEnd,
  HeartHandshake,
  LayoutDashboard,
  MapPinned,
  Moon,
  PanelLeftClose,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import './App.css'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, active: true },
  { name: 'Members', icon: UsersRound },
  { name: 'Applications', icon: FileText },
  { name: 'Designations', icon: ShieldCheck },
  { name: 'Complaints', icon: CircleHelp },
  { name: 'Payments', icon: Banknote },
  { name: 'Wireless Devices', icon: RadioTower },
  { name: 'Welfare', icon: HeartHandshake },
  { name: 'Gallery', icon: GalleryHorizontalEnd },
  { name: 'Areas', icon: MapPinned },
  { name: 'Reports', icon: BadgeCheck },
  { name: 'Settings', icon: Settings },
]

const applicationStats: [string, string, LucideIcon, string][] = [
  ['Membership Applications', '1,247', FileText, 'primary'],
  ['Approved', '3,987', CircleCheck, 'success'],
  ['Under Review', '2,143', CalendarDays, 'warning'],
  ['Rejected', '776', CircleX, 'danger'],
]

const actions: [string, string, LucideIcon][] = [
  ['27 urgent complaints need assignment', '12 min ago', CircleHelp],
  ['48 designations pending approval', '18 min ago', ShieldCheck],
  ['312 cards ready for generation', '31 min ago', CreditCard],
  ['19 failed payments require review', '45 min ago', Banknote],
  ['86 wireless renewals expiring', '1 hr ago', RadioTower],
]

const members = [
  ['DPO-2025-1001', 'Ali Raza', '61101-*****-1', 'Lahore', 'Paid', 'Approved', 'Active'],
  ['DPO-2025-1002', 'Muhammad Usman', '42101-*****-3', 'Dubai', 'Paid', 'Under Review', 'Pending'],
  ['DPO-2025-1003', 'Sanah Khan', '37405-*****-8', 'Peshawar', 'Pending', 'Request Info', 'Under Review'],
  ['DPO-2025-1004', 'Hassan Ahmed', '35202-*****-2', 'Multan', 'Failed', 'Rejected', 'Inactive'],
]

const complaints = [
  ['CMP-2025-0718', 'CNIC verification issue', 'Membership', 'High', 'Open'],
  ['CMP-2025-0717', 'Payment marked pending', 'Payments', 'Medium', 'In Progress'],
  ['CMP-2025-0716', 'Card not received', 'Card Issue', 'Medium', 'Open'],
]

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [period, setPeriod] = useState('Current Month')
  const [areaFilter, setAreaFilter] = useState('All Provinces')

  return (
    <div className="logicsols-app">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <main className="layout-main">
        <Navbar activeNav={activeNav} />
        {activeNav === 'Dashboard' ? (
          <Dashboard period={period} setPeriod={setPeriod} areaFilter={areaFilter} setAreaFilter={setAreaFilter} />
        ) : (
          <ModuleScreen moduleName={activeNav} />
        )}
      </main>
    </div>
  )
}

function Sidebar({ activeNav, setActiveNav }: { activeNav: string; setActiveNav: (value: string) => void }) {
  return (
    <aside className="supplier-sidebar">
      <div className="sidebar-logo">
        <div className="dpo-logo">
          <ShieldCheck size={25} />
          <span>DPO</span>
        </div>
        <div className="logo-text">
          <strong>Defender of Pakistan Organization</strong>
          <small>Admin Panel</small>
        </div>
      </div>

      <div className="sidebar-scroll">
        <ul className="nav-list">
          {navItems.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button className={activeNav === name ? 'active' : ''} type="button" onClick={() => setActiveNav(name)}>
                <Icon className="nav-icon" />
                <span>{name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-progress-card">
          <TopPlaneProgress />
          <div className="progress-content">
            <div>
              <p>
                You have processed over <b>15000+</b> memberships and service requests this quarter.
              </p>
              <StepProgress />
            </div>
            <span className="progress-arrow"><ArrowUpRight size={24} /></span>
          </div>
        </div>

        <div className="sidebar-footer">
          <a href="#help">
            <CircleHelp size={22} />
            <p>Help & Support</p>
          </a>
        </div>
      </div>
    </aside>
  )
}

function Navbar({ activeNav }: { activeNav: string }) {
  return (
    <header className="supplier-navbar">
      <div className="navbar-left">
        <button className="outline-icon" type="button" aria-label="Sidebar toggle">
          <PanelLeftClose size={21} />
        </button>
        <p>{activeNav}</p>
      </div>

      <label className="navbar-search">
        <Search size={17} />
        <span>Search members, CNIC, complaints, payments...</span>
      </label>

      <div className="navbar-actions">
        <button className="ai-button" type="button"><Sparkles size={16} /> Use AI</button>
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

function Dashboard({ period, setPeriod, areaFilter, setAreaFilter }: { period: string; setPeriod: (value: string) => void; areaFilter: string; setAreaFilter: (value: string) => void }) {
  return (
    <div className="dashboard-wrap">
      <div className="dashboard-grid">
        <div className="col-12">
          <OverviewHeader period={period} setPeriod={setPeriod} areaFilter={areaFilter} setAreaFilter={setAreaFilter} />
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-6"><MapCard areaFilter={areaFilter} /></div>
            <div className="col-3"><IncomingApplications /></div>
            <div className="col-3"><ActionItems /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-7"><FinancialInsights /></div>
            <div className="col-5"><TopDistricts /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-8"><MembersManagement /></div>
            <div className="col-4"><MemberDetail /></div>
          </div>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-7"><ComplaintManagement /></div>
            <div className="col-5"><CmsAndCards /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewHeader({ period, setPeriod, areaFilter, setAreaFilter }: { period: string; setPeriod: (value: string) => void; areaFilter: string; setAreaFilter: (value: string) => void }) {
  const periods = ['Current Month', 'Last Month', 'Last Quarter']
  const areas = ['All Provinces', 'Punjab', 'Sindh', 'KPK', 'Balochistan']

  return (
    <div className="overview-header">
      <h2>Overview</h2>
      <div className="overview-controls">
        <div className="filter-tabs">
          {periods.map((label) => (
            <button className={period === label ? 'active' : ''} type="button" key={label} onClick={() => setPeriod(label)}>{label}</button>
          ))}
          <button className="date-btn" type="button">Date - End Date <CalendarDays size={16} /></button>
        </div>
        <select className="area-select" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} aria-label="Province filter">
          {areas.map((area) => <option key={area}>{area}</option>)}
        </select>
        <button className="use-ai" type="button"><Sparkles size={16} /> Use AI</button>
      </div>
      <p className="filter-result">Showing dashboard data for <b>{period}</b> in <b>{areaFilter}</b>.</p>
    </div>
  )
}

function MapCard({ areaFilter }: { areaFilter: string }) {
  const regions = [
    ['Punjab', '58,420', '41%', '84%', '1,032 designations', '312 complaints'],
    ['Sindh', '31,260', '26%', '72%', '684 designations', '184 complaints'],
    ['KPK', '18,640', '18%', '61%', '298 designations', '76 complaints'],
    ['Balochistan', '9,840', '9%', '44%', '129 designations', '40 complaints'],
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
        <SummaryStat label="Total Members" value="125,482" />
        <SummaryStat label="Active Designations" value="2,143" />
        <SummaryStat label="Wireless Devices" value="1,032" />
      </div>
    </section>
  )
}

function IncomingApplications() {
  return (
    <section className="logicsols-card incoming-card">
      <div className="section-title">
        <h3>Incoming Applications</h3>
        <div><strong>1,247</strong><Tag tone="success">+3 since last week</Tag></div>
      </div>
      <div className="status-list">
        {applicationStats.map(([label, count, Icon, tone]) => (
          <div className="status-row" key={label}>
            <div><Icon className={`status-icon ${tone}`} size={21} /><h4>{label}</h4></div>
            <p>{count}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionItems() {
  return (
    <section className="logicsols-card action-card">
      <h3>Action Required</h3>
      <div className="action-list">
        {actions.map(([title, time, Icon]) => (
          <button type="button" key={title}>
            <Icon size={24} />
            <span><b>{title}</b><small>{time}</small></span>
            <ChevronRight className="action-chevron" size={14} />
          </button>
        ))}
      </div>
    </section>
  )
}

function FinancialInsights() {
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
      <h3>PKR 28.7M <Tag tone="success">+ PKR 4.1M since last month</Tag></h3>
      <div className="financial-body">
        <div className="bar-chart">
          {[
            [78, 55, 34],
            [52, 38, 24],
            [86, 62, 42],
            [64, 48, 31],
            [92, 70, 45],
          ].map(([revenue, fee, donation], index) => (
            <div className="bar-week" key={index}>
              <span className="expected" style={{ height: `${revenue}%` }} />
              <span className="actual" style={{ height: `${fee}%` }} />
              <span className="donation" style={{ height: `${donation}%` }} />
              <small>Week {index + 1}</small>
            </div>
          ))}
        </div>
        <div className="finance-side">
          <SummaryStat label="Today Collection" value="PKR 1.24M" />
          <SummaryStat label="Monthly Revenue" value="PKR 28.7M" />
          <SummaryStat label="Service Fee" value="PKR 4.31M" />
        </div>
      </div>
    </section>
  )
}

function TopDistricts() {
  return (
    <section className="logicsols-card district-card">
      <h2>Top Districts</h2>
      {[
        ['Lahore', '32,480', '78%'],
        ['Karachi', '28,310', '72%'],
        ['Islamabad', '16,904', '63%'],
        ['Peshawar', '13,872', '58%'],
        ['Quetta', '8,945', '45%'],
      ].map(([name, count, pct]) => (
        <div className="district-row" key={name}>
          <span><b>{name}</b><small>{count} members</small></span>
          <div className="district-progress"><i style={{ width: pct }} /></div>
          <em>{pct}</em>
        </div>
      ))}
    </section>
  )
}

function MembersManagement() {
  const [activeFilter, setActiveFilter] = useState('All')
  const filters = ['All', 'Active', 'Pending', 'Under Review', 'Failed']
  const filteredMembers = activeFilter === 'All'
    ? members
    : members.filter((row) => row.includes(activeFilter) || (activeFilter === 'Failed' && row.includes('Failed')))

  return (
    <section className="logicsols-card table-card">
      <div className="table-title">
        <h2>Members Management</h2>
        <button type="button">+ Add Member</button>
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
              <tr key={row[0]}>
                {row.slice(0, 4).map((cell) => <td key={cell}>{cell}</td>)}
                <td><Status>{row[4]}</Status></td>
                <td><Status>{row[5]}</Status></td>
                <td><Status>{row[6]}</Status></td>
                <td><button className="row-btn" type="button">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MemberDetail() {
  return (
    <section className="logicsols-card member-card">
      <h2>Member Detail</h2>
      <div className="member-profile">
        <div className="member-avatar">AR</div>
        <div>
          <h3>Ali Raza <Status>Active</Status></h3>
          <p>DPO-2025-1001</p>
          <small>61101-*****-1</small>
        </div>
      </div>
      <div className="member-actions">
        {['Approve', 'Reject', 'Suspend', 'Renew', 'Generate Card'].map((action) => <button type="button" key={action}>{action}</button>)}
      </div>
      <div className="member-tabs">
        {['Personal Information', 'CNIC Documents', 'Payment History', 'Card Versions', 'Audit History'].map((tab, index) => <button className={index === 0 ? 'active' : ''} type="button" key={tab}>{tab}</button>)}
      </div>
      <div className="info-grid">
        <SummaryStat label="Issue Date" value="12 May 2025" />
        <SummaryStat label="Expiry Date" value="11 May 2026" />
      </div>
    </section>
  )
}

function ComplaintManagement() {
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
              {complaints.map((row) => (
                <tr key={row[0]}>
                  <td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td><Status>{row[3]}</Status></td><td><Status>{row[4]}</Status></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="complaint-detail">
          <span>Selected Complaint Workflow</span>
          <h3>CMP-2025-0718</h3>
          <p>Use this panel to review complainant details, attachments, timeline, public response and internal notes.</p>
          <strong>SLA 02:15:34</strong>
          <div>{['Assign', 'Priority', 'Public Update', 'Resolve'].map((x) => <button type="button" key={x}>{x}</button>)}</div>
        </aside>
      </div>
    </section>
  )
}

function CmsAndCards() {
  return (
    <section className="logicsols-card cms-card">
      <h2>Website CMS & Card Template</h2>
      <p className="section-help">Manage public website content and active membership card template from one admin workspace.</p>
      <div className="cms-buttons">
        {['Logo', 'Hero Slides', 'Mission', 'Policies', 'SEO', 'Urdu Editor'].map((x, i) => <button className={i === 1 ? 'active' : ''} type="button" key={x}>{x}</button>)}
      </div>
      <div className="cms-workflow">
        <span><b>CMS Status</b> 3 draft pages</span>
        <span><b>Active Template</b> Membership v2.1</span>
      </div>
      <div className="id-card">
        <span>DPO Membership Card</span>
        <b>Ali Raza</b>
        <small>DPO-2025-1001</small>
        <i>QR</i>
      </div>
      <button className="activate-template" type="button">Activate Template</button>
    </section>
  )
}

function ModuleScreen({ moduleName }: { moduleName: string }) {
  const [status, setStatus] = useState('All')
  const { columns, rows } = getModuleTable(moduleName, status)

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-grid">
        <div className="col-12">
          <section className="module-hero logicsols-card">
            <div>
              <h1>{moduleName}</h1>
              <p>{getModuleDescription(moduleName)}</p>
            </div>
            <button className="use-ai" type="button"><Sparkles size={16} /> Smart Review</button>
          </section>
        </div>

        <div className="col-12">
          <div className="inner-grid">
            <div className="col-8">
              <section className="logicsols-card table-card">
                <div className="table-title">
                  <h2>{moduleName} Records</h2>
                  <button type="button">+ Add New</button>
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
                        <tr key={row[0]}>
                          {row.map((cell, index) => (
                            <td key={`${row[0]}-${columns[index]}`}>
                              {isStatusCell(columns[index]) ? <Status>{cell}</Status> : cell}
                            </td>
                          ))}
                          <td><button className="row-btn" type="button">Open</button></td>
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
                  <button type="button" key={tool}>
                    <span>{tool}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getModuleDescription(moduleName: string) {
  const descriptions: Record<string, string> = {
    Applications: 'Review membership applications, request information, approve, reject and generate membership records.',
    Designations: 'Manage designation applications, active holders, area assignment, renewals and duplicate-area rules.',
    Complaints: 'Assign complaints, track SLA, add internal notes, send public updates and resolve cases.',
    Payments: 'Verify transactions, manage refunds, offline payments, receipts and gateway callbacks.',
    'Wireless Devices': 'Register IMEI records, assign devices, renew, block and review verification logs.',
    Welfare: 'Manage causes, campaigns, donation records, donor list and cause-wise analytics.',
    Gallery: 'Manage albums, images, ordering, publish status and bilingual titles.',
    Areas: 'Manage country, province, division, district, tehsil, union council and international areas.',
    Reports: 'Generate member, designation, payment, complaint, wireless, donation and admin activity reports.',
    Settings: 'Configure fees, validity, service fee, reminders, upload sizes, credentials and maintenance mode.',
  }

  return descriptions[moduleName] ?? 'Manage DPO administration records, approvals, workflow actions and audit history.'
}

function getModuleTools(moduleName: string) {
  const tools: Record<string, string[]> = {
    Members: ['Approve Member', 'Renew Membership', 'Regenerate Card', 'Send SMS / Email', 'View History'],
    Applications: ['Approve', 'Reject', 'Request Information', 'View Documents', 'Generate Card'],
    Designations: ['Change Area', 'Change Designation', 'Generate Appointment Letter', 'Suspend', 'Renew'],
    Complaints: ['Assign Officer', 'Change Priority', 'Public Update', 'Internal Note', 'Close Case'],
    Payments: ['Verify Manually', 'Mark Offline Payment', 'Generate Receipt', 'Refund', 'Export CSV'],
    'Wireless Devices': ['Register Device', 'Assign Device', 'Mark Lost / Stolen', 'Import CSV', 'Verification Logs'],
    Welfare: ['Create Campaign', 'Publish Cause', 'Review Donations', 'Donor Export', 'Cause Analytics'],
    Gallery: ['Upload Images', 'Set Cover', 'Reorder Images', 'Publish Album', 'Archive'],
    Areas: ['Add Area', 'Edit Hierarchy', 'Deactivate Area', 'Office Bearers', 'International Region'],
    Reports: ['Export CSV', 'Export Excel', 'Export PDF', 'Print', 'Schedule Report'],
    Settings: ['Fees', 'Payment Gateway', 'SMS SMTP', 'Formats', 'Maintenance Mode'],
  }

  return tools[moduleName] ?? ['View', 'Create', 'Edit', 'Export', 'Audit History']
}

function isStatusCell(column: string) {
  return ['Status', 'Payment Status', 'Application Status', 'Publish Status', 'Refund Status'].includes(column)
}

function getModuleTable(moduleName: string, status: string) {
  const tables: Record<string, { columns: string[]; rows: string[][] }> = {
    Members: {
      columns: ['Membership No', 'Name', 'CNIC', 'Phone', 'District', 'Payment Status', 'Application Status', 'Status', 'Expiry Date'],
      rows: [
        ['DPO-2025-1001', 'Ali Raza', '61101-*****-1', '0300-1234567', 'Lahore', 'Paid', 'Approved', 'Active', '11 May 2026'],
        ['DPO-2025-1002', 'Muhammad Usman', '42101-*****-3', '0311-9876543', 'Dubai', 'Paid', 'Under Review', 'Pending', '18 May 2026'],
        ['DPO-2025-1003', 'Sanah Khan', '37405-*****-8', '0345-2221908', 'Peshawar', 'Pending', 'Request Info', 'Under Review', '22 May 2026'],
        ['DPO-2025-1004', 'Hassan Ahmed', '35202-*****-2', '0320-7883104', 'Multan', 'Failed', 'Rejected', 'Failed', 'Expired'],
      ],
    },
    Applications: {
      columns: ['Application No', 'Applicant', 'CNIC', 'Type', 'District', 'Payment Status', 'Application Status', 'Submitted'],
      rows: [
        ['APP-2025-801', 'Ali Raza', '61101-*****-1', 'Regular', 'Lahore', 'Paid', 'Pending', '12 May 2025'],
        ['APP-2025-802', 'Sanah Khan', '37405-*****-8', 'International', 'Peshawar', 'Pending', 'Under Review', '11 May 2025'],
        ['APP-2025-803', 'Fahad Noor', '42101-*****-0', 'Renewal', 'Karachi', 'Paid', 'Approved', '10 May 2025'],
      ],
    },
    Designations: {
      columns: ['Application No', 'Applicant', 'Designation', 'Wing', 'Area', 'Payment Status', 'Status', 'Validity'],
      rows: [
        ['DSG-2025-221', 'Ali Raza', 'District Coordinator', 'Membership', 'Lahore', 'Paid', 'Active', '1 Year'],
        ['DSG-2025-222', 'Hassan Ahmed', 'Tehsil Officer', 'Welfare', 'Multan', 'Pending', 'Under Review', '1 Year'],
        ['DSG-2025-223', 'Farah Mehmood', 'City Lead', 'Gallery', 'Karachi', 'Paid', 'Pending', '6 Months'],
      ],
    },
    Complaints: {
      columns: ['Complaint No', 'Name', 'CNIC', 'Category', 'Priority', 'Status', 'Officer', 'SLA'],
      rows: [
        ['CMP-2025-0718', 'Ali Raza', '61101-*****-1', 'Verification', 'High', 'Pending', 'A. Shahid', '02:15:34'],
        ['CMP-2025-0717', 'Sanah Khan', '37405-*****-8', 'Payment', 'Medium', 'Under Review', 'M. Imran', '11:42:21'],
        ['CMP-2025-0716', 'Fahad Noor', '42101-*****-0', 'Card Issue', 'Low', 'Active', 'S. Tariq', 'Closed'],
      ],
    },
    Payments: {
      columns: ['Order ID', 'Transaction ID', 'User', 'Payment Type', 'Base Amount', 'Service Fee', 'Total Amount', 'Gateway', 'Status', 'Refund Status'],
      rows: [
        ['ORD-240516-1001', 'TXN-814290', 'Ali Raza', 'Membership Fee', 'PKR 1,700', 'PKR 300', 'PKR 2,000', 'JazzCash', 'Active', '-'],
        ['ORD-240516-1002', 'TXN-814291', 'Sanah Khan', 'Card Renewal', 'PKR 850', 'PKR 150', 'PKR 1,000', 'EasyPaisa', 'Pending', '-'],
        ['ORD-240516-1003', 'TXN-814292', 'Hassan Ahmed', 'Designation Fee', 'PKR 4,250', 'PKR 750', 'PKR 5,000', 'Bank', 'Failed', 'Requested'],
      ],
    },
    'Wireless Devices': {
      columns: ['IMEI', 'Brand', 'Model', 'Serial No', 'Assigned Person', 'Department', 'Registration No', 'Status', 'Expiry Date'],
      rows: [
        ['352099001761481', 'Samsung', 'A54', 'SN-88421', 'Ali Raza', 'Verification', 'WD-1001', 'Active', '11 May 2026'],
        ['352099001761482', 'Infinix', 'Note 30', 'SN-88422', 'Sanah Khan', 'Welfare', 'WD-1002', 'Pending', '18 May 2026'],
        ['352099001761483', 'Oppo', 'Reno', 'SN-88423', 'Hassan Ahmed', 'Field', 'WD-1003', 'Failed', 'Expired'],
      ],
    },
    Welfare: {
      columns: ['Campaign ID', 'Cause', 'Target Amount', 'Raised Amount', 'Start Date', 'End Date', 'Publish Status', 'Status'],
      rows: [
        ['WEL-101', 'Blood Donation', 'PKR 500,000', 'PKR 318,000', '01 May', '31 May', 'Active', 'Active'],
        ['WEL-102', 'Medical Aid', 'PKR 900,000', 'PKR 440,000', '05 May', '20 Jun', 'Pending', 'Under Review'],
        ['WEL-103', 'Education Support', 'PKR 700,000', 'PKR 220,000', '08 May', '30 Jun', 'Active', 'Pending'],
      ],
    },
    Gallery: {
      columns: ['Album ID', 'Title English', 'Title Urdu', 'Images', 'Cover', 'Event Date', 'Publish Status', 'Status'],
      rows: [
        ['GAL-201', 'Lahore Membership Camp', 'Urdu Title', '34', 'Set', '12 May 2025', 'Active', 'Active'],
        ['GAL-202', 'Medical Aid Drive', 'Urdu Title', '18', 'Set', '10 May 2025', 'Pending', 'Under Review'],
        ['GAL-203', 'Tree Plantation', 'Urdu Title', '42', 'Missing', '08 May 2025', 'Failed', 'Pending'],
      ],
    },
    Areas: {
      columns: ['Area ID', 'Country', 'Province', 'Division', 'District', 'Tehsil', 'Union Council', 'Status'],
      rows: [
        ['AREA-001', 'Pakistan', 'Punjab', 'Lahore', 'Lahore', 'Model Town', 'UC-128', 'Active'],
        ['AREA-002', 'Pakistan', 'Sindh', 'Karachi', 'Karachi East', 'Gulshan', 'UC-44', 'Active'],
        ['AREA-003', 'UAE', 'International', 'Dubai', 'Dubai', 'Deira', 'N/A', 'Pending'],
      ],
    },
    Reports: {
      columns: ['Report ID', 'Report Name', 'Module', 'Period', 'Format', 'Generated By', 'Status', 'Last Run'],
      rows: [
        ['RPT-001', 'Member Registration Report', 'Members', 'Current Month', 'PDF', 'Super Admin', 'Active', 'Today'],
        ['RPT-002', 'Payment Collection Report', 'Finance', 'Last Month', 'Excel', 'Finance Manager', 'Pending', 'Yesterday'],
        ['RPT-003', 'Complaint Resolution Time', 'Complaints', 'Quarter', 'CSV', 'Complaint Officer', 'Under Review', '10 May'],
      ],
    },
    Settings: {
      columns: ['Setting Key', 'Description', 'Current Value', 'Scope', 'Last Updated', 'Updated By', 'Status'],
      rows: [
        ['membership_fee_pk', 'Membership fee PK', 'PKR 2,000', 'Finance', '12 May', 'Super Admin', 'Active'],
        ['service_fee', '15% service fee', 'Enabled', 'Finance', '12 May', 'Finance Manager', 'Active'],
        ['maintenance_mode', 'Maintenance mode', 'Disabled', 'System', '10 May', 'Super Admin', 'Pending'],
      ],
    },
  }

  const fallback = tables.Members
  const table = tables[moduleName] ?? fallback
  const rows = status === 'All' ? table.rows : table.rows.filter((row) => row.includes(status))
  return { columns: [...table.columns, 'Actions'], rows }
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

function TopPlaneProgress() {
  return <div className="top-plane-progress"><span /></div>
}

function StepProgress() {
  return <div className="step-progress"><span className="active" /><span /><span /></div>
}

export default App

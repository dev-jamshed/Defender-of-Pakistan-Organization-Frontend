import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Clock3, CreditCard, FileWarning, LoaderCircle, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { fileToDocument, postPublic, publicApi } from '@/lib/publicApi'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'
import { cmsImage, cmsText, cmsTitle, cmsValue, useCmsPage } from '../lib/publicCms'

type Notice = { type: 'success' | 'error'; title: string; text: string } | null
type ServiceTabValue = 'verify' | 'renewal' | 'card' | 'track-complaint' | 'complaint'

const serviceTabs: { value: ServiceTabValue; label: string; description: string; icon: ReactNode }[] = [
  { value: 'verify', label: 'Verify Member', description: 'Check official status', icon: <BadgeCheck /> },
  { value: 'renewal', label: 'Renewal', description: 'Extend membership', icon: <RefreshCw /> },
  { value: 'card', label: 'Card Replacement', description: 'Replace or correct', icon: <CreditCard /> },
  { value: 'track-complaint', label: 'Track Complaint', description: 'Follow a submitted case', icon: <Clock3 /> },
  { value: 'complaint', label: 'Complaint', description: 'Submit a new complaint', icon: <FileWarning /> },
]

export default function MemberServices() {
  const page = useCmsPage('member-services')
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab: ServiceTabValue = serviceTabs.some((tab) => tab.value === requestedTab) ? requestedTab as ServiceTabValue : 'verify'
  const changeTab = (value: string | number | null) => {
    const nextTab = String(value ?? 'verify') as ServiceTabValue
    setSearchParams(nextTab === 'verify' ? {} : { tab: nextTab }, { replace: true })
  }

  return <PublicLayout>
    <PageIntro eyebrow="Member Services" index="SERVICES" title={cmsTitle(page, 'Verification and support in one place.')} text={cmsText(page, 'Verify a member, request renewal, replace a card or submit a complaint through the connected DPO administration system.')} image={cmsImage(page, '/dpo-assets/home-hero-v2.jpg')} />
    <section className="bg-[#eeeae0] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={changeTab} className="dpo-member-services gap-0 overflow-hidden rounded-2xl border border-[#c5d2ca] bg-white shadow-[0_40px_100px_rgba(5,30,18,.15),0_8px_24px_rgba(5,30,18,.06)]">

          {/* ── Header ── */}
          <div className="relative overflow-hidden border-b border-[#d4ddd7] bg-gradient-to-r from-[#052d1d] via-[#073d27] to-[#0a5234] px-6 py-7 sm:px-10 sm:py-8">
            {/* Decorative overlay rings */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute right-32 -top-8 size-36 rounded-full bg-[#0b7148]/20 blur-2xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-sm">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Connected public services
                </span>
                <h2 className="mt-3 font-[Outfit] text-2xl font-bold tracking-tight text-white sm:text-3xl">Choose what you need today</h2>
                <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-white/55">Each request is sent directly to the DPO administration system for review and follow-up.</p>
              </div>
              {/* Shield badge */}
              <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm sm:flex">
                <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
                <div>
                  <b className="block text-[11px] font-bold text-white">Secure & Official</b>
                  <small className="text-[10px] text-white/50">Powered by DPO Admin System</small>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <div className="border-b border-[#d4ddd7] bg-[#f4f6f4]">
            <div className="scrollbar-none overflow-x-auto px-4 py-10 sm:px-6">
              <TabsList className="flex h-auto w-full min-w-max gap-2 bg-transparent p-0 sm:min-w-0">
                {serviceTabs.map((tab) => <ServiceTab {...tab} active={activeTab === tab.value} key={tab.value} />)}
              </TabsList>
            </div>
          </div>

          {/* ── Content ── */}
          <TabsContent value={activeTab} className="m-0 min-h-[480px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }} transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}>
                <ActiveServicePanel value={activeTab} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  </PublicLayout>
}

function ServiceTab({ value, icon, label, description, active }: { value: ServiceTabValue; icon: ReactNode; label: string; description: string; active: boolean }) {
  return (
    <TabsTrigger
      value={value}
      className="group/service-tab relative isolate flex min-h-[96px] flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-0 bg-white px-3 py-3 text-center text-[#59655f] shadow-[0_1px_4px_rgba(5,45,29,.08),0_0_0_1px_rgba(5,45,29,.06)] transition-all duration-200 after:hidden hover:shadow-[0_4px_12px_rgba(5,45,29,.12),0_0_0_1px_rgba(11,113,72,.15)] hover:text-[#052d1d] data-active:bg-transparent data-active:text-white data-active:shadow-none"
    >
      {active && (
        <motion.span
          layoutId="member-service-active-tab"
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-[#0a6640] via-[#0b7148] to-[#0d8055] shadow-[0_8px_24px_rgba(11,113,72,.35),0_2px_8px_rgba(11,113,72,.2),inset_0_1px_0_rgba(255,255,255,.15)]"
          transition={{ type: 'spring', stiffness: 380, damping: 32, mass: .85 }}
        />
      )}
      {/* Icon */}
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
        active
          ? 'bg-white/18 text-white ring-1 ring-white/20'
          : 'bg-[#eaf4ee] text-[#0b7148] group-hover/service-tab:bg-[#dff0e8] ring-1 ring-[#c5ddd1]'
      }`}>
        <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
      </span>
      {/* Label */}
      <span className="block min-w-0 max-w-full px-1">
        <b className={`block truncate text-[11px] font-bold leading-tight sm:text-[12px] ${active ? 'text-white' : 'text-[#1e3028]'}`}>{label}</b>
        <small className={`mt-0.5 block truncate text-[9px] font-medium leading-tight ${active ? 'text-white/65' : 'text-[#8a9690]'}`}>{description}</small>
      </span>
    </TabsTrigger>
  )
}

function ActiveServicePanel({ value }: { value: ServiceTabValue }) {
  if (value === 'renewal') return <RenewalForm />
  if (value === 'card') return <CardReplacementForm />
  if (value === 'track-complaint') return <TrackComplaintForm />
  if (value === 'complaint') return <ComplaintForm />
  return <VerifyMemberForm />
}

function VerifyMemberForm() {
  const [cnic, setCnic] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)
  const lookup = async () => {
    if (!cnic.trim()) return setNotice({ type: 'error', title: 'CNIC required', text: 'Enter your CNIC or B-Form number.' })
    setLoading(true); setNotice(null)
    try {
      const response = await publicApi<{ verified: boolean; member: Record<string, unknown> | null }>(`/public/verify/member?identifier=${encodeURIComponent(cnic)}`)
      setResult(response.member)
      setNotice(response.verified ? { type: 'success', title: 'Active member verified', text: 'The membership record is active in the DPO system.' } : { type: 'error', title: 'Verification not confirmed', text: response.member ? 'A record exists but it is not active.' : 'No matching member record was found.' })
    } catch (error) { setNotice({ type: 'error', title: 'Lookup failed', text: error instanceof Error ? error.message : 'Member could not be verified.' }) }
    finally { setLoading(false) }
  }
  return <ServicePanel icon={<BadgeCheck />} title="Verify an official DPO member" text="Enter your CNIC or B-Form number.">
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <Input value={cnic} onChange={(event) => setCnic(event.target.value)} onKeyDown={(e) => e.key === 'Enter' && void lookup()} placeholder="42101-1234567-1" className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb] focus:border-[#0b7148] focus:ring-[#0b7148]/10" />
      <Button disabled={loading} onClick={() => void lookup()} className="h-11 rounded-[6px] bg-[#052d1d] px-6 text-white shadow-[0_4px_12px_rgba(5,45,29,.2)] transition-all hover:bg-[#0c7148] hover:shadow-[0_6px_18px_rgba(5,45,29,.28)]">
        {loading ? <LoaderCircle className="animate-spin" /> : <Search className="size-4" />}
        <span className="ml-1.5">Verify</span>
      </Button>
    </div>
    <NoticeBlock notice={notice} />
    {result && (
      <div className="mt-5 overflow-hidden rounded-lg border border-[#d7ddd8]">
        <div className="border-b border-[#d7ddd8] bg-[#f3f7f4] px-4 py-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#0b7148]">Member Record</span>
        </div>
        <div className="grid gap-px bg-[#d7ddd8] sm:grid-cols-2">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="bg-white px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#7a847f]">{key.replaceAll(/([A-Z])/g, ' $1')}</span>
              <b className="mt-1 block text-sm capitalize text-[#052d1d]">{String(value ?? 'Not provided')}</b>
            </div>
          ))}
        </div>
      </div>
    )}
  </ServicePanel>
}

function RenewalForm() {
  const page = useCmsPage('member-services-renewal')
  const [membershipNumber, setMembershipNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setNotice(null)
    try {
      const lookup = await publicApi<{ eligible: boolean }>(`/public/membership/renewal/${encodeURIComponent(membershipNumber)}`)
      if (!lookup.eligible) throw new Error(cmsValue(page, 'notEligibleMessage', 'This membership is not eligible for renewal.'))
      const documents = file ? [await fileToDocument(file, 'supporting-document', cmsValue(page, 'documentName', 'Renewal Supporting Document'))] : []
      const result = await postPublic<{ renewalNumber: string }>('/public/membership/renewals', { membershipNumber, requestedExpiryDate: expiryDate || null, documents })
      setNotice({ type: 'success', title: cmsValue(page, 'successTitle', 'Renewal request submitted'), text: `${cmsValue(page, 'successPrefix', 'Reference')}: ${result.renewalNumber}. ${cmsValue(page, 'successText', 'Payment remains pending until confirmed by DPO.')}` })
    } catch (error) { setNotice({ type: 'error', title: cmsValue(page, 'errorTitle', 'Renewal could not be submitted'), text: error instanceof Error ? error.message : cmsValue(page, 'errorText', 'Please check the membership number.') }) }
    finally { setLoading(false) }
  }
  return <ServicePanel icon={<RefreshCw />} title={cmsTitle(page, 'Request membership renewal')} text={cmsText(page, 'Active or expired members can send a renewal request for admin review.')} note={cmsValue(page, 'secureNote', 'Securely recorded for authorized administrative review.')}>
    <form onSubmit={(event) => void submit(event)} className="grid gap-5 sm:grid-cols-2">
      <FormField label={cmsValue(page, 'identifierLabel', 'Membership number')}><Input required value={membershipNumber} onChange={(event) => setMembershipNumber(event.target.value)} placeholder={cmsValue(page, 'identifierPlaceholder', 'DPO-2026-1001')} className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label={cmsValue(page, 'expiryLabel', 'Requested expiry date')}><Input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label={cmsValue(page, 'documentLabel', 'Supporting document')} className="sm:col-span-2"><Input type="file" accept="image/*,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb] py-2 file:mr-3 file:rounded file:border-0 file:bg-[#eaf4f0] file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-[#0b7148]" /></FormField>
      <div className="sm:col-span-2"><Button disabled={loading} className="h-11 rounded-[6px] bg-[#052d1d] px-6 text-white shadow-[0_4px_12px_rgba(5,45,29,.2)] hover:bg-[#0c7148]">{loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw className="size-4" />}<span className="ml-1.5">{cmsValue(page, 'submitButton', 'Submit renewal')}</span></Button></div>
    </form>
    <NoticeBlock notice={notice} />
  </ServicePanel>
}

function CardReplacementForm() {
  const [cnic, setCnic] = useState('')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setNotice(null)
    try {
      const documents = file ? [await fileToDocument(file, 'supporting-document', 'Card Replacement Evidence')] : []
      const result = await postPublic<{ renewalNumber: string }>('/public/membership/card-regeneration', { identifier: cnic, reason, documents })
      setNotice({ type: 'success', title: 'Card request submitted', text: `Reference: ${result.renewalNumber}. The admin team will review the reason and any evidence.` })
    } catch (error) { setNotice({ type: 'error', title: 'Request could not be submitted', text: error instanceof Error ? error.message : 'Please check the CNIC.' }) }
    finally { setLoading(false) }
  }
  return <ServicePanel icon={<CreditCard />} title="Replace a lost or damaged card" text="Submit a replacement request linked to an existing member record.">
    <form onSubmit={(event) => void submit(event)} className="grid gap-5">
      <FormField label="CNIC or B-Form"><Input required value={cnic} onChange={(event) => setCnic(event.target.value)} placeholder="42101-1234567-1" className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label="Reason"><Textarea required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain whether the card was lost, damaged or needs correction" className="min-h-28 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label="Evidence or supporting document"><Input type="file" accept="image/*,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb] py-2 file:mr-3 file:rounded file:border-0 file:bg-[#eaf4f0] file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-[#0b7148]" /></FormField>
      <Button disabled={loading} className="h-11 w-fit rounded-[6px] bg-[#052d1d] px-6 text-white shadow-[0_4px_12px_rgba(5,45,29,.2)] hover:bg-[#0c7148]">{loading ? <LoaderCircle className="animate-spin" /> : <CreditCard className="size-4" />}<span className="ml-1.5">Submit card request</span></Button>
    </form>
    <NoticeBlock notice={notice} />
  </ServicePanel>
}

function TrackComplaintForm() {
  const [complaintNumber, setComplaintNumber] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)
  const lookup = async () => {
    if (!complaintNumber.trim()) return setNotice({ type: 'error', title: 'Complaint number required', text: 'Enter the reference number received after submission.' })
    setLoading(true); setNotice(null); setResult(null)
    try {
      const response = await publicApi<Record<string, unknown>>(`/public/complaints/${encodeURIComponent(complaintNumber.trim())}`)
      setResult(response)
      setNotice({ type: 'success', title: 'Complaint found', text: 'The latest public review status is shown below.' })
    } catch (error) { setNotice({ type: 'error', title: 'Complaint not found', text: error instanceof Error ? error.message : 'Check the reference number and try again.' }) }
    finally { setLoading(false) }
  }
  return <ServicePanel icon={<Clock3 />} title="Track a submitted complaint" text="Enter the complaint reference exactly as it appears on your submission receipt.">
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <Input value={complaintNumber} onChange={(event) => setComplaintNumber(event.target.value)} onKeyDown={(e) => e.key === 'Enter' && void lookup()} placeholder="CMP-..." className="h-11 rounded-[6px] border-[#c9d3cd] bg-[#fafcfb]" />
      <Button disabled={loading} onClick={() => void lookup()} className="h-11 rounded-[6px] bg-[#052d1d] px-6 text-white shadow-[0_4px_12px_rgba(5,45,29,.2)] hover:bg-[#0b7148]">
        {loading ? <LoaderCircle className="animate-spin" /> : <Search className="size-4" />}
        <span className="ml-1.5">Track complaint</span>
      </Button>
    </div>
    <NoticeBlock notice={notice} />
    {result && (
      <div className="mt-6 overflow-hidden rounded-lg border border-[#d5ddd8]">
        <div className="border-b border-[#d5ddd8] bg-[#f3f7f4] px-4 py-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#0b7148]">Complaint Status</span>
        </div>
        <div className="grid gap-px bg-[#d5ddd8] sm:grid-cols-2">
          {Object.entries(result).filter(([, value]) => value !== null && value !== undefined).map(([key, value]) => (
            <div className="bg-white px-4 py-3" key={key}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#748079]">{key.replaceAll(/([A-Z])/g, ' $1')}</span>
              <b className="mt-1 block text-sm capitalize text-[#052d1d]">{String(value).replaceAll('_', ' ')}</b>
            </div>
          ))}
        </div>
      </div>
    )}
  </ServicePanel>
}

function ComplaintForm() {
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setLoading(true); setNotice(null)
    try {
      const result = await postPublic<{ complaintNumber: string }>('/public/complaints', Object.fromEntries(data.entries()))
      setNotice({ type: 'success', title: 'Complaint submitted', text: `Reference: ${result.complaintNumber}. Keep this number for follow-up.` }); form.reset()
    } catch (error) { setNotice({ type: 'error', title: 'Complaint could not be submitted', text: error instanceof Error ? error.message : 'Please try again.' }) }
    finally { setLoading(false) }
  }
  return <ServicePanel icon={<FileWarning />} title="Submit a public complaint" text="Provide enough context for fair review and follow-up.">
    <form onSubmit={(event) => void submit(event)} className="grid gap-5 sm:grid-cols-2">
      <FormField label="Full name"><Input name="name" required className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label="Phone"><Input name="phone" required className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label="Category"><Input name="category" required placeholder="Membership, conduct, card or other" className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label="Subject"><Input name="subject" required className="h-11 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <FormField label="Complaint details" className="sm:col-span-2"><Textarea name="description" required className="min-h-32 rounded-[6px] border-[#c9d5cf] bg-[#fafcfb]" /></FormField>
      <div className="sm:col-span-2"><Button disabled={loading} className="h-11 rounded-[6px] bg-[#052d1d] px-6 text-white shadow-[0_4px_12px_rgba(5,45,29,.2)] hover:bg-[#0c7148]">{loading ? <LoaderCircle className="animate-spin" /> : <FileWarning className="size-4" />}<span className="ml-1.5">Submit complaint</span></Button></div>
    </form>
    <NoticeBlock notice={notice} />
  </ServicePanel>
}

function ServicePanel({ icon, title, text, note = 'Securely recorded for authorized administrative review.', children }: { icon: ReactNode; title: string; text: string; note?: string; children: ReactNode }) {
  return (
    <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12 lg:p-12 xl:gap-16">
      {/* Left info column */}
      <div className="lg:border-r lg:border-[#dbe2dd] lg:pr-10">
        <div className="grid size-12 place-items-center rounded-xl border border-[#c0d8cb] bg-gradient-to-br from-[#edf8f2] to-[#d4eee1] text-[#0c7148] shadow-[0_8px_24px_rgba(10,75,45,.1)]">
          <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#e5d5a8] bg-[#fdf8ed] px-2.5 py-1">
          <span className="size-1.5 rounded-full bg-[#b38d34]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#b38d34]">DPO public service</span>
        </div>
        <h2 className="mt-3 font-[Outfit] text-2xl font-bold leading-tight text-[#052d1d] sm:text-[27px]">{title}</h2>
        <p className="mt-3 text-xs leading-6 text-[#64706a]">{text}</p>
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-[#e0ead3] bg-[#f6fbf3] px-3.5 py-3 text-[10px] leading-5 text-[#4d6b52]">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#0c7148]" />
          <span>{note}</span>
        </div>
      </div>
      {/* Right form column */}
      <div className="min-w-0 self-start lg:py-2">{children}</div>
    </div>
  )
}

function FormField({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <Label className="text-xs font-semibold text-[#26302b]">{label}</Label>
      {children}
    </div>
  )
}

function NoticeBlock({ notice }: { notice: Notice }) {
  if (!notice) return null
  return (
    <Alert
      variant={notice.type === 'error' ? 'destructive' : 'default'}
      className={`mt-5 rounded-lg px-4 py-3 ${notice.type === 'success' ? 'border-[#c4d8cb] bg-gradient-to-br from-[#eef6f1] to-[#e6f3eb] text-[#052d1d]' : 'border-red-200 bg-red-50'}`}
    >
      <ShieldCheck className="size-4" />
      <AlertTitle className="text-sm font-semibold">{notice.title}</AlertTitle>
      <AlertDescription className="text-xs">{notice.text}</AlertDescription>
    </Alert>
  )
}

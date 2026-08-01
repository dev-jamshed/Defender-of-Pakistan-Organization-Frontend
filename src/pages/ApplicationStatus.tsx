import { CheckCircle2, Clock3, FileCheck2, LoaderCircle, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { postPublic } from '@/lib/publicApi'
import ManualPaymentBox from '../components/public/ManualPaymentBox'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro, SectionHeader } from '../components/public/PublicUi'
import { cmsImage, cmsText, cmsTitle, useCmsPage } from '../lib/publicCms'

type StatusResult = {
  applicationNumber: string
  applicationType: 'membership' | 'designation'
  applicant: string
  status: string
  paymentStatus: string
  documentStatus: string
  documents: { kind: string; label: string; name: string; status: string }[]
  submittedAt: string
  updatedAt: string
}

export default function ApplicationStatus() {
  const page = useCmsPage('application-status')
  const location = useLocation()
  const initial = (location.state ?? {}) as { cnic?: string }
  const [cnic, setCnic] = useState(initial.cnic ?? '')
  const [result, setResult] = useState<StatusResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    if (!cnic.trim()) {
      setError('Enter the CNIC used during submission.')
      return
    }
    setLoading(true)
    setError('')
    try {
      setResult(await postPublic<StatusResult>('/public/applications/status', { cnic }))
    } catch (requestError) {
      setResult(null)
      setError(requestError instanceof Error ? requestError.message : 'Application status could not be loaded')
    } finally {
      setLoading(false)
    }
  }

  return <PublicLayout>
    <PageIntro eyebrow="Application Tracking" index="STATUS" title={cmsTitle(page, 'Follow your application review.')} text={cmsText(page, 'Use your CNIC to check payment, document and administrative status.')} image={cmsImage(page, '/dpo-assets/home-hero-v2.jpg')} />
    <section className="bg-[#f3f0e8] py-14 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-6">
        <div className="h-fit border border-[#d4dcd6] bg-white p-6 shadow-[0_16px_38px_rgba(13,33,23,.07)] sm:p-8">
          <span className="text-[11px] font-bold uppercase text-[#0c7148]">Secure lookup</span>
          <h2 className="mt-3 font-[Outfit] text-2xl font-bold text-[#052d1d]">Find your application</h2>
          <p className="mt-2 text-xs leading-6 text-[#64706a]">CNIC verification prevents someone else from viewing your application progress.</p>
          <div className="mt-6 grid gap-5">
            <div className="grid gap-2"><Label htmlFor="tracking-cnic" className="text-xs font-semibold">CNIC or B-Form</Label><Input id="tracking-cnic" value={cnic} onChange={(event) => setCnic(event.target.value)} placeholder="42101-1234567-1" className="h-11 rounded-[4px]" /></div>
            <Button type="button" disabled={loading} onClick={() => void lookup()} className="h-11 rounded-[4px] bg-[#052d1d] text-white hover:bg-[#0c7148]">{loading ? <LoaderCircle className="animate-spin" /> : <Search />} Check status</Button>
          </div>
          {error && <Alert variant="destructive" className="mt-5 rounded-md border-red-200 bg-red-50 px-4 py-3"><ShieldCheck /><AlertTitle>Lookup unsuccessful</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </div>

        <div className="min-h-[420px] border border-[#d4dcd6] bg-white p-6 sm:p-9">
          {result ? <StatusDetails result={result} /> : <div className="flex min-h-[350px] flex-col items-center justify-center text-center"><span className="grid size-14 place-items-center rounded-full bg-[#edf4ef] text-[#0c7148]"><Clock3 className="size-6" /></span><h2 className="mt-5 font-[Outfit] text-2xl font-bold text-[#052d1d]">Your latest review state will appear here.</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#64706a]">Pending means the application reached DPO and is waiting for an authorized admin decision.</p></div>}
        </div>
      </div>
    </section>
  </PublicLayout>
}

function StatusDetails({ result }: { result: StatusResult }) {
  const statusIndex = ['pending', 'under_review', 'approved'].includes(result.status) ? ['pending', 'under_review', 'approved'].indexOf(result.status) : result.status === 'rejected' ? 1 : 0
  const paymentPending = result.paymentStatus?.toLowerCase() === 'pending'
  return <div><div className="flex flex-col gap-4 border-b border-[#dce2de] pb-6 sm:flex-row sm:items-start sm:justify-between"><div><span className="text-[10px] font-bold uppercase text-[#0c7148]">{result.applicationType} application</span><h2 className="mt-2 font-[Outfit] text-3xl font-bold text-[#052d1d]">{result.applicationNumber}</h2><p className="mt-1 text-sm text-[#64706a]">Submitted by {result.applicant}</p></div><span className="w-fit border border-[#c9d9cf] bg-[#edf5f0] px-3 py-1.5 text-[10px] font-bold uppercase text-[#0c7148]">{result.status.replaceAll('_', ' ')}</span></div>
    <div className="my-8 grid grid-cols-3 gap-2">{['Submitted', 'Admin review', 'Decision'].map((label, index) => <div className="relative text-center" key={label}><span className={`relative z-10 mx-auto grid size-9 place-items-center rounded-full border ${index <= statusIndex ? 'border-[#0c7148] bg-[#0c7148] text-white' : 'border-[#cbd3ce] bg-white text-[#8b9690]'}`}>{index < statusIndex ? <CheckCircle2 className="size-4" /> : index + 1}</span><b className="mt-2 block text-[10px] uppercase text-[#39423e]">{label}</b></div>)}</div>
    {result.status === 'rejected' && <Alert variant="destructive" className="mb-6 rounded-md border-red-200 bg-red-50 px-4 py-3"><ShieldCheck /><AlertTitle>Application was not approved</AlertTitle><AlertDescription>Contact DPO if you need clarification or want to provide updated information.</AlertDescription></Alert>}
    <div className="grid gap-3 sm:grid-cols-2"><StatusItem label="Payment status" value={result.paymentStatus} /><StatusItem label="Document review" value={result.documentStatus} /><StatusItem label="Submitted" value={new Date(result.submittedAt).toLocaleDateString()} /><StatusItem label="Last updated" value={new Date(result.updatedAt).toLocaleDateString()} /></div>
    {paymentPending && <div className="mt-6"><ManualPaymentBox compact reference={result.applicationNumber} /></div>}
    <div className="mt-7 border-t border-[#dce2de] pt-6"><SectionHeader eyebrow="Documents" title="Verification progress" /><div className="grid gap-2">{result.documents.map((document) => <div className="flex items-center justify-between gap-4 border border-[#dce2de] px-4 py-3" key={document.kind}><div className="flex min-w-0 items-center gap-3"><FileCheck2 className="size-4 shrink-0 text-[#0c7148]" /><div className="min-w-0"><b className="block text-xs text-[#052d1d]">{document.label}</b><span className="block truncate text-[10px] text-[#7a847f]">{document.name}</span></div></div><span className="text-[9px] font-bold uppercase text-[#0c7148]">{document.status}</span></div>)}</div></div>
  </div>
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return <div className="border border-[#dce2de] bg-[#fafaf8] p-4"><span className="text-[9px] font-bold uppercase text-[#7a847f]">{label}</span><b className="mt-1 block text-sm capitalize text-[#052d1d]">{value?.replaceAll('_', ' ') || 'Pending'}</b></div>
}

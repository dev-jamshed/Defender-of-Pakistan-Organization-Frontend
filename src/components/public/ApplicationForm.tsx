import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  Check,
  Clock3,
  Copy,
  FileCheck2,
  FileImage,
  HeartHandshake,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Star,
  Upload,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { fileToDocument, postPublic, publicApi } from '@/lib/publicApi'
import { membership } from '../../content/publicContent'

type ApplicationMode = 'membership' | 'designation'
type FormState = Record<string, string>
type FileState = Record<string, File | null>

type DesignationOption = {
  id: string
  designation: string
  amount?: number | null
  validityMonths?: number | null
}

type ApplicationReceipt = {
  applicationNumber: string
  status: string
  paymentStatus: string
  createdAt: string
}

type PaymentInstructions = {
  title: string
  accountTitle?: string | null
  bankName?: string | null
  accountNumber?: string | null
  iban?: string | null
  note?: string | null
}

const provinceOptions = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Azad Jammu and Kashmir', 'Gilgit Baltistan']

const initialForm: FormState = {
  membershipType: '',
  designation: '',
  membershipNumber: '',
  memberCnic: '',
  wing: 'General',
  name: '',
  fatherName: '',
  cnic: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  country: 'Pakistan',
  province: '',
  district: '',
  area: '',
  address: '',
  reason: '',
  experience: '',
}

const initialFiles: FileState = {
  'cnic-front': null,
  'cnic-back': null,
  'profile-photo': null,
}

export default function ApplicationForm({ mode }: { mode: ApplicationMode }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialForm)
  const [files, setFiles] = useState<FileState>(initialFiles)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [designations, setDesignations] = useState<DesignationOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(mode === 'designation')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null)

  const steps = useMemo(() => mode === 'membership'
    ? ['Membership', 'Personal details', 'Address', 'Documents']
    : ['Role', 'Personal details', 'Location', 'Documents'], [mode])

  useEffect(() => {
    if (mode !== 'designation') return
    publicApi<DesignationOption[]>('/public/designations')
      .then(setDesignations)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Designations could not be loaded'))
      .finally(() => setLoadingOptions(false))
  }, [mode])

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const validateStep = () => {
    const missing = (fields: string[]) => fields.some((field) => !form[field]?.trim())
    if (step === 0 && mode === 'membership' && !form.membershipType) return 'Choose a membership type to continue.'
    if (step === 0 && mode === 'designation' && !form.designation) return 'Choose a designation to continue.'
    if (step === 1 && missing(['name', 'fatherName', 'cnic', 'phone', 'email'])) return 'Complete all required personal details.'
    if (form.cnic && !/^\d{5}-?\d{7}-?\d$/.test(form.cnic)) return 'Enter CNIC in 42101-1234567-1 format.'
    if (step === 2 && missing(['province', 'district', 'area', 'address'])) return 'Complete the required location details.'
    if (step === 3 && Object.values(files).some((file) => !file)) return 'Upload CNIC front, CNIC back and a profile photo.'
    if (step === 3 && !termsAccepted) return 'Accept the terms and privacy policy before submitting.'
    return ''
  }

  const next = () => {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const submit = async () => {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const documents = await Promise.all([
        fileToDocument(files['cnic-front']!, 'cnic-front', 'CNIC Front'),
        fileToDocument(files['cnic-back']!, 'cnic-back', 'CNIC Back'),
        fileToDocument(files['profile-photo']!, 'profile-photo', 'Profile Photo'),
      ])
      const endpoint = mode === 'membership'
        ? '/public/membership/applications'
        : '/public/designation/applications'
      const payload = mode === 'membership'
        ? { ...form, termsAccepted, documents }
        : { ...form, applicant: form.name, termsAccepted, documents }
      const result = await postPublic<ApplicationReceipt>(endpoint, payload)
      setReceipt(result)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Application could not be submitted')
    } finally {
      setSubmitting(false)
    }
  }

  if (receipt) {
    return <ApplicationSuccess mode={mode} receipt={receipt} cnic={form.cnic} />
  }

  return (
    <div className="bg-[#f7f9f8] min-h-[800px]">
      <div className="mx-auto grid w-full max-w-[1300px] gap-6 px-4 py-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 lg:px-6 lg:py-16">
        
        {/* Sidebar */}
        <aside className="h-fit rounded-xl border border-[#e2e8e4] bg-white p-6 shadow-[0_4px_24px_rgba(13,33,23,.03)] lg:sticky lg:top-28">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c7148]">Application progress</span>
          <h2 className="mt-3 font-[Outfit] text-2xl font-bold text-[#052d1d]">{mode === 'membership' ? 'Become a DPO member' : 'Apply for a designation'}</h2>
          <p className="mt-2 text-[13px] leading-5 text-[#7a847f]">Your details remain editable until the final submission.</p>
          
          <div className="mt-8 border-t border-[#f0f3f1] pt-6">
            <ol className="space-y-2">
              {steps.map((label, index) => (
                <li className={`flex min-h-12 items-center gap-4 rounded-lg px-2 text-[14px] font-medium transition-colors ${index === step ? 'text-[#052d1d]' : index < step ? 'text-[#0c7148]' : 'text-[#8a948e]'}`} key={label}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[12px] transition-colors ${index === step ? 'bg-[#0c7148] text-white' : index < step ? 'border border-[#0c7148] text-[#0c7148]' : 'border border-[#d2dcd7] bg-[#f9fafa] text-[#8a948e]'}`}>
                    {index < step ? <Check className="size-4 stroke-[3]" /> : index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </div>
          
          <div className="mt-8 flex items-start gap-3 rounded-lg bg-[#f9fafa] p-4 text-[11px] leading-5 text-[#64706a]">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#0c7148]" />
            CNIC is masked in application records. Original files remain available only for authorized review.
          </div>
        </aside>

        {/* Main Content Card */}
        <section className="min-w-0 flex flex-col rounded-xl border border-[#e2e8e4] bg-white shadow-[0_8px_32px_rgba(13,33,23,.04)]">
          <header className="px-6 pb-4 pt-8 sm:px-10 sm:pt-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c7148]">Step {step + 1} of {steps.length}</span>
            <h2 className="mt-3 font-[Outfit] text-3xl font-bold tracking-tight text-[#052d1d] sm:text-[34px]">{stepTitle(mode, step)}</h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#64706a]">{stepDescription(mode, step)}</p>
          </header>

          <div className="flex-1 p-6 pt-2 sm:p-10 sm:pt-4">
            {error && <Alert variant="destructive" className="mb-6 rounded-lg border-red-200 bg-red-50 px-4 py-3"><ShieldCheck className="size-4" /><AlertTitle>Check the information</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            <AnimatePresence mode="wait">
              <motion.div key={`${mode}-${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (mode === 'membership'
                  ? <MembershipChoice value={form.membershipType} onChange={(value) => update('membershipType', value)} />
                  : <DesignationChoice form={form} update={update} options={designations} loading={loadingOptions} />)}
                {step === 1 && <PersonalDetails form={form} update={update} />}
                {step === 2 && <LocationDetails form={form} update={update} mode={mode} />}
                {step === 3 && <DocumentsStep files={files} setFiles={setFiles} accepted={termsAccepted} setAccepted={setTermsAccepted} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="flex flex-col-reverse gap-3 rounded-b-xl border-t border-[#f0f3f1] bg-[#fdfdfc] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <Button type="button" variant="outline" disabled={step === 0 || submitting} onClick={() => { setError(''); setStep((current) => current - 1) }} className="h-12 rounded-lg border-[#d2dcd7] px-6 text-[#39423e] hover:bg-[#f4f7f5]"><ArrowLeft className="mr-2 size-4" /> Previous</Button>
            {step < steps.length - 1
              ? <Button type="button" onClick={next} className="h-12 rounded-lg bg-[#052d1d] px-8 text-[15px] text-white hover:bg-[#0c7148]">Continue <ArrowRight className="ml-2 size-4" /></Button>
              : <Button type="button" disabled={submitting} onClick={() => void submit()} className="h-12 rounded-lg bg-[#d2ad55] px-8 text-[15px] font-bold text-[#052d1d] shadow-sm hover:bg-[#e0c476] hover:shadow-md">{submitting ? <><LoaderCircle className="mr-2 size-4 animate-spin" /> Submitting</> : <><FileCheck2 className="mr-2 size-4" /> Submit application</>}</Button>}
          </footer>
        </section>
      </div>
    </div>
  )
}

function MembershipChoice({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const icons = [<UserRound className="size-6 text-[#0c7148]" />, <HeartHandshake className="size-6 text-[#0c7148]" />, <Briefcase className="size-6 text-[#0c7148]" />, <Star className="size-6 text-[#0c7148]" />];
  return (
    <div className="grid gap-4 sm:grid-cols-2 mt-2">
      {membership.types.map((type, index) => {
        const isActive = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`group relative flex min-h-[140px] flex-col justify-between rounded-xl border p-6 text-left transition-all duration-300 ${
              isActive 
                ? 'border-2 border-[#0c7148] bg-[#f5fbf9] shadow-[0_8px_24px_rgba(12,113,72,0.12)]' 
                : 'border-[#e2e8e4] bg-white hover:border-[#0c7148]/50 hover:shadow-sm'
            }`}
          >
            {isActive && (
              <div className="absolute right-4 top-4 grid size-[22px] place-items-center rounded-full bg-[#0c7148] text-white">
                <Check className="size-3.5 stroke-[3.5]" />
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className={`grid size-14 shrink-0 place-items-center rounded-full transition-colors ${isActive ? 'bg-[#e3f2ec]' : 'bg-[#f4f7f5] group-hover:bg-[#eaf5f0]'}`}>
                 {icons[index % icons.length] || <UserRound className="size-6 text-[#0c7148]" />}
              </div>
              <div className="mt-1">
                <strong className="block font-[Outfit] text-[18px] font-bold text-[#052d1d] leading-tight">{type}</strong>
                <small className="mt-1 block text-[13px] font-medium text-[#7a847f]">Select this membership path</small>
              </div>
            </div>
            
            <span className={`mt-4 text-[12px] font-bold tracking-wider ${isActive ? 'text-[#0c7148]' : 'text-[#d2ad55]'}`}>0{index + 1}</span>
          </button>
        )
      })}
    </div>
  )
}

function DesignationChoice({ form, update, options, loading }: { form: FormState; update: (key: string, value: string) => void; options: DesignationOption[]; loading: boolean }) {
  const selected = options.find((item) => item.designation === form.designation)

  return <div className="grid gap-5 sm:grid-cols-2 mt-4"><Field label="Requested designation" required className="sm:col-span-2"><Select value={form.designation || null} onValueChange={(value) => update('designation', String(value ?? ''))} disabled={loading}><SelectTrigger className="h-12 w-full rounded-lg border-[#cbd3ce] bg-white px-3 focus:ring-[#0c7148]"><SelectValue>{form.designation || (loading ? 'Loading designations' : 'Choose a designation')}</SelectValue></SelectTrigger><SelectContent>{options.map((item) => <SelectItem value={item.designation} key={item.id}>{item.designation}</SelectItem>)}</SelectContent></Select>{selected?.amount ? <span className="text-[12px] leading-5 text-[#64706a]">Amount: PKR {Number(selected.amount).toLocaleString()}</span> : null}</Field><Field label="Your CNIC"><Input value={form.memberCnic} onChange={(event) => update('memberCnic', event.target.value)} placeholder="42101-1234567-1" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Wing"><Select value={form.wing} onValueChange={(value) => update('wing', String(value ?? 'General'))}><SelectTrigger className="h-12 w-full rounded-lg border-[#cbd3ce] focus:ring-[#0c7148]"><SelectValue>{form.wing}</SelectValue></SelectTrigger><SelectContent>{['General', 'Youth Wing', 'Women Wing', 'Welfare', 'Membership', 'Media'].map((wing) => <SelectItem value={wing} key={wing}>{wing}</SelectItem>)}</SelectContent></Select></Field><Field label="Relevant experience" className="sm:col-span-2"><Textarea value={form.experience} onChange={(event) => update('experience', event.target.value)} placeholder="Briefly describe relevant service or leadership experience" className="min-h-28 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Reason for applying" className="sm:col-span-2"><Textarea value={form.reason} onChange={(event) => update('reason', event.target.value)} placeholder="Why do you want to serve in this role?" className="min-h-28 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field></div>
}

function PersonalDetails({ form, update }: { form: FormState; update: (key: string, value: string) => void }) {
  return <div className="grid gap-5 sm:grid-cols-2 mt-4"><Field label="Full name" required><Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="As written on CNIC" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Father or guardian name" required><Input value={form.fatherName} onChange={(event) => update('fatherName', event.target.value)} placeholder="Full name" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="CNIC or B-Form" required hint="Format: 42101-1234567-1"><Input value={form.cnic} onChange={(event) => update('cnic', event.target.value)} placeholder="42101-1234567-1" inputMode="numeric" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(event) => update('dateOfBirth', event.target.value)} className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Phone or WhatsApp" required><Input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="0300 1234567" inputMode="tel" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Official email" required><Input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Gender"><Select value={form.gender || null} onValueChange={(value) => update('gender', String(value ?? ''))}><SelectTrigger className="h-12 w-full rounded-lg border-[#cbd3ce] focus:ring-[#0c7148]"><SelectValue>{form.gender || 'Select gender'}</SelectValue></SelectTrigger><SelectContent>{['Male', 'Female', 'Prefer not to say'].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent></Select></Field></div>
}

function LocationDetails({ form, update, mode }: { form: FormState; update: (key: string, value: string) => void; mode: ApplicationMode }) {
  return <div className="grid gap-5 sm:grid-cols-2 mt-4"><Field label="Country"><Input value={form.country} disabled className="h-12 rounded-lg bg-[#f4f7f5] border-[#cbd3ce] text-[#64706a]" /></Field><Field label="Province or region" required><Select value={form.province || null} onValueChange={(value) => update('province', String(value ?? ''))}><SelectTrigger className="h-12 w-full rounded-lg border-[#cbd3ce] focus:ring-[#0c7148]"><SelectValue>{form.province || 'Choose province or region'}</SelectValue></SelectTrigger><SelectContent>{provinceOptions.map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent></Select></Field><Field label="District" required><Input value={form.district} onChange={(event) => update('district', event.target.value)} placeholder="District name" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label={mode === 'designation' ? 'Requested area' : 'City or area'} required><Input value={form.area} onChange={(event) => update('area', event.target.value)} placeholder="Town, tehsil or local area" className="h-12 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field><Field label="Complete residential address" required className="sm:col-span-2"><Textarea value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="House, street, locality and postal details" className="min-h-28 rounded-lg border-[#cbd3ce] focus-visible:ring-[#0c7148]" /></Field></div>
}

function DocumentsStep({ files, setFiles, accepted, setAccepted }: { files: FileState; setFiles: React.Dispatch<React.SetStateAction<FileState>>; accepted: boolean; setAccepted: (value: boolean) => void }) {
  return <div className="mt-4"><Alert className="mb-6 rounded-lg border-[#cfe0d5] bg-[#f1f7f3] px-4 py-3 text-[#052d1d]"><ShieldCheck className="size-4" /><AlertTitle>Document privacy</AlertTitle><AlertDescription>Upload clear images. Each file can be up to 5 MB and will remain pending until an authorized admin reviews it.</AlertDescription></Alert><div className="grid gap-4 sm:grid-cols-3"><FileUpload label="CNIC front" kind="cnic-front" file={files['cnic-front']} onChange={(file) => setFiles((current) => ({ ...current, 'cnic-front': file }))} /><FileUpload label="CNIC back" kind="cnic-back" file={files['cnic-back']} onChange={(file) => setFiles((current) => ({ ...current, 'cnic-back': file }))} /><FileUpload label="Profile photo" kind="profile-photo" file={files['profile-photo']} onChange={(file) => setFiles((current) => ({ ...current, 'profile-photo': file }))} /></div><div className="mt-8 flex items-start gap-3 rounded-lg border border-[#e2e8e4] bg-[#f9fafa] p-5"><Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(Boolean(checked))} className="mt-0.5 border-[#8d9992] data-[state=checked]:border-[#0c7148] data-[state=checked]:bg-[#0c7148]" id="application-terms" /><Label htmlFor="application-terms" className="cursor-pointer text-sm leading-6 text-[#39423e]">I confirm that the information is correct and I agree to the <Link className="font-semibold text-[#0c7148] underline" to="/legal/terms-and-conditions" target="_blank">terms and conditions</Link> and <Link className="font-semibold text-[#0c7148] underline" to="/legal/data-cnic-privacy-policy" target="_blank">CNIC privacy policy</Link>.</Label></div></div>
}

function FileUpload({ label, kind, file, onChange }: { label: string; kind: string; file: File | null; onChange: (file: File | null) => void }) {
  const [localError, setLocalError] = useState('')
  const choose = (nextFile?: File) => {
    if (!nextFile) return
    const allowedTypes = kind === 'profile-photo'
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(nextFile.type)) {
      setLocalError(kind === 'profile-photo' ? 'Choose a JPG, PNG or WebP image' : 'Choose a JPG, PNG, WebP or PDF file')
      return
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setLocalError('File must be smaller than 5 MB')
      return
    }
    setLocalError('')
    onChange(nextFile)
  }
  return <label className={`group relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors ${file ? 'border-[#0c7148] bg-[#f1f7f3]' : 'border-[#cbd3ce] hover:border-[#0c7148]/60 hover:bg-[#f9fafa]'}`}><input className="sr-only" type="file" accept={kind === 'profile-photo' ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf'} onChange={(event) => choose(event.target.files?.[0])} /><span className={`grid size-12 place-items-center rounded-full transition-colors ${file ? 'bg-[#0c7148] text-white' : 'bg-[#eaf0ed] text-[#0c7148] group-hover:bg-[#e2efe9]'}`}>{file ? <FileCheck2 className="size-5" /> : kind === 'profile-photo' ? <FileImage className="size-5" /> : <Upload className="size-5" />}</span><strong className="mt-4 font-[Outfit] text-[15px] text-[#052d1d]">{label}</strong><small className="mt-1 max-w-44 break-all text-[11px] leading-4 text-[#64706a]">{file ? `${file.name} | ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG, WebP or PDF'}</small>{localError && <span className="mt-2 text-[11px] font-medium text-red-600">{localError}</span>}</label>
}

function Field({ label, required, hint, className = '', children }: { label: string; required?: boolean; hint?: string; className?: string; children: React.ReactNode }) {
  return <div className={`grid gap-2 ${className}`}><Label className="text-[13px] font-semibold text-[#26302b]">{label}{required && <span className="ml-1 text-[#a34e32]">*</span>}</Label>{children}{hint && <span className="text-[11px] text-[#7a847f]">{hint}</span>}</div>
}

function ApplicationSuccess({ mode, receipt, cnic }: { mode: ApplicationMode; receipt: ApplicationReceipt; cnic: string }) {
  const [copied, setCopied] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInstructions | null>(null)
  const paymentPending = receipt.paymentStatus?.toLowerCase() === 'pending'
  const typeLabel = mode === 'membership' ? 'Membership' : 'Designation'
  const submittedDate = receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : 'Submitted just now'
  const copyNumber = async () => {
    await navigator.clipboard?.writeText(receipt.applicationNumber)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  const reviewSteps = [
    { title: 'Application submitted', text: 'Your details and documents reached the DPO system.', complete: true },
    { title: 'Document review', text: 'An authorized admin checks the uploaded identity files.', current: true },
    { title: 'Payment confirmation', text: 'Any applicable fee is verified before a final decision.' },
    { title: 'Final decision', text: 'Track this application to see approval or follow-up requests.' },
  ]

  useEffect(() => {
    if (!paymentPending) return
    publicApi<PaymentInstructions>('/public/payment-instructions')
      .then(setPaymentInfo)
      .catch(() => setPaymentInfo(null))
  }, [paymentPending])

  return (
    <div className="bg-[#f7f9f8] min-h-screen">
      <section className="py-14 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden rounded-xl border border-[#d2dcd7] bg-white shadow-[0_24px_65px_rgba(8,40,25,.07)]">
            <header className="flex flex-col gap-5 border-b border-[#e2e8e4] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <div className="flex items-center gap-5"><span className="grid size-16 shrink-0 place-items-center rounded-xl bg-[#0b7148] text-white shadow-[0_10px_24px_rgba(11,113,72,.25)]"><BadgeCheck className="size-8" /></span><div><span className="text-[11px] font-bold uppercase tracking-wider text-[#0b7148]">Application received</span><h2 className="mt-1 font-[Outfit] text-2xl font-bold text-[#052d1d] sm:text-[32px]">Submission successful</h2></div></div>
              <div className="text-left sm:text-right"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#7b8680]">Submitted</span><b className="mt-1 block text-[13px] text-[#33413a]">{submittedDate}</b></div>
            </header>

            <div className="grid lg:grid-cols-[1.12fr_.88fr]">
              <div className="p-6 sm:p-10 lg:border-r lg:border-[#e2e8e4] lg:p-14">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#b38d34]">{typeLabel} application</span>
                <h1 className="mt-3 max-w-2xl font-[Outfit] text-3xl font-bold leading-tight text-[#052d1d] sm:text-4xl">Your application is ready for administrative review.</h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#64706a]">Save the reference below. You will need it with your CNIC to check progress.</p>

                <div className="mt-10 rounded-xl border border-[#d2dcd7] bg-[#f9fbfb] p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4"><div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-[#77817c]">Application number</span><strong className="mt-2 block break-all font-[Outfit] text-2xl font-bold text-[#052d1d] sm:text-3xl">{receipt.applicationNumber}</strong></div><button type="button" onClick={() => void copyNumber()} className="grid size-12 shrink-0 place-items-center rounded-lg border border-[#bdcbc2] bg-white text-[#0b7148] transition hover:border-[#0b7148] hover:bg-[#edf6f1] shadow-sm" aria-label="Copy application number" title="Copy application number">{copied ? <Check className="size-5" /> : <Copy className="size-5" />}</button></div>
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-[#d8ddd9] pt-5"><span className="inline-flex items-center gap-2 rounded-full bg-[#e7f4ec] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0b7148]"><Clock3 className="size-3.5" /> Status: {receipt.status}</span><span className="inline-flex items-center gap-2 rounded-full bg-[#fcf5e3] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b38d34]">Payment: {receipt.paymentStatus}</span></div>
                </div>

                {paymentPending && paymentInfo && (
                  <div className="mt-6 rounded-xl border border-[#d2dcd7] bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-lg bg-[#fcf5e3] text-[#9b7423]"><Banknote className="size-5" /></span><div><span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7423]">Manual payment</span><h2 className="font-[Outfit] text-xl font-bold text-[#052d1d]">Transfer fee to DPO account</h2></div></div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <PaymentInfoRow label="Account title" value={paymentInfo.accountTitle} />
                      <PaymentInfoRow label="Bank name" value={paymentInfo.bankName} />
                      <PaymentInfoRow label="Account number" value={paymentInfo.accountNumber} />
                      <PaymentInfoRow label="IBAN" value={paymentInfo.iban} />
                    </div>
                    {paymentInfo.note && <p className="mt-5 rounded-lg bg-[#f7f9f8] p-4 text-[13px] leading-6 text-[#64706a]">{paymentInfo.note} Use application number <b className="text-[#052d1d]">{receipt.applicationNumber}</b> as payment reference.</p>}
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link to="/application-status" state={{ cnic }} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#052d1d] px-8 text-[15px] font-bold !text-white shadow-[0_10px_22px_rgba(5,45,29,.16)] transition hover:bg-[#0b7148]">Track application <ArrowRight className="size-4" /></Link><Link to={mode === 'membership' ? '/membership' : '/designations'} className="inline-flex h-12 items-center justify-center rounded-lg border border-[#c7d1cb] bg-white px-8 text-[15px] font-semibold text-[#39423e] transition hover:border-[#0b7148] hover:text-[#0b7148]">Back to details</Link></div>
                <div className="mt-8 flex items-start gap-3 rounded-lg bg-[#f4f7f5] p-4 text-[12px] leading-6 text-[#64706a]"><ShieldCheck className="mt-1 size-5 shrink-0 text-[#0b7148]" />Your CNIC remains masked in public application records. Uploaded files are available only to authorized reviewers.</div>
              </div>

              <aside className="bg-[#fafbfc] p-6 sm:p-10 lg:p-14">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b7148]">Review journey</span><h2 className="mt-3 font-[Outfit] text-2xl font-bold text-[#052d1d]">What happens next</h2><p className="mt-3 text-[14px] leading-relaxed text-[#64706a]">Progress is updated as the administration team completes each check.</p>
                <ol className="mt-10">
                  {reviewSteps.map((step, index) => <li className="relative grid grid-cols-[44px_1fr] gap-4 pb-8 last:pb-0" key={step.title}>{index < reviewSteps.length - 1 && <span className="absolute bottom-0 left-[21px] top-11 w-px bg-[#d2dcd7]" />}<span className={`relative z-10 grid size-11 place-items-center rounded-full border text-[12px] font-bold ${step.complete ? 'border-[#0b7148] bg-[#0b7148] text-white' : step.current ? 'border-[#0b7148] bg-[#e8f4ed] text-[#0b7148]' : 'border-[#cbd4ce] bg-white text-[#7d8882]'}`}>{step.complete ? <Check className="size-5" /> : index + 1}</span><div><h3 className="font-[Outfit] text-[16px] font-bold text-[#052d1d]">{step.title}</h3><p className="mt-1 text-[13px] leading-relaxed text-[#64706a]">{step.text}</p></div></li>)}
                </ol>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function PaymentInfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return <div className="rounded-lg border border-[#e2e8e4] bg-[#fafcfb] px-4 py-3"><span className="text-[9px] font-bold uppercase tracking-wider text-[#7b8680]">{label}</span><b className="mt-1 block break-all text-sm text-[#052d1d]">{value}</b></div>
}

function stepTitle(mode: ApplicationMode, step: number) {
  const titles = mode === 'membership'
    ? ['Choose your membership', 'Tell us about yourself', 'Add your address', 'Upload verification documents']
    : ['Choose a leadership role', 'Tell us about yourself', 'Confirm the requested area', 'Upload verification documents']
  return titles[step]
}

function stepDescription(mode: ApplicationMode, step: number) {
  const descriptions = mode === 'membership'
    ? ['Select the membership path that reflects how you want to contribute.', 'Use the same information that appears on your identity document.', 'This helps DPO route your application to the right regional team.', 'Clear documents help the admin team complete verification without delays.']
    : ['Select an available designation and share your relevant experience.', 'Use accurate identity and contact information for administrative review.', 'Designation availability is checked by district and local area.', 'The admin team will verify each document before making a decision.']
  return descriptions[step]
}

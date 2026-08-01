import { Banknote, Copy, Landmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { publicApi } from '@/lib/publicApi'

type PaymentInstructions = {
  title: string
  accountTitle?: string | null
  bankName?: string | null
  accountNumber?: string | null
  iban?: string | null
  note?: string | null
}

export default function ManualPaymentBox({ reference, compact = false }: { reference?: string; compact?: boolean }) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInstructions | null>(null)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    publicApi<PaymentInstructions>('/public/payment-instructions')
      .then(setPaymentInfo)
      .catch(() => setPaymentInfo(null))
  }, [])

  const copy = async (label: string, value?: string | null) => {
    if (!value) return
    await navigator.clipboard?.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1600)
  }

  if (!paymentInfo) return null

  return (
    <section className={compact ? '' : 'bg-[#f7f9f8] py-10'}>
      <div className={compact ? 'w-full' : 'mx-auto w-full max-w-[1180px] px-4 sm:px-6'}>
        <div className="rounded-xl border border-[#d2dcd7] bg-white p-6 shadow-[0_10px_30px_rgba(8,40,25,.05)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#fcf5e3] text-[#9b7423]"><Banknote size={22} /></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7423]">Manual Payment</span>
                <h2 className="font-[Outfit] text-2xl font-bold text-[#052d1d]">Transfer the fee to this account</h2>
              </div>
            </div>
            {reference && <span className="rounded-full bg-[#e7f4ec] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0b7148]">Reference: {reference}</span>}
          </div>

          <div className="mt-6 grid gap-4">
            <PaymentCard icon={<Landmark size={18} />} title="Bank Account">
              <PaymentLine label="Account title" value={paymentInfo.accountTitle} onCopy={copy} copied={copied} />
              <PaymentLine label="Bank name" value={paymentInfo.bankName} onCopy={copy} copied={copied} />
              <PaymentLine label="Account number" value={paymentInfo.accountNumber} onCopy={copy} copied={copied} />
              <PaymentLine label="IBAN" value={paymentInfo.iban} onCopy={copy} copied={copied} />
            </PaymentCard>
          </div>

          {paymentInfo.note && <p className="mt-5 rounded-lg bg-[#f7f9f8] p-4 text-[13px] leading-6 text-[#64706a]">{paymentInfo.note}</p>}
        </div>
      </div>
    </section>
  )
}

function PaymentCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <article className="rounded-lg border border-[#e2e8e4] bg-[#fafcfb] p-5"><h3 className="mb-4 flex items-center gap-2 font-[Outfit] text-lg font-bold text-[#052d1d]">{icon}{title}</h3><div className="grid gap-3">{children}</div></article>
}

function PaymentLine({ label, value, copied, onCopy }: { label: string; value?: string | null; copied: string; onCopy: (label: string, value?: string | null) => void }) {
  if (!value) return null
  return <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2"><div className="min-w-0"><span className="text-[9px] font-bold uppercase tracking-wider text-[#7b8680]">{label}</span><b className="block break-all text-sm text-[#052d1d]">{value}</b></div><button type="button" onClick={() => onCopy(label, value)} className="grid size-9 shrink-0 place-items-center rounded-md border border-[#cbd5cf] text-[#0b7148]" title={`Copy ${label}`}><Copy size={15} /></button>{copied === label && <span className="text-[11px] font-bold text-[#0b7148]">Copied</span>}</div>
}

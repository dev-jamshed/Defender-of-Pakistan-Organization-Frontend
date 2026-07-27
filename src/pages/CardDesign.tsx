import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, CreditCard, QrCode, RotateCw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, DetailList, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { MemberCard } from './Membership'
import { cardDesign, organization } from '../content/publicContent'

export default function CardDesign() {
  const [side, setSide] = useState<'front' | 'back'>('front')
  return (
    <PublicLayout>
      <PageIntro eyebrow="Membership Identity" index="05" title="Designed for recognition and trust." text="A professional card system that balances clear public verification with responsible protection of member information." image="/dpo-assets/home-mission-v2.jpg" />

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-card-lab">
          <div className="dpo-card-lab__stage">
            <div className="dpo-segmented" role="group" aria-label="Card side"><button className={side === 'front' ? 'active' : ''} onClick={() => setSide('front')} type="button"><CreditCard size={16} /> Front</button><button className={side === 'back' ? 'active' : ''} onClick={() => setSide('back')} type="button"><QrCode size={16} /> Back</button></div>
            <AnimatePresence mode="wait">
              <motion.div key={side} initial={{ opacity: 0, rotateY: side === 'front' ? -70 : 70 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: side === 'front' ? 70 : -70 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="dpo-card-lab__preview">
                {side === 'front' ? <MemberCard /> : <MemberCardBack />}
              </motion.div>
            </AnimatePresence>
            <span className="dpo-card-lab__hint"><RotateCw size={14} /> Switch between card sides</span>
          </div>
          <div className="dpo-card-lab__copy"><SectionHeader eyebrow="Interactive Preview" title="Every element has a clear verification purpose." text="The sample uses the supplied DPO identity while keeping the final member information structured, legible and easy to verify." /><Stagger className="dpo-card-specs"><StaggerItem><article><CreditCard size={21} /><div><h3>Front side</h3><DetailList items={cardDesign.front} /></div></article></StaggerItem><StaggerItem><article><QrCode size={21} /><div><h3>Back side</h3><DetailList items={cardDesign.back} /></div></article></StaggerItem></Stagger></div>
        </div>
      </section>

      <section className="dpo-section dpo-section--white"><div className="dpo-container"><SectionHeader eyebrow="Design Principles" title="Credible, consistent and privacy-conscious." text="The visual identity should remain easy to recognize across printed cards, downloadable documents and verification screens." align="center" /><Stagger className="dpo-card-principles">{[
        ['01', BadgeCheck, 'Authentic identity', 'Approved logo, colors and typography provide immediate recognition.'],
        ['02', QrCode, 'Fast verification', 'A scannable code connects the physical card with an official record.'],
        ['03', ShieldCheck, 'Protected information', 'Only the minimum information needed for public verification is displayed.'],
      ].map(([no, Icon, title, text]) => { const IconComponent = Icon as typeof BadgeCheck; return <StaggerItem key={title as string}><article><span>{no as string}</span><IconComponent size={25} /><h3>{title as string}</h3><p>{text as string}</p></article></StaggerItem> })}</Stagger></div></section>

      <section className="dpo-card-reference"><div className="dpo-container"><Reveal><div><span className="dpo-eyebrow">Supplied assets</span><h2>Original card and designation references remain available.</h2><p>These client-provided files can guide final print dimensions and admin-generated outputs.</p></div></Reveal><Reveal className="dpo-card-reference__assets"><img src="/dpo-assets/cms/card-logo.png" alt="DPO card logo reference" /><img src="/dpo-assets/cms/designation.png" alt="DPO designation reference" /></Reveal></div></section>

      <CtaBand title="Official identity deserves careful implementation." text="The public preview is ready for later connection with approved member data and admin card generation." primaryHref="/membership" primaryLabel="Membership details" secondaryHref="/legal/data-cnic-privacy-policy" secondaryLabel="Data privacy" />
    </PublicLayout>
  )
}

function MemberCardBack() {
  return <div className="dpo-member-card dpo-member-card--back"><div className="dpo-member-card__flag" /><header><img src="/dpo-assets/logo-transparent.png" alt="" /><div><b>Defenders of Pakistan</b><span>Official member identity</span></div></header><div className="dpo-member-card__back-body"><div className="dpo-faux-qr"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div><span>Verify membership</span><b>defendersofpakistan.org/verify</b><span>Valid through</span><b>31 December 2027</b><span>Emergency contact</span><b>{organization.phone}</b></div></div><footer><span>This card remains property of DPO.</span><ShieldCheck size={20} /></footer></div>
}

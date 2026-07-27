import { ArrowRight, Camera, Clock3, Mail, MessageCircle, Phone, Play, Send, Share2, Building2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { postPublic } from '@/lib/publicApi'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'
import { contactCards, organization } from '../content/publicContent'

export default function Contact() {
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const sendInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(event.currentTarget)
    setSubmitting(true)
    setNotice(null)
    try {
      const result = await postPublic<{ complaintNumber: string }>('/public/contact', {
        name: data.get('name'),
        phone: data.get('phone'),
        email: data.get('email'),
        subject: data.get('subject'),
        message: data.get('message'),
      })
      setNotice({ type: 'success', text: `Your inquiry was received. Reference: ${result.complaintNumber}` })
      form.reset()
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Your inquiry could not be submitted.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <PageIntro eyebrow="Contact DPO" index="08" title="Start a meaningful conversation." text="Reach the organization for membership guidance, designation questions, partnerships, welfare coordination or general information." image="/dpo-assets/home-mission-v2.jpg" />

      {/* Official Contact Cards Section */}
      <section className="bg-[#eeeae0] py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 max-w-2xl text-center sm:mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c3ddd0] bg-[#eaf5f0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0b7148]">
              Official Contact
            </span>
            <h2 className="mt-4 font-[Outfit] text-3xl font-bold text-[#052d1d] sm:text-4xl">Choose the channel that works for you.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#59655f]">Use the published organization details below for official communication.</p>
          </Reveal>

          <Stagger className="grid gap-6 sm:grid-cols-3 mt-8">
            {contactCards.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_4px_24px_rgba(13,33,23,.03)] ring-1 ring-[#e2e8e4] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(12,113,72,.1)] hover:ring-[#0c7148]/30">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0c7148] to-[#129b64] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative mb-8 grid size-14 place-items-center rounded-2xl bg-[#f4f7f5] text-[#0c7148] transition-all duration-300 group-hover:bg-[#0c7148] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(12,113,72,.3)]">
                    <Icon className="size-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c7148]">{title}</span>
                    <h3 className="mt-3 font-[Outfit] text-[22px] font-bold leading-tight text-[#052d1d]">{text}</h3>
                  </div>
                  <div className="mt-8 border-t border-[#f0f3f1] pt-6">
                    {title.includes('Phone') ? (
                      <a href={`tel:${organization.phone.replace(/\s/g, '')}`} className="group/link inline-flex items-center gap-2 text-[14px] font-bold text-[#052d1d] transition-colors hover:text-[#0c7148]">
                        Call now <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1 text-[#0c7148]" />
                      </a>
                    ) : title === 'Email' ? (
                      <a href={`mailto:${organization.email}`} className="group/link inline-flex items-center gap-2 text-[14px] font-bold text-[#052d1d] transition-colors hover:text-[#0c7148]">
                        Send email <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1 text-[#0c7148]" />
                      </a>
                    ) : (
                      <span className="text-[13px] font-medium text-[#7a847f]">Visit by prior appointment</span>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            {/* Left Side: Intro */}
            <div className="flex flex-col">
              <Reveal>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c3ddd0] bg-[#eaf5f0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0b7148]">
                  Send an Inquiry
                </span>
                <h2 className="mt-4 font-[Outfit] text-3xl font-bold leading-tight text-[#052d1d] sm:text-4xl">Tell us how we can help.</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[#59655f]">Submit your message directly to the DPO administration system for review and follow-up.</p>
              </Reveal>

              <Reveal delay={0.1} className="mt-10 rounded-2xl border border-[#d4ddd7] bg-[#f4f6f4] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#0b7148] shadow-sm">
                    <Clock3 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#052d1d]">Response guidance</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#64706a]">Include your city, membership status and a clear subject so the right team can respond efficiently.</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2} className="mt-10 flex flex-col gap-4 border-t border-[#e2e8e4] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[13px] font-bold text-[#28302c]">Follow public updates</span>
                <div className="flex items-center gap-3">
                  <a href="#" aria-label="Facebook" className="grid size-10 place-items-center rounded-full border border-[#d4ddd7] text-[#0b7148] transition-colors hover:bg-[#0b7148] hover:text-white hover:border-[#0b7148]">
                    <Share2 className="size-4" />
                  </a>
                  <a href="#" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-[#d4ddd7] text-[#0b7148] transition-colors hover:bg-[#0b7148] hover:text-white hover:border-[#0b7148]">
                    <Camera className="size-4" />
                  </a>
                  <a href="#" aria-label="YouTube" className="grid size-10 place-items-center rounded-full border border-[#d4ddd7] text-[#0b7148] transition-colors hover:bg-[#0b7148] hover:text-white hover:border-[#0b7148]">
                    <Play className="size-4" />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Right Side: Form */}
            <Reveal direction="right" className="rounded-2xl border border-[#c5d2ca] bg-white p-6 shadow-[0_24px_60px_rgba(5,30,18,.08)] sm:p-10">
              <form onSubmit={(event) => void sendInquiry(event)} className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="grid gap-2 text-[12px] font-semibold text-[#26302b]">
                    Full name
                    <input name="name" required placeholder="Your full name" className="h-12 rounded-[8px] border border-[#c9d5cf] bg-[#fafcfb] px-4 text-[14px] text-[#052d1d] placeholder:text-[#8a9690] focus:border-[#0b7148] focus:outline-none focus:ring-1 focus:ring-[#0b7148]" />
                  </label>
                  <label className="grid gap-2 text-[12px] font-semibold text-[#26302b]">
                    Phone / WhatsApp
                    <input name="phone" required placeholder="03XX XXXXXXX" className="h-12 rounded-[8px] border border-[#c9d5cf] bg-[#fafcfb] px-4 text-[14px] text-[#052d1d] placeholder:text-[#8a9690] focus:border-[#0b7148] focus:outline-none focus:ring-1 focus:ring-[#0b7148]" />
                  </label>
                  <label className="grid gap-2 text-[12px] font-semibold text-[#26302b]">
                    Email address
                    <input name="email" type="email" required placeholder="name@example.com" className="h-12 rounded-[8px] border border-[#c9d5cf] bg-[#fafcfb] px-4 text-[14px] text-[#052d1d] placeholder:text-[#8a9690] focus:border-[#0b7148] focus:outline-none focus:ring-1 focus:ring-[#0b7148]" />
                  </label>
                  <label className="grid gap-2 text-[12px] font-semibold text-[#26302b]">
                    Subject
                    <select name="subject" defaultValue="" required className="h-12 rounded-[8px] border border-[#c9d5cf] bg-[#fafcfb] px-4 text-[14px] text-[#052d1d] focus:border-[#0b7148] focus:outline-none focus:ring-1 focus:ring-[#0b7148]">
                      <option value="" disabled>Select inquiry type</option>
                      <option>Membership</option>
                      <option>Designation</option>
                      <option>Partnership</option>
                      <option>Welfare support</option>
                      <option>General inquiry</option>
                    </select>
                  </label>
                </div>
                <label className="grid gap-2 text-[12px] font-semibold text-[#26302b]">
                  Message
                  <textarea name="message" required rows={5} placeholder="Write your message with the relevant details" className="rounded-[8px] border border-[#c9d5cf] bg-[#fafcfb] p-4 text-[14px] text-[#052d1d] placeholder:text-[#8a9690] focus:border-[#0b7148] focus:outline-none focus:ring-1 focus:ring-[#0b7148]" />
                </label>

                {notice && (
                  <Alert variant={notice.type === 'error' ? 'destructive' : 'default'} className={`rounded-xl px-4 py-3 ${notice.type === 'success' ? 'border-[#c4d8cb] bg-gradient-to-br from-[#eef6f1] to-[#e6f3eb] text-[#052d1d]' : 'border-red-200 bg-red-50'}`}>
                    <MessageCircle className="size-4" />
                    <AlertTitle className="text-sm font-semibold">{notice.type === 'success' ? 'Inquiry submitted' : 'Submission failed'}</AlertTitle>
                    <AlertDescription className="text-xs">{notice.text}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#052d1d] px-8 text-[13px] font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(5,45,29,.25)] transition-all hover:bg-[#0c7148] hover:shadow-[0_6px_20px_rgba(5,45,29,.35)] disabled:opacity-70 sm:w-auto">
                    <Send className="size-4" />
                    {submitting ? 'Submitting...' : 'Submit inquiry'}
                  </button>
                  <p className="flex items-center gap-2 text-[11px] font-medium text-[#7a847f]">
                    <MessageCircle className="size-3.5" />
                    Message appears in admin queue
                  </p>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Map / Location Section */}
      <section className="relative overflow-hidden bg-[#052d1d] py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="absolute -right-40 top-0 size-96 rounded-full border border-white/5" />
        <div className="absolute -left-40 bottom-0 size-96 rounded-full border border-white/5" />
        
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(400px,_1.2fr)] lg:gap-20">
            {/* Left side: Heading */}
            <Reveal className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
                Headquarters
              </span>
              <h2 className="mt-6 font-[Outfit] text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                The heart of our <br className="hidden lg:block" /> organization.
              </h2>
              <p className="mt-6 text-lg text-white/70">
                Our registered office coordinates all national efforts, membership activities, and public services across Pakistan.
              </p>
            </Reveal>

            {/* Right side: Card */}
            <Reveal direction="up" delay={0.2} className="relative z-10 flex flex-col justify-center">
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="border-b border-[#e5ebe8] bg-[#f4f7f5] px-8 py-6">
                  <div className="flex items-center gap-3 text-[#0b7148]">
                    <Building2 className="size-6" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Registered Office</span>
                  </div>
                  <h3 className="mt-3 font-[Outfit] text-2xl font-bold text-[#052d1d]">Karachi, Pakistan</h3>
                </div>
                <div className="p-8">
                  <p className="text-[15px] leading-relaxed text-[#59655f]">{organization.address}</p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-8">
                    <a href={`tel:${organization.phone.replace(/\s/g, '')}`} className="group flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-[#eaf4ee] text-[#0b7148] transition-colors group-hover:bg-[#0b7148] group-hover:text-white">
                        <Phone className="size-4" />
                      </div>
                      <span className="text-[14px] font-semibold text-[#052d1d]">{organization.phone}</span>
                    </a>
                    <a href={`mailto:${organization.email}`} className="group flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-[#eaf4ee] text-[#0b7148] transition-colors group-hover:bg-[#0b7148] group-hover:text-white">
                        <Mail className="size-4" />
                      </div>
                      <span className="text-[14px] font-semibold text-[#052d1d]">{organization.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 z-0 select-none text-[15vw] font-black tracking-tighter text-white/5 opacity-50" aria-hidden="true">
          PAKISTAN
        </div>
      </section>
    </PublicLayout>
  )
}


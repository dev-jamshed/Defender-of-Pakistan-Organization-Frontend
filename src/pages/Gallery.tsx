import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Expand, MapPin, X } from 'lucide-react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { Stagger, StaggerItem, Reveal } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'
import { galleryItems } from '../content/publicContent'

export default function Gallery() {
  const categories = ['All', ...Array.from(new Set(galleryItems.map((item) => item.category)))]
  const [category, setCategory] = useState('All')
  
  // Modal State
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const items = useMemo(() => category === 'All' ? galleryItems : galleryItems.filter((item) => item.category === category), [category])

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  const showNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }
  }, [selectedIndex, items.length])

  const showPrev = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length)
    }
  }, [selectedIndex, items.length])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, showNext, showPrev])

  return (
    <PublicLayout>
      <PageIntro eyebrow="Media Gallery" index="06" title="Moments of unity, action and service." text="A structured public archive for DPO events, campaigns, programs and official visual references." image="/dpo-assets/home-hero-v2.jpg" />
      
      <section className="bg-[#eeeae0] py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header & Filters */}
          <div className="mb-12 flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <Reveal className="max-w-xl shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c3ddd0] bg-[#eaf5f0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0b7148]">
                Visual Archive
              </span>
              <h2 className="mt-5 font-[Outfit] text-4xl font-bold tracking-tight text-[#052d1d] sm:text-5xl">Explore the DPO<br className="hidden sm:block" /> story in pictures.</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[#59655f]">Browse the currently supplied media and design references by category.</p>
            </Reveal>

            {/* Filter Pills */}
            <Reveal delay={0.1} className="w-full md:w-auto overflow-hidden">
              <div className="flex w-full items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none md:flex-wrap md:justify-end md:overflow-visible md:pb-0">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                        setCategory(item)
                        setSelectedIndex(null) // Reset lightbox if category changes
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 ${
                      category === item
                        ? 'bg-[#052d1d] text-white shadow-[0_4px_12px_rgba(5,45,29,.25)] ring-1 ring-[#052d1d]'
                        : 'bg-white/60 text-[#59655f] ring-1 ring-[#d4ddd7] hover:bg-white hover:text-[#052d1d] hover:shadow-sm hover:ring-[#b5c7bd]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Gallery Grid */}
          <motion.div layout className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.article 
                  layout 
                  initial={{ opacity: 0, scale: .96, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: .94, y: -20 }} 
                  transition={{ duration: .35 }} 
                  key={item.title}
                  className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(5,30,18,.06)] border border-[#d4ddd7] cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative overflow-hidden w-full h-auto">
                    {/* Using min-h so it doesn't collapse if image is missing */}
                    <img src={item.image} alt={item.title} className="h-full min-h-[250px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#052d1d]/90 via-[#052d1d]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Expand Icon */}
                    <div className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                      <Expand className="size-5" />
                    </div>
                    
                    {/* Caption on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="inline-block rounded-md bg-[#0b7148]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm mb-2">{item.category}</span>
                      <h2 className="font-[Outfit] text-xl font-bold text-white leading-tight">{item.title}</h2>
                      
                      <footer className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-emerald-300">
                        <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{item.date}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{item.location}</span>
                      </footer>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Media Standards Section */}
      <section className="relative overflow-hidden bg-[#052d1d] py-20 sm:py-32">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full border-[40px] border-white/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full border-[40px] border-white/20 blur-3xl" />
        </div>
        
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-16 max-w-2xl text-center sm:mx-auto">
             <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
              Media Standards
            </span>
            <h2 className="mt-6 font-[Outfit] text-3xl font-bold tracking-tight text-white sm:text-5xl">Every image should preserve context.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-emerald-100/70">Future uploads should remain easy to search, understand and responsibly publish across all our networks.</p>
          </Reveal>
          
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {['Clear event name and date', 'Accurate location and category', 'Short descriptive caption', 'Appropriate consent before publishing'].map((item, index) => (
              <StaggerItem key={item}>
                <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)]">
                  {/* Glowing step indicator */}
                  <div className="mb-8 flex items-center justify-between">
                    <span className="relative flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-bold text-emerald-300 ring-1 ring-emerald-500/30 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      {index + 1}
                    </span>
                    <span className="text-6xl font-black text-white/5 transition-colors duration-300 group-hover:text-white/10">0{index + 1}</span>
                  </div>
                  <p className="text-[17px] font-medium leading-snug text-white transition-colors duration-300 group-hover:text-emerald-50">{item}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Modal / Lightbox with Slider */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 lg:p-12" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            role="dialog" 
            aria-modal="true"
          >
            {/* Backdrop */}
            <button 
              className="absolute inset-0 h-full w-full bg-[#031810]/90 backdrop-blur-md cursor-default border-none" 
              type="button" 
              onClick={closeLightbox} 
              aria-label="Close preview" 
            />
            
            <motion.div 
              className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col lg:flex-row h-full max-h-[90vh] sm:max-h-[85vh]" 
              initial={{ y: 35, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 35, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close Button */}
              <button 
                type="button" 
                onClick={closeLightbox} 
                className="absolute right-4 top-4 z-[60] grid size-10 place-items-center rounded-full bg-black/10 text-white backdrop-blur-md transition-all hover:bg-black/30 lg:text-gray-500 lg:bg-gray-100 lg:hover:bg-gray-200"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>

              {/* Image Area with Controls */}
              <div className="relative flex flex-1 items-center justify-center bg-[#1a231f] min-h-[40vh] lg:min-h-0 overflow-hidden group">
                <img 
                  src={items[selectedIndex].image} 
                  alt={items[selectedIndex].title} 
                  className="max-h-full w-auto max-w-full object-contain select-none shadow-[0_0_40px_rgba(0,0,0,.3)]" 
                />
                
                {/* Previous Button */}
                {items.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); showPrev() }} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 grid size-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-110 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-8" />
                  </button>
                )}
                
                {/* Next Button */}
                {items.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); showNext() }} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 grid size-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-110 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-8" />
                  </button>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium tracking-widest text-white backdrop-blur-md">
                   {selectedIndex + 1} / {items.length}
                </div>
              </div>

              {/* Sidebar Info Area */}
              <div className="flex w-full flex-col bg-white p-6 lg:w-[400px] lg:p-10 shrink-0 overflow-y-auto">
                <span className="w-fit rounded-md bg-[#eaf5f0] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0b7148]">{items[selectedIndex].category}</span>
                <h2 className="mt-4 font-[Outfit] text-2xl sm:text-3xl font-bold leading-tight text-[#052d1d]">{items[selectedIndex].title}</h2>
                <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-[#59655f]">{items[selectedIndex].caption}</p>
                
                <div className="mt-6 sm:mt-auto pt-6 sm:pt-8 flex flex-col gap-3 border-t border-[#e2e8e4]">
                   <div className="flex items-center gap-3">
                     <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f4f6f4] text-[#0b7148]">
                       <CalendarDays className="size-4" />
                     </div>
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-[#8a9690]">Date</span>
                       <span className="block text-[14px] font-semibold text-[#052d1d]">{items[selectedIndex].date}</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f4f6f4] text-[#0b7148]">
                       <MapPin className="size-4" />
                     </div>
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-[#8a9690]">Location</span>
                       <span className="block text-[14px] font-semibold text-[#052d1d]">{items[selectedIndex].location}</span>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  )
}


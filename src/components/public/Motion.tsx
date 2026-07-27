import { motion, useInView, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import type { ElementType, ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
}

export function Reveal({ children, className, delay = 0, direction = 'up' }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const distance = direction === 'none' ? {} : direction === 'left' ? { x: -24 } : direction === 'right' ? { x: 24 } : { y: 22 }

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, ...distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.14, margin: '0px 0px -5% 0px' }}
      transition={{ duration: 0.82, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.055, delayChildren: 0.02 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function TextReveal({
  children,
  as: Component = 'h1',
  className,
  delay = 0.08,
}: {
  children: string
  as?: ElementType
  className?: string
  delay?: number
}) {
  const root = useRef<HTMLElement | null>(null)
  const inView = useInView(root, { once: true, amount: 0.45 })
  const words = useMemo(() => children.trim().split(/\s+/), [children])

  useEffect(() => {
    if (!inView || !root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-reveal-word]',
        { yPercent: 108, opacity: 0, rotateX: -8, filter: 'blur(3px)' },
        { yPercent: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1, delay, stagger: 0.04, ease: 'expo.out', force3D: true },
      )
    }, root)
    return () => context.revert()
  }, [delay, inView])

  return (
    <Component ref={root} className={`dpo-text-reveal ${className ?? ''}`} aria-label={children}>
      {words.map((word, index) => (
        <span className="dpo-text-reveal__clip" aria-hidden="true" key={`${word}-${index}`}>
          <span data-reveal-word>{word}</span>
          {index < words.length - 1 && <>&nbsp;</>}
        </span>
      ))}
    </Component>
  )
}

export function ParallaxMedia({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 1.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

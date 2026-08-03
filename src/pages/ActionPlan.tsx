import { ArrowRight, CheckCircle2, Flag, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, Stagger, StaggerItem } from '../components/public/Motion'
import PublicLayout from '../components/public/PublicLayout'
import { CtaBand, PageIntro, SectionHeader } from '../components/public/PublicUi'
import { actionPlan } from '../content/publicContent'
import { cmsImage, cmsPairs, cmsText, cmsTitle, cmsValue, organizationFromSettings, useCmsPage, usePublicSite } from '../lib/publicCms'

export default function ActionPlan() {
  const site = usePublicSite()
  const page = useCmsPage('action-plan')
  const overviewPage = useCmsPage('action-plan-overview')
  const detailPage = useCmsPage('action-plan-detail')
  const statementPage = useCmsPage('action-plan-statement')
  const ctaPage = useCmsPage('action-plan-cta')
  const org = organizationFromSettings(site.settings)
  const items = cmsPairs(detailPage, actionPlan.map(({ title, text }) => ({ title, text })))
  return (
    <PublicLayout>
      <PageIntro
        eyebrow={cmsValue(page, 'eyebrow', 'National Action Plan')}
        index={cmsValue(page, 'index', '02')}
        title={cmsTitle(page, 'Seven priorities. One national direction.')}
        text={cmsText(page, `${org.motto} becomes a practical civic roadmap across institutions, unity, education, digital responsibility and public welfare.`)}
        image={cmsImage(page, '/dpo-assets/home-hero-v2.jpg')}
      />

      <section className="dpo-section dpo-section--paper">
        <div className="dpo-container dpo-plan-overview">
          <div className="dpo-plan-overview__copy">
            <SectionHeader eyebrow={cmsValue(overviewPage, 'eyebrow', 'The Framework')} title={cmsTitle(overviewPage, 'From shared values to measurable public action.')} text={cmsText(overviewPage, 'Each priority supports the next. Strong institutions need responsible citizens; responsible citizens need awareness, unity and opportunity.')} />
            <Reveal className="dpo-plan-quote"><Quote size={22} /><p>{cmsValue(overviewPage, 'quote', 'Nations are built through strong institutions, institutions are strengthened by the people, and the people are united by the nation.')}</p></Reveal>
          </div>
          <Reveal direction="right" className="dpo-plan-overview__poster"><img src={cmsImage(overviewPage, '/dpo-assets/front-2.png')} alt="Client-provided DPO seven point action plan poster" /><span>{cmsValue(overviewPage, 'imageCaption', 'Official action plan reference')}</span></Reveal>
        </div>
      </section>

      <section className="dpo-section dpo-section--white dpo-plan-detail">
        <div className="dpo-container">
          <SectionHeader eyebrow={cmsValue(detailPage, 'eyebrow', 'Seven Connected Priorities')} title={cmsTitle(detailPage, 'A complete public service framework.')} text={cmsText(detailPage, 'The plan moves from institutional trust to a peaceful, self-reliant and prosperous Pakistan.')} align="center" />
          <Stagger className="dpo-plan-timeline">
            {items.map(({ title, text }, index) => {
              const fallback = actionPlan[index] ?? actionPlan[0]
              const Icon = fallback.icon
              return (
              <StaggerItem key={title}>
                <article className={index % 2 ? 'is-even' : ''}>
                  <div className="dpo-plan-timeline__number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="dpo-plan-timeline__icon"><Icon size={25} /></div>
                  <div><span>{cmsValue(detailPage, 'itemLabel', 'Priority')} {index + 1}</span><h3>{title}</h3><p>{text || fallback.text}</p><small><CheckCircle2 size={14} /> {cmsValue(detailPage, 'itemFooter', 'Awareness, engagement and accountable delivery')}</small></div>
                </article>
              </StaggerItem>
            )})}
          </Stagger>
        </div>
      </section>

      <section className="dpo-plan-statement">
        <div className="dpo-container">
          <Reveal><Flag size={32} /><span>{cmsValue(statementPage, 'eyebrow', org.motto)}</span><h2>{cmsTitle(statementPage, 'Pakistan Zindabad. United, strong and indivisible.')}</h2><p>{cmsText(statementPage, "Through education, volunteerism and community service, every citizen can contribute to the country's progress and well-being.")}</p><Link className="dpo-button dpo-button--gold" to={cmsValue(statementPage, 'primaryHref', '/membership')}>{cmsValue(statementPage, 'primaryCta', 'Take part')} <ArrowRight size={17} /></Link></Reveal>
        </div>
      </section>

      <CtaBand
        eyebrow={cmsValue(ctaPage, 'eyebrow', 'Next Step')}
        title={cmsTitle(ctaPage, 'Move from awareness to participation.')}
        text={cmsText(ctaPage, 'Explore membership and leadership pathways that turn the action plan into real public contribution.')}
        primaryHref={cmsValue(ctaPage, 'primaryHref', '/membership')}
        primaryLabel={cmsValue(ctaPage, 'primaryCta', 'Membership details')}
        secondaryHref={cmsValue(ctaPage, 'secondaryHref', '/designations')}
        secondaryLabel={cmsValue(ctaPage, 'secondaryCta', 'Leadership roles')}
        backgroundImage={cmsImage(ctaPage, '')}
      />
    </PublicLayout>
  )
}

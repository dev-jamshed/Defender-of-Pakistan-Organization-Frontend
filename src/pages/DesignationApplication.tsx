import ApplicationForm from '../components/public/ApplicationForm'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'
import { cmsImage, cmsText, cmsTitle, cmsValue, useCmsPage } from '../lib/publicCms'

export default function DesignationApplication() {
  const page = useCmsPage('designation-application')
  return <PublicLayout><PageIntro eyebrow={cmsValue(page, 'eyebrow', 'Designation Application')} index={cmsValue(page, 'index', 'APPLY')} title={cmsTitle(page, 'Apply to serve in a leadership role.')} text={cmsText(page, 'Choose an active designation, provide your area details and submit the documents required for formal review.')} image={cmsImage(page, '/dpo-assets/home-hero-v2.jpg')} /><ApplicationForm mode="designation" /></PublicLayout>
}

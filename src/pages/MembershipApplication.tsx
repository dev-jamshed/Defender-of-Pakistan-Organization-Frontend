import ApplicationForm from '../components/public/ApplicationForm'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'
import { cmsImage, cmsText, cmsTitle, useCmsPage } from '../lib/publicCms'

export default function MembershipApplication() {
  const page = useCmsPage('membership-application')
  return <PublicLayout><PageIntro eyebrow="Membership Application" index="APPLY" title={cmsTitle(page, 'Become an official DPO member.')} text={cmsText(page, 'Complete the guided application, upload your verification documents and receive an application number for tracking.')} image={cmsImage(page, '/dpo-assets/home-mission-v2.jpg')} /><ApplicationForm mode="membership" /></PublicLayout>
}

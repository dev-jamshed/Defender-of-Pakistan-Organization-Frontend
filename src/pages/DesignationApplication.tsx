import ApplicationForm from '../components/public/ApplicationForm'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'

export default function DesignationApplication() {
  return <PublicLayout><PageIntro eyebrow="Designation Application" index="APPLY" title="Apply to serve in a leadership role." text="Choose an active designation, provide your area details and submit the documents required for formal review." image="/dpo-assets/home-hero-v2.jpg" /><ApplicationForm mode="designation" /></PublicLayout>
}

import ApplicationForm from '../components/public/ApplicationForm'
import PublicLayout from '../components/public/PublicLayout'
import { PageIntro } from '../components/public/PublicUi'

export default function MembershipApplication() {
  return <PublicLayout><PageIntro eyebrow="Membership Application" index="APPLY" title="Become an official DPO member." text="Complete the guided application, upload your verification documents and receive an application number for tracking." image="/dpo-assets/home-mission-v2.jpg" /><ApplicationForm mode="membership" /></PublicLayout>
}

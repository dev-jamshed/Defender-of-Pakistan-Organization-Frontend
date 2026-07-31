import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FileCheck,
  Flag,
  GraduationCap,
  HandHeart,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react'

export const organization = {
  name: 'Defenders of Pakistan Organization',
  shortName: 'DPO',
  motto: 'One Flag | One Nation | One Pakistan',
  intro:
    'A non-profit social welfare organization dedicated to patriotism, national unity, youth empowerment, community welfare, education and humanitarian service across Pakistan.',
  email: 'info@defendersofpakistan.org',
  phone: '+92 300 1234567',
  address: 'Office no: 143, Street no: 08, Defense Officers Scheme no: 1, Malir Cantt, Karachi',
  socialLinks: [
    { label: 'Facebook', value: 'To be provided' },
    { label: 'Instagram', value: 'To be provided' },
    { label: 'YouTube', value: 'To be provided' },
    { label: 'X', value: 'To be provided' },
    { label: 'TikTok', value: 'To be provided' },
  ],
  authorizedPerson: {
    name: 'Authorized Person',
    designation: 'To be finalized',
  },
}

export const brand = {
  colors: [
    { name: 'DPO Deep Green', value: '#063d26' },
    { name: 'Pakistan Green', value: '#0b7a4b' },
    { name: 'Service Gold', value: '#c8a84e' },
    { name: 'Soft White', value: '#f8faf8' },
  ],
  fonts: ['Be Vietnam Pro', 'Outfit', 'System UI'],
  assets: {
    logo: '/dpo-assets/logo-transparent.png',
    logoSvg: '/dpo-assets/logo.svg',
    favicon: '/dpo-assets/favicon.png',
  },
}

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Action Plan', href: '/action-plan' },
  { label: 'Membership', href: '/membership' },
  { label: 'Designations', href: '/designations' },
  { label: 'Cards', href: '/card-design' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Legal', href: '/legal' },
  { label: 'Contact', href: '/contact' },
  { label: 'Member Services', href: '/member-services' },
]

export const heroSlides = [
  '/dpo-assets/front-1.png',
  '/dpo-assets/front-2.png',
  '/dpo-assets/front-3.png',
  '/dpo-assets/front-4.png',
]

export const hero = {
  eyebrow: organization.name,
  titleLines: ['One Flag', 'One Nation', 'One Pakistan'],
  text:
    'We are a non-profit organization committed to patriotism, national unity, youth empowerment, community welfare, education and human service for a strong, peaceful and progressive Pakistan.',
  primaryCta: 'Become a Member',
  secondaryCta: 'Donate Now',
}

export const about = {
  headline: 'A community-driven organization for a stronger Pakistan.',
  body:
    'DPO works at the grassroots level to create opportunities for positive social participation. Through educational programs, awareness campaigns, community services, welfare projects, leadership development and volunteer activities, the organization encourages unity, discipline, integrity and public service.',
  mission:
    'Unite the people of Pakistan through patriotism, education, social welfare and community engagement while empowering youth to become responsible, ethical and productive citizens.',
  vision:
    'To become one of Pakistan’s trusted and impactful social organizations by creating a united, educated, disciplined and compassionate society.',
}

export const coreValues: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Patriotism', text: 'Love, respect and commitment to Pakistan.', icon: Flag },
  { title: 'Unity', text: 'Strengthening harmony among all citizens.', icon: Users },
  { title: 'Education', text: 'Knowledge as the foundation of national development.', icon: BookOpen },
  { title: 'Service', text: 'Serving humanity without discrimination.', icon: HandHeart },
  { title: 'Integrity', text: 'Honesty, transparency and accountability in every action.', icon: ShieldCheck },
  { title: 'Leadership', text: 'Developing future leaders through discipline and responsibility.', icon: GraduationCap },
  { title: 'Community Welfare', text: 'Working for sustainable social betterment.', icon: BadgeCheck },
  { title: 'Respect for Law', text: 'Supporting constitutional values, justice and citizenship.', icon: Scale },
]

export const actionPlan = [
  {
    title: 'Strengthening National Institutions',
    text: 'Encouraging respect for constitutional institutions, law enforcement and the rule of law.',
    icon: Landmark,
  },
  {
    title: 'Promoting Unity',
    text: 'Discouraging sectarianism, discrimination, political intolerance and all forms of hatred.',
    icon: Users,
  },
  {
    title: 'One Nation, One Identity',
    text: 'Promoting a shared Pakistani identity with cultural respect across provinces and communities.',
    icon: Flag,
  },
  {
    title: 'Rule of Law',
    text: 'Supporting equal, transparent and accessible justice for every citizen.',
    icon: Scale,
  },
  {
    title: 'Civic Education',
    text: 'Inspiring responsible citizens through seminars, schools, universities and public awareness.',
    icon: BookOpen,
  },
  {
    title: 'Digital Awareness',
    text: 'Promoting media literacy, fact-checking and responsible use of digital platforms.',
    icon: ShieldCheck,
  },
  {
    title: 'Prosperous Pakistan',
    text: 'Supporting peace, self-reliance, community service and national development.',
    icon: HandHeart,
  },
]

export const membership = {
  fee: 'PKR 2,000',
  duration: 'One year / lifetime option to be finalized',
  types: ['General Member', 'Volunteer Member', 'Executive Member', 'Life Time Member'],
  documents: ['CNIC or B-Form', 'Passport size photo', 'Mobile number', 'Email address', 'Residential address'],
  terms: [
    'Every member must follow the organization constitution, code of conduct and policies.',
    'Incorrect or incomplete information may lead to rejection or cancellation.',
    'Membership approval remains subject to the authorized organization committee.',
    'Activities against the reputation or purpose of the organization are not acceptable.',
  ],
  formFields: [
    'Name',
    'Father/guardian name',
    'CNIC/B-Form',
    'Date of birth',
    'Mobile',
    'Email',
    'Address',
    'City',
    'Photo',
    'Membership type',
    'Consent/signature',
  ],
}

export const designations = {
  fee: 'To be finalized',
  duration: 'To be finalized',
  list: [
    ['Chairman', 'Highest executive authority and strategic leader.'],
    ['Senior Vice Chairman', 'Supports strategic planning and oversees organizational performance.'],
    ['Vice Chairman', 'Assists daily operations and departmental coordination.'],
    ['General Secretary', 'Manages records, meetings, correspondence and administration.'],
    ['Deputy General Secretary', 'Supports the General Secretary and follows up team tasks.'],
    ['Joint Secretary', 'Assists documentation, reports and secretariat activities.'],
    ['Rabta Secretary', 'Maintains communication between members, teams and regional offices.'],
    ['Finance Secretary', 'Handles budgeting, accounting and financial transparency.'],
    ['Office Secretary', 'Manages office operations, filing and visitor records.'],
    ['Legal Adviser', 'Provides legal guidance and policy compliance support.'],
    ['Director Complaint Cell', 'Receives complaints, investigates fairly and recommends action.'],
    ['Organizer', 'Organizes meetings, awareness campaigns and community events.'],
    ['Chief Organizer', 'Leads organizing teams and supervises program execution.'],
    ['Press Secretary', 'Handles media relations, press releases and public communication.'],
    ['Youth Wing President', 'Leads youth initiatives, leadership programs and student engagement.'],
    ['Women Wing President', 'Leads women participation, empowerment and welfare initiatives.'],
    ['Event Coordinator', 'Plans and coordinates conferences, seminars and campaigns.'],
    ['Legal Committee Member', 'Assists legal review, policy research and compliance matters.'],
    ['Director, Information & Digital Awareness', 'Leads media literacy and cyber-safety education.'],
    ['Director, 5th Generation Warfare Awareness', 'Develops awareness programs against misinformation.'],
    ['Coordinator, 5th Generation Warfare Awareness', 'Coordinates workshops, material and public outreach.'],
    ['Head of 5th Generation Warfare Awareness & Research', 'Leads research and educational resources.'],
  ],
}

export const cardDesign = {
  front: ['Organization logo', 'Member photo', 'Member name', 'Membership ID', 'Designation'],
  back: ['QR code', 'Emergency contact', 'Card validity', 'Official website', 'Brief terms and conditions'],
  assets: ['/dpo-assets/cms/membership.png', '/dpo-assets/cms/card-logo.png', '/dpo-assets/logo-transparent.png'],
}

export const galleryItems = [
  {
    title: 'Lahore Membership Camp',
    category: 'Membership Event',
    date: 'July 15, 2026',
    location: 'Lahore',
    image: '/dpo-assets/front-1.png',
    caption: 'DPO team gathering for membership awareness and community outreach.',
  },
  {
    title: 'DPO Awareness Campaign',
    category: 'Campaign',
    date: 'July 20, 2026',
    location: 'Pakistan',
    image: '/dpo-assets/front-2.png',
    caption: 'Public awareness activity focused on unity, discipline and responsible citizenship.',
  },
  {
    title: 'National Program Session',
    category: 'National Event',
    date: 'July 2026',
    location: 'Pakistan',
    image: '/dpo-assets/front-3.png',
    caption: 'Community event highlighting DPO service values and civic engagement.',
  },
  {
    title: 'Youth Leadership Moment',
    category: 'Youth Program',
    date: 'July 2026',
    location: 'Pakistan',
    image: '/dpo-assets/front-4.png',
    caption: 'Youth participation and leadership development for a better Pakistan.',
  },
  {
    title: 'Membership Card Gallery',
    category: 'Membership',
    date: 'Reference Asset',
    location: 'DPO',
    image: '/dpo-assets/cms/membership.png',
    caption: 'Official membership material reference for the public website.',
  },
  {
    title: 'Designation Assets',
    category: 'Designations',
    date: 'Reference Asset',
    location: 'DPO',
    image: '/dpo-assets/cms/designation-idea.png',
    caption: 'Designation visual references and official documentation assets.',
  },
]

export const legalPolicies = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How DPO collects, uses and protects public, applicant and member information.',
    points: [
      'Information is collected only for membership, verification, communication and administrative purposes.',
      'Personal details are handled with care and shared only where required for official processing.',
      'Users may contact DPO to request corrections to submitted information.',
    ],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    summary: 'Rules for using DPO public services, forms, membership requests and website resources.',
    points: [
      'Submitted information must be accurate and complete.',
      'DPO may reject, hold or cancel requests that violate organization policy.',
      'Website content, logos and card assets must not be misused or reproduced without permission.',
    ],
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    summary: 'Guidance for membership, designation, card regeneration or service fee refunds.',
    points: [
      'Refund eligibility depends on payment status, request stage and official approval policy.',
      'Service charges or payment gateway fees may be non-refundable.',
      'Approved refunds are processed through the original or approved payment channel.',
    ],
  },
  {
    slug: 'donation-policy',
    title: 'Donation Policy',
    summary: 'How donations are recorded, acknowledged and used for welfare or approved causes.',
    points: [
      'Donations are used for approved welfare, education, humanitarian and organizational initiatives.',
      'Donor records are kept for transparency and receipt generation.',
      'Restricted donations are used according to the accepted cause wherever possible.',
    ],
  },
  {
    slug: 'data-cnic-privacy-policy',
    title: 'Data/CNIC Privacy Policy',
    summary: 'Additional privacy practices for CNIC, B-Form, identity and verification documents.',
    points: [
      'CNIC and identity documents are collected only when required for verification or official records.',
      'Sensitive identity numbers should be masked in public views wherever possible.',
      'Access to identity information must remain limited to authorized administrative users.',
    ],
  },
]

export const contactCards = [
  { title: 'Phone / WhatsApp', text: organization.phone, icon: Phone },
  { title: 'Email', text: organization.email, icon: Mail },
  { title: 'Office Address', text: organization.address, icon: MapPin },
]

export const quickStats = [
  { label: 'Active Members', value: '10K+', icon: Users },
  { label: 'Projects Completed', value: '250+', icon: FileCheck },
  { label: 'Volunteers', value: '500+', icon: HandHeart },
  { label: 'Programs', value: '7', icon: CalendarDays },
]

export const serviceLinks = [
  { title: 'Membership', text: 'Apply, verify or renew your membership.', href: '/membership', icon: Users },
  { title: 'Designations', text: 'View official roles and designation details.', href: '/designations', icon: BriefcaseBusiness },
  { title: 'Gallery', text: 'Explore DPO events and public activity media.', href: '/gallery', icon: BadgeCheck },
  { title: 'Legal Pages', text: 'Review public policies, privacy and refund terms.', href: '/legal', icon: Scale },
]

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import About from './pages/About';
import ActionPlan from './pages/ActionPlan';
import CardDesign from './pages/CardDesign';
import Contact from './pages/Contact';
import Designations from './pages/Designations';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Legal from './pages/Legal';
import Membership from './pages/Membership';
import MembershipApplication from './pages/MembershipApplication';
import DesignationApplication from './pages/DesignationApplication';
import ApplicationStatus from './pages/ApplicationStatus';
import MemberServices from './pages/MemberServices';

const pageTitles: Record<string, string> = {
  '/': 'Defenders of Pakistan Organization',
  '/about': 'About DPO',
  '/about-us': 'About DPO',
  '/action-plan': 'Action Plan',
  '/membership': 'Membership',
  '/apply/membership': 'Membership Application',
  '/apply/designation': 'Designation Application',
  '/application-status': 'Application Status',
  '/member-services': 'Member Services',
  '/designations': 'Designations',
  '/designation': 'Designations',
  '/card-design': 'Membership Card',
  '/cards': 'Membership Card',
  '/gallery': 'Gallery',
  '/legal': 'Legal Policies',
  '/contact': 'Contact DPO',
};

function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.title = 'DPO Administration';
      return;
    }
    const pageTitle = pathname.startsWith('/legal/') ? 'Legal Policy' : pageTitles[pathname];
    document.title = pageTitle ? `${pageTitle} | DPO Pakistan` : 'Defenders of Pakistan Organization';
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/action-plan" element={<ActionPlan />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/apply/membership" element={<MembershipApplication />} />
        <Route path="/apply/designation" element={<DesignationApplication />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/member-services" element={<MemberServices />} />
        <Route path="/designations" element={<Designations />} />
        <Route path="/designation" element={<Designations />} />
        <Route path="/card-design" element={<CardDesign />} />
        <Route path="/cards" element={<CardDesign />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/legal/:slug" element={<Legal />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

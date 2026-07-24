import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoBadge from '../../assets/hero_badge.png'; // Use a small version of badge if we don't have separate logo

const Header = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      <div className="header-topbar">
        <div className="container">
          <div className="topbar-info">
            <span><Phone size={14} /> +92 300 1234567</span>
            <span><Mail size={14} /> info@defendersofpakistan.org</span>
          </div>
          <div className="topbar-socials">
            <span style={{ marginRight: '0.5rem' }}>Follow Us:</span>
            <a href="#" style={{ fontWeight: 600, fontSize: '0.85rem' }}>FB</a>
            <a href="#" style={{ fontWeight: 600, fontSize: '0.85rem' }}>IG</a>
            <a href="#" style={{ fontWeight: 600, fontSize: '0.85rem' }}>YT</a>
            <a href="#" style={{ fontWeight: 600, fontSize: '0.85rem' }}>X</a>
          </div>
        </div>
      </div>
      
      <header className="main-header">
        <div className="container">
          <Link to="/" className="logo-container">
            <div className="logo-icon" style={{ background: 'transparent' }}>
              <img src={logoBadge} alt="Logo" style={{ filter: 'none', animation: 'none' }} />
            </div>
            <div className="logo-text">
              <span className="logo-title">DEFENDERS OF</span>
              <span className="logo-title" style={{ marginTop: '-4px' }}>PAKISTAN ORGANIZATION</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                <span style={{ flex: 1, height: '1px', background: 'var(--dpo-primary-light)' }}></span>
                <span className="logo-subtitle" style={{ marginTop: 0 }}>One Flag | One Nation | One Pakistan</span>
                <span style={{ flex: 1, height: '1px', background: 'var(--dpo-primary-light)' }}></span>
              </div>
            </div>
          </Link>

          <nav className="desktop-nav">
            <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="#about" className="nav-link">About Us</Link>
            <Link to="#action" className="nav-link">Action Plan</Link>
            <Link to="#membership" className="nav-link">Membership</Link>
            <Link to="/admin" className="nav-link">Admin Login</Link>
            <Link to="#join" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
              JOIN NOW
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;

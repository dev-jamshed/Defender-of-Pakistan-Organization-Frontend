import { Users, CheckCircle, HandHeart, MapPin } from 'lucide-react';
import logoBadge from '../../assets/hero_badge.png';

const Footer = () => {
  return (
    <footer>
      {/* Footer Top Links */}
      <div className="main-footer">
        <div className="container">
          <div className="footer-top">
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <img src={logoBadge} alt="Logo" style={{ width: '80px', height: '80px' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--dpo-white)' }}>
                  DEFENDERS OF PAKISTAN
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
                  A non-profit organization committed to patriotism and a progressive Pakistan.
                </p>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--dpo-accent)', marginBottom: '1rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>About Us</a></li>
                <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Membership</a></li>
                <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>News & Events</a></li>
                <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--dpo-accent)', marginBottom: '1rem' }}>Contact</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                <li>Email: info@defendersofpakistan.org</li>
                <li>Phone: +92 300 1234567</li>
                <li>Address: Islamabad, Pakistan</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            <p>&copy; {new Date().getFullYear()} Defenders of Pakistan Organization. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Footer Stats Bar (Dark Green) */}
      <div className="footer-stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <Users className="stat-icon" size={40} />
              <div className="stat-info">
                <h3>10K+</h3>
                <p>Active Members</p>
              </div>
            </div>
            <div className="stat-item">
              <CheckCircle className="stat-icon" size={40} />
              <div className="stat-info">
                <h3>250+</h3>
                <p>Projects Completed</p>
              </div>
            </div>
            <div className="stat-item">
              <HandHeart className="stat-icon" size={40} />
              <div className="stat-info">
                <h3>500+</h3>
                <p>Volunteers</p>
              </div>
            </div>
            <div className="stat-item">
              <MapPin className="stat-icon" size={40} />
              <div className="stat-info">
                <h3>All Over</h3>
                <p>Pakistan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

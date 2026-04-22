import { Shield, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
//import { motion } from 'framer-motion';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Register', href: '/register' },
  { label: 'Login', href: '/login' },
  { label: 'My Reports', href: '/my-reports' },
];

const emergencyContacts = [
  { label: 'Security', number: '0700 123 456', tel: '0700123456' },
  { label: 'Police', number: '999', tel: '999' },
  { label: 'Fire & Ambulance', number: '119', tel: '119' },
];

export default function Footer() {
  return (
    <footer className="footer mt-auto">
      {/* Top gradient bar */}
      <div className="footer-topbar" />

      <div className="footer-body">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

            {/* ── Brand ── */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="footer-logo-icon">
                  <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="footer-brand">CSIRS</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Campus Safety &amp; Incident Reporting System — protecting our TVET community around the clock.
              </p>
              <div className="footer-badge">
                <span className="footer-badge-dot" />
                System Online
              </div>
            </div>

            {/* ── Quick Links ── */}
            <div>
              <h4 className="footer-section-title">Quick Links</h4>
              <ul className="space-y-2.5">
                {quickLinks.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="footer-link group">
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-amber-400" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Emergency Contacts ── */}
            <div>
              <h4 className="footer-section-title">Emergency Contacts</h4>
              <ul className="space-y-3">
                {emergencyContacts.map(({ label, number, tel }) => (
                  <li key={tel}>
                    <a href={`tel:${tel}`} className="footer-emergency-link group">
                      <span className="footer-emergency-icon">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        <span className="text-slate-400 text-xs block">{label}</span>
                        <span className="text-white font-semibold text-sm tracking-wide">{number}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Office ── */}
            <div>
              <h4 className="footer-section-title">Safety Office</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:safety@tvetsafety.ac.ke" className="footer-office-item group">
                    <span className="footer-office-icon">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <span>
                      <span className="text-slate-400 text-xs block">Email</span>
                      <span className="text-amber-400 text-sm font-medium group-hover:text-amber-300 transition-colors">
                        safety@tvetsafety.ac.ke
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <div className="footer-office-item">
                    <span className="footer-office-icon">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <span>
                      <span className="text-slate-400 text-xs block">Working Hours</span>
                      <span className="text-white text-sm font-medium">8:00 AM – 5:00 PM</span>
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} CSIRS · TVET Institutions Campus Safety System</span>
            <span className="footer-bottom-divider" />
            <span>Built for student safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
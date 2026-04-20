import { Shield, Phone } from 'lucide-react';


export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <span className="font-semibold text-2xl">CSIRS</span>
          </div>
          <p className="text-sm text-slate-300">
            Campus Safety & Incident Reporting System<br />
            Protecting our TVET community.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><a href="/" className="hover:text-orange-500 transition-colors duration-200">Home</a></li>
            <li><a href="/register" className="hover:text-orange-500 transition-colors duration-200">Register</a></li>
            <li><a href="/login" className="hover:text-orange-500 transition-colors duration-200">Login</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Emergency Contacts</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 hover:text-orange-500 hover:underline transition-colors duration-200">
              <Phone className="w-4 h-4" /><a href=''>Security: 0700 123 456</a> 
            </li>
            <li className="flex items-center gap-2 hover:text-orange-500 hover:underline transition-colors duration-200">
              <Phone className="w-4 h-4" /><a href=''>Police: 999</a>
            </li>
            <li className="flex items-center gap-2 hover:text-orange-500 hover:underline transition-colors duration-200">
              <Phone className="w-4 h-4" /> <a href=''>Ambulance/Fire: 119</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">TVET Safety Office</h4>
          <p style={{ color: 'orangered', fontWeight: 'Bold' }} className="hover:underline text-sm text-slate-300"><a href='mailto:safety@tvetsafety.ac.ke'>Email: safety@tvetsafety.ac.ke</a></p> 
          <br/>
          <p className="text-sm text-slate-300">Working Hours: 8:00 AM - 5:00 PM</p>
        </div>
      </div>

      <div className="border-t border-white/20 mt-12 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CSIRS • TVET Institutions Campus Safety System
      </div>
    </footer>
  );
}
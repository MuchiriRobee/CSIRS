import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
//import { Button } from '../ui/button';
import { LogOut, Shield, Settings, ChevronDown, LayoutDashboard, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ReportIncidentDialog from '../forms/ReportIncidentDialog';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'Home', to: '/' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

    const handleLogout = () => {
    logout();
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="navbar sticky top-[40px] z-40"
    >
      <div className="navbar-inner max-w-7xl mx-auto px-4 sm:px-6 py-0 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="navbar-logo-icon">
            <Shield className="w-4.5 h-4.5 text-white relative z-10" strokeWidth={2.5} />
            <div className="navbar-logo-glow" />
          </div>
          <div className="leading-none">
            <div className="navbar-brand">CSIRS</div>
            <div className="navbar-subbrand">Campus Safety System</div>
          </div>
        </Link>

        {/* ── Nav Links + Actions ── */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${location.pathname === to ? 'nav-link--active' : ''}`}
              >
                {label}
                {location.pathname === to && (
                  <motion.span layoutId="nav-underline" className="nav-link-underline" />
                )}
              </Link>
            ))}
          </div>

          {/* Report Incident */}
          <ReportIncidentDialog
            trigger={
              <button className="report-btn hidden md:flex items-center gap-2">
                <span className="report-btn-dot" />
                Report Incident
              </button>
            }
          />

          {/* ── Auth ── */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="user-menu-trigger group">
                  <div className="user-avatar">
                    <span>{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
                  </div>
                  <div className="hidden md:block text-left leading-none">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 dropdown-content">
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem
                    onClick={() => navigate('/admin/dashboard')}
                    className="dropdown-item"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-amber-500" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => navigate('/my-reports')}
                  className="dropdown-item"
                >
                  <FileText className="mr-2 h-4 w-4 text-slate-400" />
                  My Reports
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem
                    onClick={() => navigate('/admin/settings')}
                    className="dropdown-item"
                  >
                    <Settings className="mr-2 h-4 w-4 text-slate-400" />
                    Settings
                  </DropdownMenuItem>
                )}
                {user.role === 'REPORTER' && (
                  <DropdownMenuItem
                    onClick={() => navigate('/settings')}
                    className="dropdown-item"
                  >
                    <Settings className="mr-2 h-4 w-4 text-slate-400" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="dropdown-item dropdown-item--danger"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="nav-ghost-btn">Login</Link>
              <Link to="/register" className="nav-solid-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Settings,
  LogOut, Shield, ChevronLeft, ChevronRight,
  Menu, X, Activity,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard',     icon: LayoutDashboard, badge: null },
  { to: '/admin/incidents', label: 'All Incidents',  icon: FileText,        badge: 'new' },
  { to: '/admin/users',     label: 'All Users',      icon: Users,           badge: null },
  { to: '/admin/settings',  label: 'Settings',       icon: Settings,        badge: null },
];

/* ── Hook: persist collapse state ───────────────────────── */
function useCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const toggle = () => setCollapsed((v) => {
    const next = !v;
    try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
    return next;
  });
  return [collapsed, toggle] as const;
}

/* ── Nav link ────────────────────────────────────────────── */
function NavLink({
  item, isActive, collapsed, onClick,
}: {
  item: typeof navItems[0];
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn('sidebar-nav-link', isActive && 'sidebar-nav-link--active')}
      title={collapsed ? item.label : undefined}
    >
      <span className="sidebar-nav-icon-wrap">
        <Icon className="w-[18px] h-[18px]" />
        {item.badge && !isActive && (
          <span className="sidebar-nav-dot" aria-hidden="true" />
        )}
      </span>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.22 }}
            className="sidebar-nav-label"
          >
            {item.label}
            {item.badge && !isActive && (
              <span className="sidebar-nav-badge">new</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>

      {isActive && <span className="sidebar-active-bar" aria-hidden="true" />}
    </Link>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, toggleCollapsed] = useCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const sidebarContent = (isMobile = false) => (
    <div className={cn('sidebar-inner', collapsed && !isMobile && 'sidebar-inner--collapsed')}>

      {/* ── Top: logo + collapse toggle ── */}
      <div className="sidebar-top">
        <Link to="/admin/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="sidebar-logo-text"
              >
                <span className="sidebar-brand">CSIRS</span>
                <span className="sidebar-portal">Admin Portal</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className="sidebar-collapse-btn"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft  className="w-3.5 h-3.5" />
            }
          </button>
        )}

        {/* Close — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar-collapse-btn"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── User card ── */}
      <AnimatePresence initial={false}>
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="sidebar-user-card"
          >
            <div className="sidebar-user-avatar">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name ?? 'Administrator'}</p>
              <p className="sidebar-user-role">Admin</p>
            </div>
            <div className="sidebar-user-status" title="Online" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed avatar */}
      {collapsed && !isMobile && (
        <div className="sidebar-collapsed-avatar" title={user?.name}>
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
      )}

      {/* ── Divider ── */}
      <div className="sidebar-divider" />

      {/* ── Section label ── */}
      <AnimatePresence initial={false}>
        {(!collapsed || isMobile) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="sidebar-section-label"
          >
            Navigation
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Nav links ── */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            isActive={location.pathname === item.to}
            collapsed={collapsed && !isMobile}
            onClick={isMobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />

        {/* Live activity indicator */}
        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sidebar-live-badge"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>System live</span>
              <span className="sidebar-live-dot" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={logout}
          className={cn('sidebar-logout-btn', collapsed && !isMobile && 'sidebar-logout-btn--icon')}
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="sidebar-logout-label"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ══ Mobile hamburger ══════════════════════════════ */}
      <button
        onClick={() => setMobileOpen(true)}
        className="sidebar-hamburger"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ══ Mobile drawer ════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sidebar-backdrop"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="sidebar-drawer"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ Desktop sidebar ══════════════════════════════ */}
      <aside className={cn('sidebar-desktop', collapsed && 'sidebar-desktop--collapsed')}>
        {sidebarContent(false)}
      </aside>
    </>
  );
}
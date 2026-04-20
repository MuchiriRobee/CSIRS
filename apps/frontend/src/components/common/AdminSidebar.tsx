import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/incidents', label: 'All Incidents', icon: FileText },
  { to: '/admin/users', label: 'All Users', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-72 bg-white border-r h-screen sticky top-0 p-6 flex flex-col">
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div className="font-semibold text-2xl text-primary">CSIRS</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-white shadow-sm" 
                  : "hover:bg-slate-100 text-slate-700"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Button 
        variant="ghost" 
        className="mt-auto justify-start text-destructive hover:bg-red-50"
        onClick={logout}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </Button>
    </div>
  );
}
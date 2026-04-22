import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogOut, Mail, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/* ── Password visibility toggle ────────────────────────── */
function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="set-eye-btn" aria-label={show ? 'Hide' : 'Show'}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

/* ── Password strength ──────────────────────────────────── */
function passwordStrength(pw: string): { score: number; label: string; cls: string } {
  if (!pw) return { score: 0, label: '', cls: '' };
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { score: 1, label: 'Weak',   cls: 'set-strength--weak'   },
    { score: 2, label: 'Fair',   cls: 'set-strength--fair'   },
    { score: 3, label: 'Good',   cls: 'set-strength--good'   },
    { score: 4, label: 'Strong', cls: 'set-strength--strong' },
  ];
  return map[s - 1] ?? map[0];
}

/* ── Section card wrapper ───────────────────────────────── */
function SettingsCard({
  icon: Icon, title, description, children, accentCls = '',
}: {
  icon: any; title: string; description: string;
  children: React.ReactNode; accentCls?: string;
}) {
  return (
    <div className={`set-card ${accentCls}`}>
      <div className="set-card-header">
        <div className="set-card-icon-wrap">
          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="set-card-title">{title}</h2>
          <p className="set-card-desc">{description}</p>
        </div>
      </div>
      <div className="set-card-body">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN SETTINGS
═══════════════════════════════════════════════════════════ */
export default function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isUpdating,   setIsUpdating]   = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  /* ── Profile form ── */
  const profileForm = useForm({ defaultValues: { name: user?.name || '' } });

  /* ── Password form ── */
  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPw = passwordForm.watch('newPassword');
  const strength = passwordStrength(newPw);

  /* ── Handlers ── */
  const handleUpdateProfile = async (data: { name: string }) => {
    if (!data.name.trim()) { toast.error('Name cannot be empty'); return; }
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: data.name }),
      });
      const json = await res.json();
      if (json.success) toast.success('Profile updated successfully');
      else toast.error(json.message || 'Failed to update profile');
    } catch { toast.error('Failed to update profile'); }
    finally { setIsUpdating(false); }
  };

  const handleChangePassword = async (data: any) => {
    if (!data.currentPassword) { toast.error('Enter your current password'); return; }
    if (data.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsChangingPw(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const json = await res.json();
      if (json.success) { toast.success('Password changed successfully'); passwordForm.reset(); }
      else toast.error(json.message || 'Failed to change password');
    } catch { toast.error('Failed to change password'); }
    finally { setIsChangingPw(false); }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="set-page">
      <div className="set-bg-blobs" aria-hidden="true">
        <div className="set-blob set-blob-1" />
        <div className="set-blob set-blob-2" />
      </div>

      <div className="set-page-inner">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="set-header"
        >
          <div className="set-header-left">
            <div className="set-header-icon">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="set-page-title">Settings</h1>
              <p className="set-page-sub">Manage your account preferences and security.</p>
            </div>
          </div>
          {/* User pill */}
          <div className="set-user-pill">
            <div className="set-user-pill-avatar">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className="set-user-pill-name">{user?.name}</p>
              <p className="set-user-pill-role">Admin</p>
            </div>
          </div>
        </motion.div>

        <div className="set-sections">

          {/* ── Profile ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <SettingsCard icon={User} title="Profile Information" description="Update your display name. Your email address cannot be changed.">
              <div className="set-form-grid">

                {/* Email — disabled */}
                <div className="set-field">
                  <label className="set-label">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                    <span className="set-label-locked">locked</span>
                  </label>
                  <div className="set-input-wrap">
                    <Mail className="set-input-icon" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="set-input set-input--icon set-input--disabled"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="set-field">
                  <label htmlFor="admin-name" className="set-label">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <div className="set-input-wrap">
                    <User className="set-input-icon" />
                    <input
                      id="admin-name"
                      type="text"
                      {...profileForm.register('name', { required: true })}
                      className="set-input set-input--icon"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={profileForm.handleSubmit(handleUpdateProfile)}
                disabled={isUpdating}
                className="set-submit-btn"
              >
                {isUpdating ? <><span className="set-spinner" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> Save Changes</>}
              </button>
            </SettingsCard>
          </motion.div>

          {/* ── Password ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5 }}>
            <SettingsCard icon={Lock} title="Change Password" description="Use a strong password with uppercase letters, numbers and symbols.">
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="set-pw-form" noValidate>

                {/* Current password */}
                <div className="set-field">
                  <label htmlFor="admin-current-pw" className="set-label">
                    <Lock className="w-3.5 h-3.5" /> Current Password
                  </label>
                  <div className="set-input-wrap">
                    <Lock className="set-input-icon" />
                    <input
                      id="admin-current-pw"
                      type={showCurrent ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      placeholder="Enter current password"
                      className="set-input set-input--icon set-input--pr"
                    />
                    <PasswordToggle show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
                  </div>
                </div>

                {/* New password */}
                <div className="set-field">
                  <label htmlFor="admin-new-pw" className="set-label">
                    <Lock className="w-3.5 h-3.5" /> New Password
                  </label>
                  <div className="set-input-wrap">
                    <Lock className="set-input-icon" />
                    <input
                      id="admin-new-pw"
                      type={showNew ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      placeholder="Minimum 8 characters"
                      className="set-input set-input--icon set-input--pr"
                    />
                    <PasswordToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
                  </div>
                  {/* Strength bar */}
                  {newPw && (
                    <div className="set-strength-row">
                      <div className="set-strength-bars">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`set-strength-bar ${i <= strength.score ? strength.cls : ''}`} />
                        ))}
                      </div>
                      <span className={`set-strength-label ${strength.cls}`}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="set-field">
                  <label htmlFor="admin-confirm-pw" className="set-label">
                    <Lock className="w-3.5 h-3.5" /> Confirm New Password
                  </label>
                  <div className="set-input-wrap">
                    <Lock className="set-input-icon" />
                    <input
                      id="admin-confirm-pw"
                      type={showConfirm ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                      placeholder="Re-enter new password"
                      className={`set-input set-input--icon set-input--pr ${
                        passwordForm.watch('confirmPassword') &&
                        passwordForm.watch('confirmPassword') !== newPw
                          ? 'set-input--error' : ''
                      }`}
                    />
                    <PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                  </div>
                  {passwordForm.watch('confirmPassword') && passwordForm.watch('confirmPassword') !== newPw && (
                    <p className="set-field-error">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                <button type="submit" disabled={isChangingPw} className="set-submit-btn">
                  {isChangingPw ? <><span className="set-spinner" /> Changing…</> : <><Lock className="w-4 h-4" /> Change Password</>}
                </button>
              </form>
            </SettingsCard>
          </motion.div>

          {/* ── Danger zone ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.5 }}>
            <SettingsCard icon={LogOut} title="Sign Out" description="End your current CSIRS admin session." accentCls="set-card--danger">
              <div className="set-logout-inner">
                <p className="set-logout-hint">
                  You will be redirected to the login page. Any unsaved changes will be lost.
                </p>
                <button onClick={handleLogout} className="set-logout-btn">
                  <LogOut className="w-4 h-4" />
                  Logout from CSIRS
                </button>
              </div>
            </SettingsCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
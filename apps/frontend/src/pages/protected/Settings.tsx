import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogOut, Mail, Shield, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';

/* ── (same helpers as Admin version) ───────────────────── */
function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="set-eye-btn" aria-label={show ? 'Hide' : 'Show'}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

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
   REPORTER SETTINGS  (src/pages/protected/Settings.tsx)
═══════════════════════════════════════════════════════════ */
export default function ReporterSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isUpdating,   setIsUpdating]   = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name || '' } });
  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPw = passwordForm.watch('newPassword');
  const strength = passwordStrength(newPw);

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
    <div className="set-page set-page--reporter">
      <div className="set-bg-blobs" aria-hidden="true">
        <div className="set-blob set-blob-1" />
        <div className="set-blob set-blob-2" />
      </div>

      <div className="set-page-inner">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="set-header"
        >
          <div className="set-header-left">
            <div className="set-header-icon">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="set-page-title">Account Settings</h1>
              <p className="set-page-sub">Manage your profile and keep your account secure.</p>
            </div>
          </div>

          {/* User pill */}
          <div className="set-user-pill set-user-pill--reporter">
            <div className="set-user-pill-avatar set-user-pill-avatar--reporter">
              {user?.name?.[0]?.toUpperCase() ?? 'R'}
            </div>
            <div>
              <p className="set-user-pill-name">{user?.name}</p>
              <p className="set-user-pill-role">Reporter</p>
            </div>
          </div>
        </motion.div>

        {/* ── Quick link to reports ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="set-quick-link-row"
        >
          <Link to="/my-reports" className="set-quick-link">
            <FileText className="w-4 h-4" />
            View My Reports
          </Link>
        </motion.div>

        <div className="set-sections">

          {/* ── Profile ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }}>
            <SettingsCard icon={User} title="Profile Information" description="Your name shown on reports. Your email address is permanent.">
              <div className="set-form-grid">
                <div className="set-field">
                  <label className="set-label">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                    <span className="set-label-locked">locked</span>
                  </label>
                  <div className="set-input-wrap">
                    <Mail className="set-input-icon" />
                    <input type="email" value={user?.email || ''} disabled className="set-input set-input--icon set-input--disabled" />
                  </div>
                </div>

                <div className="set-field">
                  <label htmlFor="rep-name" className="set-label">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <div className="set-input-wrap">
                    <User className="set-input-icon" />
                    <input
                      id="rep-name"
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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <SettingsCard icon={Lock} title="Change Password" description="Keep your account safe with a strong, unique password.">
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="set-pw-form" noValidate>

                <div className="set-field">
                  <label htmlFor="rep-current-pw" className="set-label">
                    <Lock className="w-3.5 h-3.5" /> Current Password
                  </label>
                  <div className="set-input-wrap">
                    <Lock className="set-input-icon" />
                    <input
                      id="rep-current-pw"
                      type={showCurrent ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      placeholder="Enter current password"
                      className="set-input set-input--icon set-input--pr"
                    />
                    <PasswordToggle show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
                  </div>
                </div>

                <div className="set-field">
                  <label htmlFor="rep-new-pw" className="set-label">
                    <Lock className="w-3.5 h-3.5" /> New Password
                  </label>
                  <div className="set-input-wrap">
                    <Lock className="set-input-icon" />
                    <input
                      id="rep-new-pw"
                      type={showNew ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      placeholder="Minimum 8 characters"
                      className="set-input set-input--icon set-input--pr"
                    />
                    <PasswordToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
                  </div>
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

                <div className="set-field">
                  <label htmlFor="rep-confirm-pw" className="set-label">
                    <Lock className="w-3.5 h-3.5" /> Confirm New Password
                  </label>
                  <div className="set-input-wrap">
                    <Lock className="set-input-icon" />
                    <input
                      id="rep-confirm-pw"
                      type={showConfirm ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                      placeholder="Re-enter new password"
                      className={`set-input set-input--icon set-input--pr ${
                        passwordForm.watch('confirmPassword') && passwordForm.watch('confirmPassword') !== newPw
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

          {/* ── Sign out ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }}>
            <SettingsCard icon={LogOut} title="Sign Out" description="End your current CSIRS session and return to the login page." accentCls="set-card--danger">
              <div className="set-logout-inner">
                <p className="set-logout-hint">You'll be redirected to the login page. Your reports will be saved.</p>
                <button onClick={handleLogout} className="set-logout-btn">
                  <LogOut className="w-4 h-4" />
                  Logout from CSIRS
                </button>
              </div>
            </SettingsCard>
          </motion.div>

        </div>
      </div>
      < Footer />
    </div>
  );
}
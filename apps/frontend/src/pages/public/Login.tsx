import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Eye, EyeOff, Shield, ArrowRight, CheckCircle2,
  Lock, Mail, ChevronLeft, Zap, Users, Clock,
} from 'lucide-react';
import { useLoginMutation } from '../../api/authApi';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'sonner';
import { loginSchema } from '@csirs/shared';
import type { LoginInput } from '@csirs/shared';
import { motion } from 'framer-motion';

const trustPoints = [
  { icon: Zap,          text: 'Instant report routing to security' },
  { icon: Lock,         text: 'End-to-end encrypted submissions' },
  { icon: Users,        text: 'Reviewed by trained campus staff' },
  { icon: Clock,        text: 'Available 24 / 7 across all campuses' },
];

/* ── Animated floating card ──────────────────────────── */
function FloatingCard({ delay, className, children }: {
  delay: number; className?: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`auth-float-card ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await loginMutation(data).unwrap();
      const accessToken = response.data?.accessToken || response.accessToken;
      const user = response.data?.user || response.user;
      if (!accessToken || !user) throw new Error('Invalid response from server');
      login(accessToken, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/my-reports');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="auth-page">

      {/* ══ LEFT — Brand Panel ══════════════════════════════ */}
      <div className="auth-panel auth-panel--brand">
        {/* Background geometry */}
        <div className="auth-panel-geo" aria-hidden="true">
          <div className="geo-ring geo-ring-1" />
          <div className="geo-ring geo-ring-2" />
          <div className="geo-ring geo-ring-3" />
          <div className="geo-orb geo-orb-amber" />
          <div className="geo-orb geo-orb-blue" />
        </div>

        {/* Content */}
        <div className="auth-panel-content">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="auth-logo"
          >
            <div className="auth-logo-icon">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="auth-logo-name">CSIRS</div>
              <div className="auth-logo-sub">Campus Safety System</div>
            </div>
          </motion.div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="auth-panel-headline"
          >
            <h2 className="auth-panel-title">
              Welcome<br />
              <span className="auth-panel-title-accent">back.</span>
            </h2>
            <p className="auth-panel-body">
              Good to see you again. Your campus community
              depends on every report — sign in and continue
              making a difference.
            </p>
          </motion.div>

          {/* Trust points */}
          <ul className="auth-trust-list">
            {trustPoints.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.09, duration: 0.5 }}
                className="auth-trust-item"
              >
                <span className="auth-trust-icon">
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                </span>
                <span>{text}</span>
              </motion.li>
            ))}
          </ul>

          {/* Floating stat cards */}
          <div className="auth-stat-cards">
            <FloatingCard delay={0.55} className="auth-stat-card">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="auth-stat-value">100%</div>
                <div className="auth-stat-label">Reports reviewed</div>
              </div>
            </FloatingCard>
            <FloatingCard delay={0.65} className="auth-stat-card">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <div className="auth-stat-value">&lt; 2 min</div>
                <div className="auth-stat-label">Response time</div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — Form Panel ══════════════════════════════ */}
      <div className="auth-panel auth-panel--form">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="auth-form-wrap"
        >
          {/* Back link */}
          <Link to="/" className="auth-back-link">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="auth-form-header">
            <h1 className="auth-form-title">Sign in</h1>
            <p className="auth-form-subtitle">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form" noValidate>

            {/* Email */}
            <div className="auth-field">
              <Label htmlFor="email" className="auth-label">Email Address</Label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@institution.ac.ke"
                  {...form.register('email')}
                  className="auth-input auth-input--icon"
                  aria-invalid={!!form.formState.errors.email}
                />
              </div>
              {form.formState.errors.email && (
                <p className="auth-error">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <Label htmlFor="password" className="auth-label">Password</Label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...form.register('password')}
                  className="auth-input auth-input--icon auth-input--pr"
                  aria-invalid={!!form.formState.errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="auth-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="auth-error">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <p className="auth-switch-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">
              Create one here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
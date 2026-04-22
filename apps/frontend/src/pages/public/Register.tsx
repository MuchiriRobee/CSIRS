import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Eye, EyeOff, Shield, ArrowRight, ChevronLeft,
  User, Mail, Lock, Star, CheckCircle2, HeartHandshake, Phone
} from 'lucide-react';
import { useRegisterMutation } from '../../api/authApi';
import { toast } from 'sonner';
import { registerSchema } from '@csirs/shared';
import type { RegisterInput } from '@csirs/shared';
import { motion } from 'framer-motion';
//import * as React from 'react';

const benefits = [
  { icon: CheckCircle2,    text: 'Track the status of every report you file' },
  { icon: HeartHandshake,  text: 'Connect with campus security directly' },
  { icon: Star,            text: 'Help build a safer community for everyone' },
  { icon: Shield,          text: 'Your identity is protected when you need it' },
];

const steps = [
  { num: '01', label: 'Create your account' },
  { num: '02', label: 'Verify your campus email' },
  { num: '03', label: 'Start reporting incidents' },
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ← NEW
  const navigate = useNavigate();
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: '', 
      email: '', 
      phone: '',           // ← NEW
      password: '', 
      confirmPassword: '', // ← NEW 
      role: 'REPORTER' as const },
  });

  const onSubmit = async (data: RegisterInput) => {

    try {
      await registerMutation(data).unwrap();
      toast.success('Account created successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page auth-page--register">

      {/* ══ LEFT — Form Panel ═══════════════════════════════ */}
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
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-subtitle">
              Join the TVET campus safety network today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form" noValidate>

            {/* Full Name */}
            <div className="auth-field">
              <Label htmlFor="name" className="auth-label">Full Name</Label>
              <div className="auth-input-wrap">
                <User className="auth-input-icon" />
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...form.register('name')}
                  className="auth-input auth-input--icon"
                  aria-invalid={!!form.formState.errors.name}
                />
              </div>
              {form.formState.errors.name && (
                <p className="auth-error">{form.formState.errors.name.message}</p>
              )}
            </div>

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

            {/* NEW: Phone Number (single field matching schema) */}
            {/* Country code dropdown can be added later as enhancement - Kenya is default in placeholder */}
            <div className="auth-field">
              <Label htmlFor="phone" className="auth-label">Phone Number</Label>
              <div className="auth-input-wrap">
                <Phone className="auth-input-icon" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254712345678"
                  {...form.register('phone')}
                  className="auth-input auth-input--icon"
                  aria-invalid={!!form.formState.errors.phone}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="auth-error">{form.formState.errors.phone.message}</p>
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
                  placeholder="Create a strong password"
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

            {/* NEW: Confirm Password (with eye toggle, same styling as password) */}
            <div className="auth-field">
              <Label htmlFor="confirmPassword" className="auth-label">Confirm Password</Label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...form.register('confirmPassword')}
                  className="auth-input auth-input--icon auth-input--pr"
                  aria-invalid={!!form.formState.errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="auth-eye-btn"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="auth-error">{form.formState.errors.confirmPassword.message}</p>
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
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ══ RIGHT — Brand Panel ══════════════════════════════ */}
      <div className="auth-panel auth-panel--brand auth-panel--brand-reg">
        {/* Background geometry */}
        <div className="auth-panel-geo" aria-hidden="true">
          <div className="geo-ring geo-ring-1" />
          <div className="geo-ring geo-ring-2" />
          <div className="geo-ring geo-ring-3" />
          <div className="geo-orb geo-orb-amber" />
          <div className="geo-orb geo-orb-teal" />
        </div>

        {/* Content */}
        <div className="auth-panel-content">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
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
              Join our<br />
              <span className="auth-panel-title-accent">safety network.</span>
            </h2>
            <p className="auth-panel-body">
              Every student, lecturer, and staff member who joins
              makes our campus safer. Your reports matter — and
              your account keeps you informed every step of the way.
            </p>
          </motion.div>

          {/* Benefits */}
          <ul className="auth-trust-list">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: 16 }}
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

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55 }}
            className="auth-steps"
          >
            {steps.map(({ num, label }, i) => (
              <div key={num} className="auth-step">
                <div className={`auth-step-num ${i === 0 ? 'auth-step-num--active' : ''}`}>
                  {num}
                </div>
                <span className={`auth-step-label ${i === 0 ? 'auth-step-label--active' : ''}`}>
                  {label}
                </span>
                {i < steps.length - 1 && <div className="auth-step-connector" />}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
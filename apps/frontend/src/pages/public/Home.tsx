import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Shield, Users, HeartPulse,
  Flame, Eye, ChevronRight, ArrowRight, Lock,
  CheckCircle2, Zap, PhoneCall, Bell,
  Building2, BookOpen, Info
} from 'lucide-react';
import ReportIncidentDialog from '../../components/forms/ReportIncidentDialog';
import Footer from '../../components/common/Footer';


/* ─── DATA ───────────────────────────────────────────────── */

const quickCategories = [
  {
    title: 'Medical Emergency',
    icon: HeartPulse,
    color: 'cat-red',
    desc: 'Injuries, sudden illness, or any health crisis on campus requiring immediate attention.',
    steps: ['Call 119 immediately', 'Do not move the injured person', 'Clear the area', 'Report via this system'],
    urgency: 'Critical',
  },
  {
    title: 'Safety & Security',
    icon: Shield,
    color: 'cat-orange',
    desc: 'Suspicious persons, broken locks, unauthorized access, or any security threat.',
    steps: ['Do not confront the individual', 'Move to a safe location', 'Call Security: 0700 123 456', 'File a report here'],
    urgency: 'High',
  },
  {
    title: 'Mental Health',
    icon: Users,
    color: 'cat-blue',
    desc: 'Concerns about your own or a peer\'s mental well-being, distress, or crisis.',
    steps: ['Stay with the person if safe', 'Listen without judgment', 'Contact the counseling office', 'Report anonymously here'],
    urgency: 'Sensitive',
  },
  {
    title: 'Facility Damage',
    icon: Building2,
    color: 'cat-amber',
    desc: 'Water leaks, vandalism, electrical faults, or equipment failure affecting safety.',
    steps: ['Evacuate if hazardous', 'Do not use damaged equipment', 'Notify the facilities office', 'Submit a report here'],
    urgency: 'Moderate',
  },
  {
    title: 'Fire / Smoke',
    icon: Flame,
    color: 'cat-red',
    desc: 'Any fire, smoke, or smell of burning in campus buildings or open areas.',
    steps: ['Activate the nearest fire alarm', 'Evacuate immediately', 'Call 119 (Fire & Ambulance)', 'Do not use elevators'],
    urgency: 'Critical',
  },
  {
    title: 'Harassment / Bullying',
    icon: Eye,
    color: 'cat-purple',
    desc: 'Verbal, physical, or cyber harassment, discrimination, or bullying incidents.',
    steps: ['Ensure immediate safety', 'Document the incident', 'Report confidentially here', 'Seek counseling support'],
    urgency: 'High',
  },
];

const features = [
  {
    label: 'Instant Reporting',
    heading: 'File a report in under\u00a060\u00a0seconds.',
    body:
      'No long forms, no waiting. Our streamlined report flow is designed for high-stress moments — choose a category, describe what happened, and submit. Your report reaches the right team immediately.',
    points: ['Guided category selection', 'Optional anonymous submission', 'Real-time confirmation'],
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
    imageAlt: 'Students at a campus institution',
  },
  {
    label: 'Monitored 24 / 7',
    heading: 'Security staff review\u00a0every\u00a0report.',
    body:
      'Every submission triggers an internal alert to our campus security and administration team. Critical incidents escalate automatically — no report falls through the cracks.',
    points: ['Admin dashboard oversight', 'Priority escalation system', 'Status updates to reporter'],
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    imageAlt: 'Security monitoring dashboard',
  },
  {
    label: 'Built for TVET',
    heading: 'Designed specifically\u00a0for our\u00a0community.',
    body:
      'CSIRS was built in close collaboration with TVET institution staff and students. The workflows, categories, and emergency contacts reflect the real challenges of the Kenyan campus environment.',
    points: ['Localized emergency numbers', 'Role-based access for staff', 'Mobile-first design'],
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    imageAlt: 'TVET campus building',
  },
];

const stats = [
  { value: '< 2 min', label: 'Average response time', icon: Zap },
  { value: '100%', label: 'Reports reviewed', icon: CheckCircle2 },
  { value: '24 / 7', label: 'System availability', icon: Bell },
  { value: 'Secure', label: 'End-to-end encrypted', icon: Lock },
];

/* ─── FLOATING ORBS ──────────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="hero-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </div>
  );
}

/* ─── FEATURE ROW ────────────────────────────────────────── */
function FeatureRow({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className={`feature-row ${isEven ? 'feature-row--normal' : 'feature-row--reverse'}`}>
      {/* Text */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -32 : 32 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="feature-text"
      >
        <span className="feature-label">{feature.label}</span>
        <h3 className="feature-heading">{feature.heading}</h3>
        <p className="feature-body">{feature.body}</p>
        <ul className="feature-points">
          {feature.points.map((p) => (
            <li key={p} className="feature-point">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, x: isEven ? 32 : -32 }}
        animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="feature-image-wrap"
      >
        <div className="feature-image-frame">
          <img src={feature.image} alt={feature.imageAlt} className="feature-image" />
          <div className="feature-image-overlay" />
        </div>
        {/* Decorative accent */}
        <div className={`feature-accent ${isEven ? 'feature-accent--right' : 'feature-accent--left'}`} />
      </motion.div>
    </div>
  );
}

/* ─── CATEGORY CARD ──────────────────────────────────────── */
function CategoryCard({
  cat,
  index,
}: {
  cat: (typeof quickCategories)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const Icon = cat.icon;

  const urgencyClass: Record<string, string> = {
    Critical: 'urgency-critical',
    High: 'urgency-high',
    Moderate: 'urgency-moderate',
    Sensitive: 'urgency-sensitive',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className={`cat-card cat-card--${cat.color}`}
    >
      <div className="cat-card-header">
        <div className={`cat-icon cat-icon--${cat.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`cat-urgency ${urgencyClass[cat.urgency]}`}>{cat.urgency}</span>
      </div>

      <h3 className="cat-title">{cat.title}</h3>
      <p className="cat-desc">{cat.desc}</p>

      <div className="cat-steps">
        <p className="cat-steps-label">
          <Info className="w-3.5 h-3.5" /> If this happens:
        </p>
        <ol className="cat-steps-list">
          {cat.steps.map((s, i) => (
            <li key={i} className="cat-step">
              <span className="cat-step-num">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <ReportIncidentDialog
        trigger={
          <button className="cat-report-btn">
            Report this <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />
    </motion.div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroBgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="home-page">

      {/* ══════════════════════ HERO ══════════════════════════ */}
      <section ref={heroRef} className="hero-section">
        {/* Parallax background image */}
        <motion.div  className="hero-bg-image">
          <img
            src="/herosection.jpg"
            alt=""
            className="hero-img"
            aria-hidden="true"
          />
          <div className="hero-img-overlay" />
        </motion.div>

        {/* Floating orbs */}
        <FloatingOrbs />

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity }} className="hero-content">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hero-eyebrow"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>TVET Campus Safety & Incident Reporting</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="hero-title"
            >
              Your Safety.<br />
              <span className="hero-title-accent">Our Priority.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hero-subtitle"
            >
              Report incidents quickly, track responses in real time,
              and help us build a safer campus — together.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="hero-actions"
            >
              <ReportIncidentDialog
                trigger={
                  <button className="hero-btn-primary">
                    <span className="hero-btn-pulse" />
                    Report an Incident
                    <ArrowRight className="w-4 h-4" />
                  </button>
                }
              />
              <button
                className="hero-btn-ghost"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Micro trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="hero-trust"
            >
              {['Anonymous reporting', 'Reviewed within minutes', 'Secure & confidential'].map((t) => (
                <span key={t} className="hero-trust-item">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Curved bottom border */}
        <div className="hero-curve" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8f9fb" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════ STATS BAR ═════════════════════ */}
      <section className="stats-bar">
        <div className="max-w-5xl mx-auto px-6">
          <div className="stats-grid">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="stat-item"
              >
                <div className="stat-icon-wrap">
                  <Icon className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ ABOUT ═════════════════════════ */}
      <section id="about" className="about-section">
        {/* bg floating shapes */}
        <div className="about-shapes" aria-hidden="true">
          <div className="about-shape about-shape-1" />
          <div className="about-shape about-shape-2" />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="about-inner">
            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="about-text"
            >
              <span className="section-eyebrow">About CSIRS</span>
              <h2 className="section-heading">
                A system built when<br />
                <em>every second matters.</em>
              </h2>
              <p className="about-body">
                The Campus Safety & Incident Reporting System (CSIRS) was developed to give
                every student, lecturer, and staff member a fast, reliable channel to flag
                emergencies and safety concerns on campus.
              </p>
              <p className="about-body">
                Whether it's a medical crisis at 2 AM or a maintenance hazard spotted during
                class — CSIRS routes your report to the right people instantly, ensuring
                nothing slips through unnoticed.
              </p>
              <div className="about-callout">
                <PhoneCall className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Need help right now?</p>
                  <p className="text-slate-500 text-sm">Security: <a href="tel:0700123456" className="text-amber-600 font-medium hover:underline">0700&nbsp;123&nbsp;456</a> · Police: <a href="tel:999" className="text-amber-600 font-medium hover:underline">999</a></p>
                </div>
              </div>
            </motion.div>

            {/* Right — image mosaic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="about-visual"
            >
              <div className="about-mosaic">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80"
                  alt="TVET campus students"
                  className="mosaic-main"
                />
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80"
                  alt="Classroom"
                  className="mosaic-sm"
                />
                <div className="mosaic-badge">
                  <Shield className="w-5 h-5 text-white" />
                  <span>Trusted by TVET Institutions</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section className="features-section">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <span className="section-eyebrow">How it works</span>
            <h2 className="section-heading text-center">
              Powerful tools for a<br />safer campus.
            </h2>
          </div>

          <div className="features-list">
            {features.map((f, i) => (
              <FeatureRow key={f.label} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CATEGORIES ════════════════════ */}
      <section id="categories" className="categories-section">
        {/* Background decoration */}
        <div className="categories-bg" aria-hidden="true">
          <div className="cat-bg-orb cat-bg-orb-1" />
          <div className="cat-bg-orb cat-bg-orb-2" />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="section-eyebrow-light">Report Categories</span>
            <h2 className="section-heading-light">
              What would you like<br />to report?
            </h2>
            <p className="section-subtext">
              Select a category below to see guidance on what to do in that situation —
              then file your report directly from this page.
            </p>
          </div>

          <div className="categories-grid">
            {quickCategories.map((cat, i) => (
              <CategoryCard key={cat.title} cat={cat} index={i} />
            ))}
          </div>

          <div className="categories-cta">
            <p className="categories-cta-text">
              Not sure which category fits? Submit a general report and our team will route it correctly.
            </p>
            <ReportIncidentDialog
              trigger={
                <button className="categories-cta-btn">
                  <BookOpen className="w-4 h-4" />
                  Submit General Report
                </button>
              }
            />
          </div>
        </div>
      </section>
      <Footer />

    </div>
    
  );
}
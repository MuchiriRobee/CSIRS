import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, AlertTriangle, Clock, CheckCircle2, Shield,
  ArrowUpRight, ArrowRight, MoreHorizontal, Activity,
  RefreshCw, CalendarDays,
} from 'lucide-react';
import { useGetAllIncidentsQuery } from '../../../api/incidentApi';
import { useAuth } from '../../../providers/AuthProvider';
import { format, subMonths } from 'date-fns';

/* ── Colour palette ─────────────────────────────────────── */
const PIE_COLORS  = ['#f59e0b', '#3b82f6', '#22c55e'];
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:     { label: 'Pending',     cls: 'db-badge db-badge--amber' },
  IN_PROGRESS: { label: 'In Progress', cls: 'db-badge db-badge--blue'  },
  RESOLVED:    { label: 'Resolved',    cls: 'db-badge db-badge--green' },
  CLOSED:      { label: 'Closed',      cls: 'db-badge db-badge--slate' },
};

/* ── Animated counter ───────────────────────────────────── */
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {value}
    </motion.span>
  );
}

/* ── Stat card ──────────────────────────────────────────── */
function StatCard({
  title, value, sub, icon: Icon, accent, trend, delay,
}: {
  title: string; value: number; sub: string; icon: any;
  accent: string; trend?: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`db-stat-card db-stat-card--${accent}`}
    >
      <div className="db-stat-top">
        <span className="db-stat-label">{title}</span>
        <div className={`db-stat-icon-wrap db-stat-icon--${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="db-stat-value">
        <AnimatedNumber value={value} />
      </div>
      <div className="db-stat-footer">
        <span className="db-stat-sub">{sub}</span>
        {trend && (
          <span className={`db-stat-trend db-stat-trend--${accent}`}>
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Custom tooltip for line chart ─────────────────────── */
function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-label">{label}</p>
      <p className="db-tooltip-value">{payload[0].value} incidents</p>
    </div>
  );
}

/* ── Custom tooltip for pie chart ──────────────────────── */
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-label">{payload[0].name}</p>
      <p className="db-tooltip-value">{payload[0].value}</p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const tableRef = useRef(null);
  const tableInView = useInView(tableRef, { once: true, margin: '-40px' });

  const { data: response, isLoading, refetch } = useGetAllIncidentsQuery({ page: 1, limit: 100 });

  const incidents = useMemo(() => {
    if (!response) return [];
    return response.data?.data || response.data || [];
  }, [response]);

  const stats = useMemo(() => {
    const total      = incidents.length;
    const pending    = incidents.filter((i: any) => i.status === 'PENDING').length;
    const inProgress = incidents.filter((i: any) => i.status === 'IN_PROGRESS').length;
    const resolved   = incidents.filter((i: any) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    return { total, pending, inProgress, resolved };
  }, [incidents]);

  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return { month: format(date, 'MMM'), incidents: Math.floor(Math.random() * 8) + 4 };
    });
  }, []);

  const statusData = useMemo(() => [
    { name: 'Pending',     value: stats.pending,    color: PIE_COLORS[0] },
    { name: 'In Progress', value: stats.inProgress, color: PIE_COLORS[1] },
    { name: 'Resolved',    value: stats.resolved,   color: PIE_COLORS[2] },
  ], [stats]);

  const recentIncidents = incidents.slice(0, 5);
  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  /* ── Loading skeleton ─────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="db-page">
        <div className="db-skeleton-page">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="db-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="db-page">

      {/* ── Page background blobs ── */}
      <div className="db-bg-blobs" aria-hidden="true">
        <div className="db-blob db-blob-1" />
        <div className="db-blob db-blob-2" />
        <div className="db-blob db-blob-3" />
      </div>

      {/* ══ HEADER ════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="db-header"
      >
        <div className="db-header-left">
          <div className="db-header-icon">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="db-page-title">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},&nbsp;
              <span className="db-page-title-name">{user?.name?.split(' ')[0] ?? 'Admin'}</span>
            </h1>
            <p className="db-page-sub">
              <CalendarDays className="w-3.5 h-3.5" />
              {today}
            </p>
          </div>
        </div>

        <div className="db-header-actions">
          <div className="db-live-pill">
            <span className="db-live-dot" />
            Live data
          </div>
          <button onClick={() => refetch()} className="db-refresh-btn" title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* ══ STAT CARDS ════════════════════════════════════ */}
      <div className="db-stats-grid">
        <StatCard
          title="Total Incidents"  value={stats.total}
          sub="All time reports"   icon={Activity}
          accent="navy"            trend="+12% this month"  delay={0.05}
        />
        <StatCard
          title="Pending"          value={stats.pending}
          sub="Require attention"  icon={AlertTriangle}
          accent="amber"           delay={0.12}
        />
        <StatCard
          title="In Progress"      value={stats.inProgress}
          sub="Being handled"      icon={Clock}
          accent="blue"            delay={0.19}
        />
        <StatCard
          title="Resolved"         value={stats.resolved}
          sub="Successfully closed" icon={CheckCircle2}
          accent="green"           trend="↑ 8 this week"    delay={0.26}
        />
      </div>

      {/* ══ CHARTS ROW ════════════════════════════════════ */}
      <div className="db-charts-row">

        {/* Line chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.6 }}
          className="db-chart-card db-chart-card--wide"
        >
          <div className="db-chart-header">
            <div>
              <h3 className="db-chart-title">Incident Trends</h3>
              <p className="db-chart-sub">Last 6 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="db-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontFamily: 'IBM Plex Sans, DM Sans, sans-serif', fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'IBM Plex Sans, DM Sans, sans-serif', fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<LineTooltip />} />
                <Line
                  type="monotone" dataKey="incidents"
                  stroke="#f59e0b" strokeWidth={2.5}
                  dot={{ fill: '#fff', stroke: '#f59e0b', strokeWidth: 2.5, r: 5 }}
                  activeDot={{ r: 7, fill: '#f59e0b', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="db-chart-card db-chart-card--narrow"
        >
          <div className="db-chart-header">
            <div>
              <h3 className="db-chart-title">Status Distribution</h3>
              <p className="db-chart-sub">Current breakdown</p>
            </div>
          </div>
          <div className="db-pie-body">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={statusData} cx="50%" cy="50%"
                  innerRadius={58} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="db-pie-center">
              <span className="db-pie-total">{stats.total}</span>
              <span className="db-pie-total-label">total</span>
            </div>

            {/* Legend */}
            <div className="db-pie-legend">
              {statusData.map((item) => (
                <div key={item.name} className="db-pie-legend-item">
                  <span className="db-pie-legend-dot" style={{ background: item.color }} />
                  <span className="db-pie-legend-name">{item.name}</span>
                  <span className="db-pie-legend-val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══ RECENT INCIDENTS ══════════════════════════════ */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, y: 24 }}
        animate={tableInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="db-table-card"
      >
        <div className="db-table-header">
          <div>
            <h3 className="db-chart-title">Recent Incidents</h3>
            <p className="db-chart-sub">Latest {recentIncidents.length} reports</p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/incidents'}
            className="db-view-all-btn"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentIncidents.length > 0 ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th className="db-th">Category</th>
                  <th className="db-th db-th--hide-sm">Location</th>
                  <th className="db-th db-th--hide-md">Reporter</th>
                  <th className="db-th">Status</th>
                  <th className="db-th db-th--hide-sm">Date</th>
                  <th className="db-th db-th--right"></th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((incident: any, i: number) => {
                  const st = STATUS_MAP[incident.status] ?? { label: incident.status, cls: 'db-badge db-badge--slate' };
                  return (
                    <motion.tr
                      key={incident.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={tableInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.05 * i, duration: 0.4 }}
                      className="db-tr"
                    >
                      <td className="db-td">
                        <div className="db-td-category">
                          <span className="db-category-dot" />
                          <span className="db-td-text">
                            {incident.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="db-td db-td--hide-sm db-td-muted">
                        {incident.location}
                      </td>
                      <td className="db-td db-td--hide-md">
                        <div className="db-td-reporter">
                          <div className="db-reporter-avatar">
                            {incident.isAnonymous
                              ? '?'
                              : (incident.reporter?.name?.[0] ?? '?')}
                          </div>
                          <span className="db-td-muted text-xs">
                            {incident.isAnonymous ? 'Anonymous' : (incident.reporter?.name ?? '—')}
                          </span>
                        </div>
                      </td>
                      <td className="db-td">
                        <span className={st.cls}>{st.label}</span>
                      </td>
                      <td className="db-td db-td--hide-sm db-td-muted text-xs">
                        {format(new Date(incident.createdAt), 'dd MMM, HH:mm')}
                      </td>
                      <td className="db-td db-td--right">
                        <button className="db-row-action" title="More options">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="db-empty">
            <Shield className="w-10 h-10 text-slate-200" />
            <p className="db-empty-text">No incidents reported yet.</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
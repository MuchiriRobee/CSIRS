import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState, FilterFn } from '@tanstack/react-table';
import { Skeleton } from '../ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../ui/select';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ArrowLeft, ArrowRight, Filter, X,
  PhoneCall, ShieldOff,
} from 'lucide-react';
import { useGetAllIncidentsQuery, useUpdateIncidentStatusMutation } from '../../api/incidentApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import IncidentDetailDialog from '../forms/IncidentDetailDialog';

/* ── Types ──────────────────────────────────────────────── */
type Incident = {
  id: string;
  category: string;
  location: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  isAnonymous?: boolean;
  createdAt: string;
  reporter?: { name: string; email: string; phone?: string } | null;
  reporterId?: string | null;
};

/* ── Config ─────────────────────────────────────────────── */
const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const STATUS_CFG: Record<string, { label: string; cls: string; selectCls: string }> = {
  PENDING: { label: 'Pending', cls: 'ai-badge ai-badge--amber', selectCls: 'ai-status-opt--amber' },
  IN_PROGRESS: { label: 'In Progress', cls: 'ai-badge ai-badge--blue', selectCls: 'ai-status-opt--blue' },
  RESOLVED: { label: 'Resolved', cls: 'ai-badge ai-badge--green', selectCls: 'ai-status-opt--green' },
  CLOSED: { label: 'Closed', cls: 'ai-badge ai-badge--slate', selectCls: 'ai-status-opt--slate' },
};

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'THEFT', label: 'Theft' },
  { value: 'PHYSICAL_ASSAULT', label: 'Physical Assault' },
  { value: 'SEXUAL_HARASSMENT', label: 'Sexual Harassment' },
  { value: 'FIRE_OUTBREAK', label: 'Fire Outbreak' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
  { value: 'CYBER_BULLYING', label: 'Cyberbullying' },
  { value: 'INFRASTRUCTURE_ISSUE', label: 'Infrastructure Issue' },
  { value: 'OTHER', label: 'Other' },
];

/* ── Sort icon ──────────────────────────────────────────── */
function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-amber-500" />;
  if (sorted === 'desc') return <ChevronDown className="w-3.5 h-3.5 text-amber-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
}

/* ── Phone button ───────────────────────────────────────── */
function PhoneCell({ phone }: { phone?: string | null }) {
  if (!phone) return <span className="ai-td-muted ai-td-nil">—</span>;
  return (
    <a
      href={`tel:${phone}`}
      className="ai-phone-btn"
      title={`Call ${phone}`}
      onClick={(e) => e.stopPropagation()}
    >
      <PhoneCall className="w-3.5 h-3.5" />
      <span>{phone}</span>
    </a>
  );
}

/* ── Inline status selector ─────────────────────────────── */
function StatusCell({
  incident, onUpdate, isUpdating,
}: {
  incident: Incident;
  onUpdate: (id: string, status: string) => void;
  isUpdating: boolean;
}) {
  const cfg = STATUS_CFG[incident.status] ?? STATUS_CFG.CLOSED;
  return (
    <Select
      value={incident.status}
      onValueChange={(v) => onUpdate(incident.id, v)}
      disabled={isUpdating}
    >
      <SelectTrigger className="ai-status-trigger">
        <SelectValue>
          <span className={cfg.cls}>{cfg.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="ai-status-dropdown">
        {STATUS_OPTIONS.map((s) => {
          const sc = STATUS_CFG[s];
          return (
            <SelectItem key={s} value={s} className="ai-status-item">
              <span className={sc.cls}>{sc.label}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/* ── Global filter fn (also searches reporter name) ─────── */
const reporterAwareFilter: FilterFn<Incident> = (row, _colId, filterValue: string) => {
  const q = filterValue.toLowerCase();
  const { category, location, description, reporter } = row.original;
  return (
    category.toLowerCase().includes(q) ||
    location.toLowerCase().includes(q) ||
    description.toLowerCase().includes(q) ||
    (reporter?.name ?? '').toLowerCase().includes(q)
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AllIncidentsTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data: response, isLoading, refetch } = useGetAllIncidentsQuery({ page: 1, limit: 100 });
  const incidents: Incident[] = useMemo(
    () => response?.data?.data || response?.data || [],
    [response],
  );
  console.log("Fetched incidents:", incidents); // Debug log to verify data structure
  const [updateStatus, { isLoading: isUpdating }] = useUpdateIncidentStatusMutation();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus as any, adminNotes: `Status changed to ${newStatus}` }).unwrap();
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  /* ── Columns ── */
  const columns: ColumnDef<Incident>[] = useMemo(() => [
    {
      accessorKey: 'category',
      header: 'Category',
      enableSorting: true,
      cell: ({ getValue }) => (
        <div className="ai-td-category">
          <span className="ai-category-dot" />
          <span className="ai-td-primary">{(getValue() as string).replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      enableSorting: false,
      cell: ({ getValue }) => <span className="ai-td-secondary">{getValue() as string}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      enableSorting: false,
      cell: ({ getValue }) => <p className="ai-td-desc">{getValue() as string}</p>,
    },
    {
      accessorKey: 'reporter',
      header: 'Reporter',
      enableSorting: true,
      sortingFn: (a, b) => {
        const na = a.original.reporter?.name ?? '';
        const nb = b.original.reporter?.name ?? '';
        return na.localeCompare(nb);
      },
      cell: ({ row }) => {
        const reporter = row.original.reporter;
        const isAnon = !row.original.reporterId;
        return (
          <div className="ai-td-reporter">
            <div className={`ai-reporter-avatar ${isAnon ? 'ai-reporter-avatar--anon' : ''}`}>
              {isAnon ? <ShieldOff className="w-3.5 h-3.5" /> : (reporter?.name?.[0]?.toUpperCase() ?? '?')}
            </div>
            <span className={isAnon ? 'ai-td-anon' : 'ai-td-reporter-name'}>
              {isAnon ? 'Anonymous' : (reporter?.name ?? 'Unknown')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      enableSorting: false,
      cell: ({ row }) => {
        const isAnon = !row.original.reporterId;
        if (isAnon) return <span className="ai-td-muted ai-td-nil">—</span>;
        return <PhoneCell phone={row.original.reporter?.phone} />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => (
        <StatusCell
          incident={row.original}
          onUpdate={handleStatusChange}
          isUpdating={isUpdating}
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Reported On',
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="ai-td-date">
          {format(new Date(getValue() as string), 'dd MMM yyyy')}
          <span className="ai-td-time">{format(new Date(getValue() as string), 'HH:mm')}</span>
        </span>
      ),
    },
  ], [isUpdating]);

  /* ── Filtered data ── */
  const filteredData = useMemo(() => {
    let r = incidents;
    if (statusFilter !== 'ALL') r = r.filter(i => i.status === statusFilter);
    if (categoryFilter !== 'ALL') r = r.filter(i => i.category === categoryFilter);
    return r;
  }, [incidents, statusFilter, categoryFilter]);

  /* ── Table ── */
  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { reporterAwareFilter },
    globalFilterFn: reporterAwareFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filteredData.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  const hasFilters = statusFilter !== 'ALL' || categoryFilter !== 'ALL' || !!globalFilter;
  const clearFilters = () => { setStatusFilter('ALL'); setCategoryFilter('ALL'); setGlobalFilter(''); };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="ai-skeleton-wrap">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="ai-skeleton-row" />)}
      </div>
    );
  }

  return (
    <div className="ai-table-section">

      {/* ── Controls ── */}
      <div className="ai-controls">
        <div className="ai-search-wrap">
          <Search className="ai-search-icon" />
          <input
            type="text"
            placeholder="Search category, location, description, reporter…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="ai-search-input"
          />
          {globalFilter && (
            <button onClick={() => setGlobalFilter('')} className="ai-search-clear">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="ai-controls-right">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`ai-filter-btn ${showFilters ? 'ai-filter-btn--active' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="ai-filter-dot" />}
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="ai-filter-panel"
          >
            <div className="ai-filter-inner">
              <div className="ai-filter-group">
                <label className="ai-filter-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="ai-filter-select"
                >
                  <option value="ALL">All Statuses</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="ai-filter-group">
                <label className="ai-filter-label">Category</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="ai-filter-select"
                >
                  {CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="ai-filter-group">
                <label className="ai-filter-label">Date Order</label>
                <button
                  onClick={() => setSorting([{
                    id: 'createdAt',
                    desc: !(sorting[0]?.id === 'createdAt' && sorting[0]?.desc),
                  }])}
                  className="ai-date-sort-btn"
                >
                  {sorting[0]?.id === 'createdAt' && sorting[0]?.desc
                    ? <><ChevronDown className="w-3.5 h-3.5 text-amber-500" /> Newest first</>
                    : <><ChevronUp className="w-3.5 h-3.5 text-amber-500" /> Oldest first</>
                  }
                </button>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="ai-clear-btn">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary strip ── */}
      <div className="ai-summary-strip">
        <span className="ai-summary-text">
          {total === 0 ? 'No results' : `${total} incident${total !== 1 ? 's' : ''} found`}
          {hasFilters && <span className="ai-summary-filtered"> · filtered</span>}
        </span>
        <div className="ai-summary-badges">
          {STATUS_OPTIONS.map(s => {
            const count = incidents.filter(i => i.status === s).length;
            const cfg = STATUS_CFG[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
                className={`ai-summary-badge ${statusFilter === s ? 'ai-summary-badge--active' : ''} ${cfg.cls}`}
              >
                {cfg.label} {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="ai-table-card">
        <div className="ai-table-scroll">
          <table className="ai-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      className={`ai-th ${header.column.getCanSort() ? 'ai-th--sortable' : ''}`}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="ai-th-inner">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <SortIcon sorted={header.column.getIsSorted()} />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              <AnimatePresence mode="wait">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.28 }}
                      className="ai-tr ai-tr--clickable"
                      onClick={() => setSelectedIncident(row.original)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="ai-td" onClick={cell.column.id === 'status' ? (e) => e.stopPropagation() : undefined}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="ai-empty-cell">
                      <div className="ai-empty">
                        <ShieldOff className="w-9 h-9 text-slate-200" />
                        <p className="ai-empty-title">No incidents found</p>
                        <p className="ai-empty-sub">
                          {hasFilters ? 'Try adjusting your filters or search term.' : 'No incidents have been reported yet.'}
                        </p>
                        {hasFilters && (
                          <button onClick={clearFilters} className="ai-empty-clear">Clear filters</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="ai-pagination">
          <span className="ai-pagination-info">
            {total > 0 ? `Showing ${from}–${to} of ${total} incidents` : 'No results'}
          </span>

          <div className="ai-pagination-controls">
            <div className="ai-page-nums">
              {Array.from({ length: table.getPageCount() }, (_, i) => i)
                .slice(Math.max(0, pageIndex - 2), Math.min(table.getPageCount(), pageIndex + 3))
                .map(i => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`ai-page-num ${pageIndex === i ? 'ai-page-num--active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
            </div>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="ai-page-arrow">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="ai-page-arrow">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <IncidentDetailDialog
        incident={selectedIncident}
        open={!!selectedIncident}
        onOpenChange={(open) => { if (!open) setSelectedIncident(null); }}
        onSuccess={refetch}
      />
    </div>
  );
}
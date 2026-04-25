import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger, 
} from '../ui/alert-dialog';
import {
  Search, Trash2, Plus, ChevronUp, ChevronDown,
  ChevronsUpDown, ArrowLeft, ArrowRight, Filter,
  FileText, ShieldAlert, X, MessageSquare,
} from 'lucide-react';
import { useGetMyReportsQuery } from '../../api/incidentApi';
import ReportIncidentDialog from '../forms/ReportIncidentDialog';
import IncidentDetailDialog from '../forms/IncidentDetailDialog';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ──────────────────────────────────────────────── */
type Incident = {
  id: string;
  category: string;
  location: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
};

/* ── Status config ──────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:     { label: 'Pending',     cls: 'mr-badge mr-badge--amber' },
  IN_PROGRESS: { label: 'In Progress', cls: 'mr-badge mr-badge--blue'  },
  RESOLVED:    { label: 'Resolved',    cls: 'mr-badge mr-badge--green' },
  CLOSED:      { label: 'Closed',      cls: 'mr-badge mr-badge--slate' },
};

/* ── Category options ───────────────────────────────────── */
const CATEGORIES = [
  { value: 'ALL',                   label: 'All Categories' },
  { value: 'THEFT',                 label: 'Theft' },
  { value: 'PHYSICAL_ASSAULT',      label: 'Physical Assault' },
  { value: 'SEXUAL_HARASSMENT',     label: 'Sexual Harassment' },
  { value: 'FIRE_OUTBREAK',         label: 'Fire Outbreak' },
  { value: 'MEDICAL_EMERGENCY',     label: 'Medical Emergency' },
  { value: 'PROPERTY_DAMAGE',       label: 'Property Damage' },
  { value: 'CYBER_BULLYING',        label: 'Cyberbullying' },
  { value: 'INFRASTRUCTURE_ISSUE',  label: 'Infrastructure Issue' },
  { value: 'OTHER',                 label: 'Other' },
];

/* ── Sort icon helper ───────────────────────────────────── */
function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc')  return <ChevronUp   className="w-3.5 h-3.5 text-amber-500" />;
  if (sorted === 'desc') return <ChevronDown  className="w-3.5 h-3.5 text-amber-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
}

/* ── Main component ─────────────────────────────────────── */
export default function MyReportsTable() {
  const [globalFilter,    setGlobalFilter]    = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('ALL');
  const [statusFilter,    setStatusFilter]    = useState('ALL');
  const [sorting,         setSorting]         = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data: response, isLoading, refetch } = useGetMyReportsQuery(undefined);

  const reports: Incident[] = useMemo(() => {
    if (!response) return [];
    return response.data?.data || response.data || [];
  }, [response]);

  useEffect(() => { refetch(); }, [refetch]);

  /* ── Filtered data ─────────────────────────────────────── */
  const filteredData = useMemo(() => {
    let result = reports;
    if (categoryFilter !== 'ALL') result = result.filter(r => r.category === categoryFilter);
    if (statusFilter   !== 'ALL') result = result.filter(r => r.status   === statusFilter);
    return result;
  }, [reports, categoryFilter, statusFilter]);

  /* ── Columns ───────────────────────────────────────────── */
  const columns: ColumnDef<Incident>[] = useMemo(() => [
    {
      accessorKey: 'category',
      header: 'Category',
      enableSorting: true,
      cell: ({ getValue }) => (
        <div className="mr-td-category">
          <span className="mr-category-dot" />
          <span className="mr-td-primary">{(getValue() as string).replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="mr-td-secondary">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="mr-td-desc">{getValue() as string}</p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const s = getValue() as string;
        const cfg = STATUS_CFG[s] ?? { label: s, cls: 'mr-badge mr-badge--slate' };
        return <span className={cfg.cls}>{cfg.label}</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Reported On',
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="mr-td-date">
          {format(new Date(getValue() as string), 'dd MMM yyyy')}<br />
          <span className="mr-td-time">{format(new Date(getValue() as string), 'HH:mm')}</span>
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const incident = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIncident(incident)}
              className="mr-view-btn p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              title="View details & comments"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="mr-delete-btn" title="Delete report" aria-label="Delete report">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="mr-alert-dialog">
            <AlertDialogHeader>
              <div className="mr-alert-icon">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <AlertDialogTitle className="mr-alert-title">Delete this report?</AlertDialogTitle>
              <AlertDialogDescription className="mr-alert-desc">
                This action cannot be undone. The report will be permanently removed from your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mr-alert-footer">
              <AlertDialogCancel className="mr-alert-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => console.log('Delete incident:', row.original.id)}
                className="mr-alert-confirm"
              >
                Yes, delete it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
        );
      },
    },
  ], []);

  /* ── Table instance ────────────────────────────────────── */
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange:      setSorting,
    initialState: { pagination: { pageSize: 8 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filteredData.length;
  const from = pageIndex * pageSize + 1;
  const to   = Math.min((pageIndex + 1) * pageSize, totalRows);

  const hasActiveFilters = categoryFilter !== 'ALL' || statusFilter !== 'ALL' || globalFilter;

  const clearFilters = () => {
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setGlobalFilter('');
  };

  /* ── Loading skeleton ─────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="mr-skeleton-wrap">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="mr-skeleton-row" />
        ))}
      </div>
    );
  }

  return (
    <div className="mr-table-section">

      {/* ── Controls bar ── */}
      <div className="mr-controls">
        {/* Search */}
        <div className="mr-search-wrap">
          <Search className="mr-search-icon" />
          <input
            type="text"
            placeholder="Search reports…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="mr-search-input"
          />
          {globalFilter && (
            <button onClick={() => setGlobalFilter('')} className="mr-search-clear">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle + New Report */}
        <div className="mr-controls-right">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`mr-filter-btn ${showFilters ? 'mr-filter-btn--active' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && <span className="mr-filter-indicator" />}
          </button>

          <ReportIncidentDialog
            onSuccess={refetch}
            trigger={
              <button className="mr-new-btn">
                <Plus className="w-4 h-4" />
                New Report
              </button>
            }
          />
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
            className="mr-filter-panel"
          >
            <div className="mr-filter-inner">
              <div className="mr-filter-group">
                <label className="mr-filter-label">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mr-filter-select"
                >
                  {CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mr-filter-group">
                <label className="mr-filter-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mr-filter-select"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="mr-clear-filters-btn">
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table card ── */}
      <div className="mr-table-card">
        <div className="mr-table-scroll">
          <table className="mr-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      className={`mr-th ${header.column.getCanSort() ? 'mr-th--sortable' : ''}`}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="mr-th-inner">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon sorted={header.column.getIsSorted()} />
                        )}
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
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="mr-tr"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="mr-td">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="mr-empty-cell">
                      <div className="mr-empty">
                        <FileText className="w-9 h-9 text-slate-200" />
                        <p className="mr-empty-title">No reports found</p>
                        <p className="mr-empty-sub">
                          {hasActiveFilters
                            ? 'Try adjusting your filters or search term.'
                            : "You haven't filed any reports yet."}
                        </p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="mr-empty-clear">
                            Clear filters
                          </button>
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
        <div className="mr-pagination">
          <span className="mr-pagination-info">
            {totalRows === 0
              ? 'No results'
              : `Showing ${from}–${to} of ${totalRows} report${totalRows !== 1 ? 's' : ''}`}
          </span>

          <div className="mr-pagination-controls">
            {/* Page numbers */}
            <div className="mr-page-nums">
              {Array.from({ length: table.getPageCount() }, (_, i) => (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(i)}
                  className={`mr-page-num ${pageIndex === i ? 'mr-page-num--active' : ''}`}
                >
                  {i + 1}
                </button>
              )).slice(
                Math.max(0, pageIndex - 2),
                Math.min(table.getPageCount(), pageIndex + 3)
              )}
            </div>

            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="mr-page-arrow"
              aria-label="Previous page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="mr-page-arrow"
              aria-label="Next page"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
            {/* Incident Detail Dialog */}
      <IncidentDetailDialog
        incident={selectedIncident}
        open={!!selectedIncident}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIncident(null);
          }
        }}
        onSuccess={() => {
          // Optional: refresh table if needed
        }}
      />
    </div>
  );
}
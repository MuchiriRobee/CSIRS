import { useState, useMemo } from 'react';
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
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../ui/select';
import {
  Search, X, Filter, ChevronUp, ChevronDown,
  ChevronsUpDown, ArrowLeft, ArrowRight,
  ShieldCheck, UserCircle2, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useGetAllUsersQuery, useUpdateUserRoleMutation } from '../../api/userApi';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ──────────────────────────────────────────────── */
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'REPORTER' | 'ADMIN';
  createdAt: string;
};

/* ── Sort icon ──────────────────────────────────────────── */
function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc')  return <ChevronUp   className="w-3.5 h-3.5 text-amber-500" />;
  if (sorted === 'desc') return <ChevronDown  className="w-3.5 h-3.5 text-amber-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
}

/* ── Avatar colour from name initial ───────────────────── */
const AVATAR_PALETTES = [
  ['#fef3c7', '#b45309'],
  ['#eff6ff', '#1d4ed8'],
  ['#f0fdf4', '#15803d'],
  ['#fdf4ff', '#7e22ce'],
  ['#fff1f2', '#be123c'],
  ['#ecfeff', '#0e7490'],
];

function avatarColors(name: string) {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

/* ── Role badge ─────────────────────────────────────────── */
function RoleBadge({ role }: { role: 'REPORTER' | 'ADMIN' }) {
  return role === 'ADMIN' ? (
    <span className="au-role-badge au-role-badge--admin">
      <ShieldCheck className="w-3 h-3" /> Admin
    </span>
  ) : (
    <span className="au-role-badge au-role-badge--reporter">
      <UserCircle2 className="w-3 h-3" /> Reporter
    </span>
  );
}

/* ── Role selector cell ─────────────────────────────────── */
function RoleCell({
  user, onUpdate, isUpdating,
}: {
  user: User;
  onUpdate: (id: string, role: 'REPORTER' | 'ADMIN') => void;
  isUpdating: boolean;
}) {
  return (
    <Select
      value={user.role}
      onValueChange={(v: 'REPORTER' | 'ADMIN') => onUpdate(user.id, v)}
      disabled={isUpdating}
    >
      <SelectTrigger className="au-role-trigger">
        <SelectValue>
        <RoleBadge role={user.role} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="au-role-dropdown">
        <SelectItem value="REPORTER" className="au-role-item">
          <RoleBadge role="REPORTER" />
        </SelectItem>
        <SelectItem value="ADMIN" className="au-role-item">
          <RoleBadge role="ADMIN" />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function AllUsersTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter,   setRoleFilter]   = useState<'ALL' | 'REPORTER' | 'ADMIN'>('ALL');
  const [sorting,      setSorting]      = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [showFilters,  setShowFilters]  = useState(false);

  const { data: response, isLoading, refetch } = useGetAllUsersQuery(undefined);
  const allUsers: User[] = useMemo(
    () => response?.data?.data || response?.data || [],
    [response],
  );

  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const handleRoleChange = async (id: string, newRole: 'REPORTER' | 'ADMIN') => {
    try {
      await updateUserRole({ id, role: newRole }).unwrap();
      toast.success(`Role updated to ${newRole}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update role');
    }
  };

  /* ── Derived counts ── */
  const adminCount    = allUsers.filter(u => u.role === 'ADMIN').length;
  const reporterCount = allUsers.filter(u => u.role === 'REPORTER').length;

  /* ── Filtered data ── */
  const filteredData = useMemo(() => {
    let r = allUsers;
    if (roleFilter !== 'ALL') r = r.filter(u => u.role === roleFilter);
    return r;
  }, [allUsers, roleFilter]);

  /* ── Columns ── */
  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'User',
      enableSorting: true,
      cell: ({ row }) => {
        const { name, email } = row.original;
        const [bg, fg] = avatarColors(name);
        return (
          <div className="au-td-user">
            <div className="au-user-avatar" style={{ background: bg, color: fg }}>
              {name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="au-user-info">
              <span className="au-user-name">{name}</span>
              <span className="au-user-email">{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      // Hidden visually — used only for global filter, rendered in 'name' cell above
      cell: () => null,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      enableSorting: false,
      cell: ({ getValue }) => {
        const phone = getValue() as string | null | undefined;
        return phone
          ? <span className="au-td-phone">{phone}</span>
          : <span className="au-td-nil">—</span>;
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      cell: ({ row }) => (
        <RoleCell user={row.original} onUpdate={handleRoleChange} isUpdating={isUpdating} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined On',
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="au-td-date">
          {format(new Date(getValue() as string), 'dd MMM yyyy')}
          <span className="au-td-time">{format(new Date(getValue() as string), 'HH:mm')}</span>
        </span>
      ),
    },
  ], [isUpdating]);

  /* ── Table (hide email col — it's embedded in name cell) ── */
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
    initialState: {
      pagination: { pageSize: 10 },
      columnVisibility: { email: false },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filteredData.length;
  const from  = pageIndex * pageSize + 1;
  const to    = Math.min((pageIndex + 1) * pageSize, total);

  const hasFilters = roleFilter !== 'ALL' || !!globalFilter;
  const clearFilters = () => { setRoleFilter('ALL'); setGlobalFilter(''); };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="au-skeleton-wrap">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="au-skeleton-row" />)}
      </div>
    );
  }

  return (
    <div className="au-table-section">

      {/* ── Stat cards ── */}
      <div className="au-stat-row">
        {[
          { label: 'Total Users',  value: allUsers.length,  cls: 'au-stat--navy'     },
          { label: 'Admins',       value: adminCount,       cls: 'au-stat--amber'    },
          { label: 'Reporters',    value: reporterCount,    cls: 'au-stat--slate'    },
        ].map(({ label, value, cls }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`au-stat-card ${cls}`}
          >
            <span className="au-stat-value">{value}</span>
            <span className="au-stat-label">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="au-controls">
        <div className="au-search-wrap">
          <Search className="au-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="au-search-input"
          />
          {globalFilter && (
            <button onClick={() => setGlobalFilter('')} className="au-search-clear">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="au-controls-right">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`au-filter-btn ${showFilters ? 'au-filter-btn--active' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="au-filter-dot" />}
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
            className="au-filter-panel"
          >
            <div className="au-filter-inner">

              {/* Role filter */}
              <div className="au-filter-group">
                <label className="au-filter-label">Role</label>
                <div className="au-role-pills">
                  {(['ALL', 'REPORTER', 'ADMIN'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`au-role-pill ${roleFilter === r ? 'au-role-pill--active' : ''} ${r === 'ADMIN' ? 'au-role-pill--admin' : r === 'REPORTER' ? 'au-role-pill--reporter' : 'au-role-pill--all'}`}
                    >
                      {r === 'ALL' ? 'All Roles' : r === 'ADMIN'
                        ? <><ShieldCheck className="w-3 h-3" /> Admin</>
                        : <><UserCircle2 className="w-3 h-3" /> Reporter</>
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Date sort */}
              <div className="au-filter-group">
                <label className="au-filter-label">Join Date Order</label>
                <button
                  onClick={() => setSorting([{
                    id: 'createdAt',
                    desc: !(sorting[0]?.id === 'createdAt' && sorting[0]?.desc),
                  }])}
                  className="au-date-sort-btn"
                >
                  {sorting[0]?.id === 'createdAt' && sorting[0]?.desc
                    ? <><ChevronDown className="w-3.5 h-3.5 text-amber-500" /> Newest first</>
                    : <><ChevronUp   className="w-3.5 h-3.5 text-amber-500" /> Oldest first</>
                  }
                </button>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="au-clear-btn">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table card ── */}
      <div className="au-table-card">
        <div className="au-table-scroll">
          <table className="au-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => {
                    if (header.column.id === 'email') return null;
                    return (
                      <th
                        key={header.id}
                        className={`au-th ${header.column.getCanSort() ? 'au-th--sortable' : ''}`}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="au-th-inner">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <SortIcon sorted={header.column.getIsSorted()} />}
                        </span>
                      </th>
                    );
                  })}
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
                      transition={{ delay: i * 0.035, duration: 0.28 }}
                      className="au-tr"
                    >
                      {row.getVisibleCells().map(cell => {
                        if (cell.column.id === 'email') return null;
                        return (
                          <td key={cell.id} className="au-td">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="au-empty-cell">
                      <div className="au-empty">
                        <Users className="w-9 h-9 text-slate-200" />
                        <p className="au-empty-title">No users found</p>
                        <p className="au-empty-sub">
                          {hasFilters ? 'Try adjusting your filters or search term.' : 'No users in the system yet.'}
                        </p>
                        {hasFilters && (
                          <button onClick={clearFilters} className="au-empty-clear">Clear filters</button>
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
        <div className="au-pagination">
          <span className="au-pagination-info">
            {total > 0 ? `Showing ${from}–${to} of ${total} user${total !== 1 ? 's' : ''}` : 'No results'}
          </span>

          <div className="au-pagination-controls">
            <div className="au-page-nums">
              {Array.from({ length: table.getPageCount() }, (_, i) => i)
                .slice(Math.max(0, pageIndex - 2), Math.min(table.getPageCount(), pageIndex + 3))
                .map(i => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`au-page-num ${pageIndex === i ? 'au-page-num--active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
            </div>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="au-page-arrow">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="au-page-arrow">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/components/tables/AllIncidentsTable.tsx
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Search } from 'lucide-react';
import { useGetAllIncidentsQuery, useUpdateIncidentStatusMutation } from '../../api/incidentApi';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Incident = {
  id: string;
  category: string;
  location: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  reporter?: { name: string } | null;   // ← Added
  reporterId?: string | null;
};

const statusOptions = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-100 text-slate-800',
};

export default function AllIncidentsTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const { data: response, isLoading, refetch } = useGetAllIncidentsQuery({ page: 1, limit: 100 });

// Extract the actual array
  const incidents = response?.data?.data || response?.data || [];

  const [updateStatus, { isLoading: isUpdating }] = useUpdateIncidentStatusMutation();

  const handleStatusChange = async (incidentId: string, newStatus: string) => {
    try {
      await updateStatus({ 
        id: incidentId, 
        status: newStatus as any, 
        adminNotes: `Status changed to ${newStatus}`, 
      }).unwrap();
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

const columns: ColumnDef<Incident>[] = useMemo(() => [
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'location', header: 'Location' },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ getValue }) => <div className="max-w-md truncate">{getValue() as string}</div>,
  },
  {
    accessorKey: 'reporter',                    // ← NEW COLUMN
    header: 'Reporter',
    cell: ({ row }) => {
      const reporter = row.original.reporter;
      const isAnonymous = !row.original.reporterId;
      return (
        <div className="font-medium">
          {isAnonymous ? (
            <span className="text-muted-foreground italic">Anonymous</span>
          ) : (
            reporter?.name || 'Unknown'
          )}
        </div>
      );
    },
  },
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.original.status;
    return (
      <Select 
        value={status} 
        onValueChange={(value) => handleStatusChange(row.original.id, value)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-44">
          <SelectValue>
            <Badge 
              variant="outline" 
              className={statusColors[status] || 'bg-gray-100'}
            >
              {status.replace('_', ' ')}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
},
  {
    accessorKey: 'createdAt',
    header: 'Reported On',
    cell: ({ getValue }) => format(new Date(getValue() as string), 'dd MMM yyyy, HH:mm'),
  },
], [isUpdating]);

const filteredData = useMemo(() => {
  let result = incidents as Incident[];   // Now safe
  if (statusFilter !== 'ALL') {
    result = result.filter(r => r.status === statusFilter);
  }
  if (categoryFilter !== 'ALL') {
    result = result.filter(r => r.category === categoryFilter);
  }
  return result;
}, [incidents, statusFilter, categoryFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) {
    return <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-input rounded-xl px-4 py-2 text-sm"
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-input rounded-xl px-4 py-2 text-sm"
          >                {/*  
   THEFT
  PHYSICAL_ASSAULT
  SEXUAL_HARASSMENT
  FIRE_OUTBREAK
  MEDICAL_EMERGENCY
  PROPERTY_DAMAGE
  CYBER_BULLYING
  INFRASTRUCTURE_ISSUE
  OTHER */} 
            <option value="ALL">All Categories</option>
            <option value="THEFT">Theft</option>
            <option value="PHYSICAL_ASSAULT">Physical Assault</option>
            <option value="SEXUAL_HARASSMENT">Sexual Harassment</option>
            <option value="FIRE_OUTBREAK">Fire Outbreak</option>
            <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
              <option value="PROPERTY_DAMAGE">Property Damage</option>
              <option value="CYBER_BULLYING">Cyberbullying</option>
              <option value="INFRASTRUCTURE_ISSUE">Infrastructure Issue</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b hover:bg-slate-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    No incidents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
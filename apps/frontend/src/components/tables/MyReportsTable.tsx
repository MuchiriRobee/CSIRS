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
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Search, Trash2, Plus } from 'lucide-react';
import { useGetMyReportsQuery } from '../../api/incidentApi';
import ReportIncidentDialog from '../forms/ReportIncidentDialog';
import { format } from 'date-fns'; // npm install date-fns

type Incident = {
  id: string;
  category: string;
  location: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  // attachments?: any[];
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function MyReportsTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // With this corrected version:
const { data: response, isLoading, refetch } = useGetMyReportsQuery(undefined);
// Extract the actual incidents array
  const reports: Incident[] = useMemo(() => {
    if (!response) return [];
    return response.data?.data || response.data || [];
  }, [response]);

  console.log("MyReports data from API:", reports);
  const columns: ColumnDef<Incident>[] = useMemo(() => [
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <div className="max-w-xs truncate">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge variant="outline" className={statusColors[status] || 'bg-gray-100'}>
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Reported On',
      cell: ({ getValue }) => format(new Date(getValue() as string), 'dd MMM yyyy, HH:mm'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The report will be soft deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  // TODO: Call delete mutation when you add the endpoint
                  console.log('Delete incident:', row.original.id);
                  // refetch();
                }}
                className="bg-destructive"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ], []);

const filteredData = useMemo(() => {
  let result = reports || [];
  if (categoryFilter !== 'ALL') {
    result = result.filter((r: any) => r.category === categoryFilter);
  }
  return result;
}, [reports, categoryFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-input rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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


        <ReportIncidentDialog 
          onSuccess={refetch}
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Report
            </Button>
          }
        />
      </div>

      {/* Table */}
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
                  <tr key={row.id} className="border-b hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} of{' '}
            {filteredData.length} reports
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
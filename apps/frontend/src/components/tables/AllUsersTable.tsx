// src/components/tables/AllUsersTable.tsx
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
import { Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useGetAllUsersQuery, useUpdateUserRoleMutation } from '../../api/userApi';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'REPORTER' | 'ADMIN';
  createdAt: string;
};

export default function AllUsersTable() {
  const [globalFilter, setGlobalFilter] = useState('');

const { data: response, isLoading, refetch } = useGetAllUsersQuery(undefined);

// Extract the actual array
const users: User[] = response?.data?.data || response?.data || [];
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const handleRoleChange = async (userId: string, newRole: 'REPORTER' | 'ADMIN') => {
    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
      toast.success(`Role successfully updated to ${newRole}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user role');
    }
  };

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Full Name',
      cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const currentRole = row.original.role;
        return (
          <Select 
            value={currentRole} 
            onValueChange={(value: 'REPORTER' | 'ADMIN') => handleRoleChange(row.original.id, value)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
              <Badge 
                variant="outline" 
                className={currentRole === 'ADMIN' 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-slate-100 text-slate-700'}
              >
                {currentRole}
              </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REPORTER">REPORTER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined On',
      cell: ({ getValue }) => format(new Date(getValue() as string), 'dd MMM yyyy'),
    },
  ], [isUpdating]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-600"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} users
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
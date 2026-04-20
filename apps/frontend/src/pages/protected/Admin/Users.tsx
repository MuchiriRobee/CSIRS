import AllUsersTable from '../../../components/tables/AllUsersTable';
import { Users } from 'lucide-react';

export default function AdminUsers() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-semibold text-primary">All Users</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Manage users and their roles across the campus
        </p>
      </div>

      <AllUsersTable />
    </div>
  );
}
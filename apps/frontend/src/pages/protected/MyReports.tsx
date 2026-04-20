import MyReportsTable from '../../components/tables/MyReportsTable';
import { Shield } from 'lucide-react';

export default function MyReports() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-semibold text-primary">My Reports</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Track and manage all incidents you have reported
        </p>
      </div>

      <MyReportsTable />
    </div>
  );
}
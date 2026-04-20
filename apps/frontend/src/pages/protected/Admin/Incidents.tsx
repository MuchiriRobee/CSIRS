import AllIncidentsTable from '../../../components/tables/AllIncidentsTable';
import { Shield } from 'lucide-react';

export default function AdminIncidents() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-semibold text-primary">All Incidents</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Manage and update the status of all reported incidents
        </p>
      </div>

      <AllIncidentsTable />
    </div>
  );
}
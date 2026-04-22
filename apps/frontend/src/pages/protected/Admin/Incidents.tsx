import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import AllIncidentsTable from '../../../components/tables/AllIncidentsTable';

export default function AdminIncidents() {
  return (
    <div className="ai-page">
      <div className="ai-bg-blobs" aria-hidden="true">
        <div className="ai-blob ai-blob-1" />
        <div className="ai-blob ai-blob-2" />
      </div>

      <div className="ai-page-inner">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="ai-header"
        >
          <div className="ai-header-left">
            <div className="ai-header-icon">
              <ShieldAlert className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="ai-page-title">All Incidents</h1>
              <p className="ai-page-sub">
                Review, filter, and update the status of every campus incident report.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <AllIncidentsTable />
        </motion.div>
      </div>
    </div>
  );
}
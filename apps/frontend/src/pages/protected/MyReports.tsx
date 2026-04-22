import { Shield, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import MyReportsTable from '../../components/tables/MyReportsTable';
import { useAuth } from '../../providers/AuthProvider';


export default function MyReports() {
  const { user } = useAuth();

  return (
    <div className="mr-page">
      {/* Background blobs */}
      <div className="mr-bg-blobs" aria-hidden="true">
        <div className="mr-blob mr-blob-1" />
        <div className="mr-blob mr-blob-2" />
      </div>

      <div className="mr-page-inner">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mr-header"
        >
          <div className="mr-header-left">
            <div className="mr-header-icon">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="mr-page-title">My Reports</h1>
              <p className="mr-page-sub">
                Welcome back,&nbsp;
                <span className="mr-page-sub-name">{user?.name?.split(' ')[0] ?? 'there'}</span>
                &nbsp;— track and manage your incident reports below.
              </p>
            </div>
          </div>

          {/* Quick stat pills */}
          <div className="mr-header-pills">
            <div className="mr-stat-pill mr-stat-pill--amber">
              <FileText className="w-3.5 h-3.5" />
              <span>All Reports</span>
            </div>
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <MyReportsTable />
        </motion.div>
        
      </div>
      
    </div>
  );
}
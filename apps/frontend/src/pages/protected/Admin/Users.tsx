import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import AllUsersTable from '../../../components/tables/AllUsersTable';

export default function AdminUsers() {
  return (
    <div className="au-page">
      <div className="au-bg-blobs" aria-hidden="true">
        <div className="au-blob au-blob-1" />
        <div className="au-blob au-blob-2" />
      </div>

      <div className="au-page-inner">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="au-header"
        >
          <div className="au-header-left">
            <div className="au-header-icon">
              <Users className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="au-page-title">All Users</h1>
              <p className="au-page-sub">
                Manage user accounts and assign roles across the campus safety network.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <AllUsersTable />
        </motion.div>
      </div>
    </div>
  );
}
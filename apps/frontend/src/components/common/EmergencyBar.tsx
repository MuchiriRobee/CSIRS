import { Phone, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmergencyBar() {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-red-600 text-white py-2.5 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm font-medium">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>EMERGENCY: Campus Security Hotline</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="tel:0700123456" className="flex items-center gap-2 hover:underline">
            <Phone className="w-4 h-4" />
            <span>0700 123 456 (Security)</span>
          </a>
          <a href="tel:999" className="flex items-center gap-2 hover:underline">
            <Phone className="w-4 h-4" />
            <span>999 (Police)</span>
          </a>
          <a href="tel:119" className="flex items-center gap-2 hover:underline">
            <Phone className="w-4 h-4" />
            <span>119 (Fire/Ambulance)</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
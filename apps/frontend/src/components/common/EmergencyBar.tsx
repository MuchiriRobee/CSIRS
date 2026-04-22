import { Phone, AlertTriangle, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const contacts = [
  { label: 'Security', number: '0700 123 456', tel: '0700123456' },
  { label: 'Police', number: '999', tel: '999' },
  { label: 'Fire & Ambulance', number: '119', tel: '119' },
];

export default function EmergencyBar() {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="emergency-bar sticky top-0 z-50"
    >
      {/* Animated shimmer overlay */}
      <div className="emergency-shimmer" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-4">
        {/* Left — alert pulse */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <AlertTriangle className="w-3.5 h-3.5 text-white/90" />
          <span className="text-white font-semibold text-[11px] sm:text-xs tracking-widest uppercase hidden sm:inline">
            Campus Emergency
          </span>
          <span className="text-white font-semibold text-[11px] tracking-widest uppercase sm:hidden">
            Emergency
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-white/25 hidden sm:block" />

        {/* Right — contacts */}
        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none">
          {contacts.map(({ label, number, tel }, i) => (
            <motion.a
              key={tel}
              href={`tel:${tel}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="emergency-contact group flex items-center gap-1.5 text-white/90 hover:text-white transition-colors shrink-0"
            >
              <span className="emergency-phone-icon">
                <Phone className="w-3 h-3" />
              </span>
              <span className="hidden md:inline text-[11px] font-medium">{label}:</span>
              <span className="text-[11px] font-bold tracking-tight">{number}</span>
            </motion.a>
          ))}
        </div>

        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 ml-2">
          <Radio className="w-3 h-3 text-white/60 animate-pulse" />
          <span className="text-white/60 text-[10px] font-medium tracking-widest uppercase">Live</span>
        </div>
      </div>
    </motion.div>
  );
}
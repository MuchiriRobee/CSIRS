import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Shield, AlertTriangle, Users, Clock } from 'lucide-react';
import ReportIncidentDialog from '../../components/forms/ReportIncidentDialog';
// import EmergencyBar from '../../components/common/EmergencyBar';
// import Navbar from '../../components/common/Navbar';
// import Footer from '../../components/common/Footer';

const quickCategories = [
  { 
    title: "Medical Emergency", 
    icon: AlertTriangle, 
    color: "bg-red-100 text-red-700",
    desc: "Injuries, health crises"
  },
  { 
    title: "Safety / Security Hazard", 
    icon: Shield, 
    color: "bg-orange-100 text-orange-700",
    desc: "Suspicious activity, broken locks"
  },
  { 
    title: "Mental Health Concern", 
    icon: Users, 
    color: "bg-blue-100 text-blue-700",
    desc: "Self or peer well-being"
  },
  { 
    title: "Facility Damage", 
    icon: Clock, 
    color: "bg-amber-100 text-amber-700",
    desc: "Leaks, vandalism, equipment failure"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">


      {/* HERO SECTION */}
      <section className="hero-bg text-white py-24 md:py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
              <span className="text-xs font-medium tracking-widest">TVET INSTITUTIONS</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Your Safety.<br />Our Priority.
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto mb-10">
              Report incidents quickly and anonymously. 
              Help us keep our campus safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ReportIncidentDialog />
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-7 rounded-2xl"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK REPORT CATEGORIES */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-primary mb-3">Quick Report Categories</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Choose a category to start your report instantly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickCategories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white border border-slate-200 rounded-3xl p-8 hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => {/* Will open dialog with pre-filled category in future */}}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${cat.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary mb-2">{cat.title}</h3>
                  <p className="text-muted-foreground">{cat.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <ReportIncidentDialog />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 bg-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-muted-foreground text-sm tracking-widest">TRUSTED BY TVET INSTITUTIONS ACROSS KENYA</p>
        </div>
      </section>

    </div>
  );
}
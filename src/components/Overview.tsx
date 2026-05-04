import * as React from 'react';
import { useState, useEffect } from 'react';
import { Project, ProjectService } from '../services/projectService';
import { 
  Camera, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  ListTodo, 
  Archive,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Overview() {
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [finishedProjects, setFinishedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubActive = ProjectService.subscribeToProjects((data) => {
      setActiveProjects(data);
      if (data.length >= 0) setLoading(false);
    }, 'active', (error) => {
      console.error("Overview active projects error:", error);
      setLoading(false);
    });
    
    const unsubFinished = ProjectService.subscribeToProjects((data) => {
      setFinishedProjects(data);
    }, 'finished', (error) => {
      console.error("Overview finished projects error:", error);
    });

    return () => {
      unsubActive();
      unsubFinished();
    };
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyFinished = finishedProjects.filter(p => {
    if (!p.finishedAt) return false;
    const date = p.finishedAt.toDate();
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const onProgressCount = activeProjects.filter(p => p.progressStatus === 'on_progress').length;
  const pendingCount = activeProjects.filter(p => p.progressStatus === 'pending').length;

  const totalMonthlyFiles = monthlyFinished.reduce((acc, p) => acc + (p.totalFiles || 0), 0);

  if (loading) {
    return <div className="p-8"><div className="h-4 w-32 bg-white/5 animate-pulse" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="noir-label mb-2">Workspace Overview</p>
        <h2 className="text-4xl font-bold tracking-tight text-white">Dashboard Studio</h2>
      </motion.header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <CheckCircle2 className="h-6 w-6 text-white" />, label: 'This Month', value: monthlyFinished.length, sub: 'Project Selesai Bulan Ini' },
          { icon: <BarChart3 className="h-6 w-6 text-white" />, label: 'Files Handled', value: totalMonthlyFiles.toLocaleString(), sub: 'Total RAW Terproses' },
          { icon: <Clock className="h-6 w-6 text-white animate-pulse" />, label: 'Active Load', value: onProgressCount, sub: 'Project Sedang Dikerjakan' },
        ].map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`noir-card p-8 ${index === 2 ? 'border-white/20 bg-white/[0.02]' : 'bg-white/5 border-white/10'}`}
          >
            <div className="flex justify-between items-start mb-6">
              {stat.icon}
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{stat.label}</span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-xs text-white/40 uppercase tracking-tighter">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        {/* On Progress List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
           <div className="flex items-center gap-3">
             <ListTodo className="h-4 w-4 text-white/20" />
             <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold">Currently On Progress</h3>
           </div>
           
           <div className="space-y-4">
             {activeProjects.filter(p => p.progressStatus === 'on_progress').length === 0 ? (
               <div className="p-8 border border-dashed border-white/5 text-center">
                 <p className="text-xs italic text-white/20">Semua project masih antri atau selesai.</p>
               </div>
             ) : (
               activeProjects.filter(p => p.progressStatus === 'on_progress').map((project, index) => (
                 <motion.div 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 + index * 0.05 }}
                   key={project.id}
                   className="noir-card p-6 flex items-center justify-between group hover:bg-white/5"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                       <Camera className="h-3 w-3 text-white/30" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white">{project.name}</p>
                       <p className="text-[9px] uppercase tracking-widest text-white/20 mt-1">
                         {project.projectType} • {project.totalFiles} Files
                       </p>
                     </div>
                   </div>
                   <span className="text-[9px] px-2 py-1 bg-white text-black font-bold uppercase">Working</span>
                 </motion.div>
               ))
             )}
           </div>
        </motion.div>

        {/* Pending / Idle */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
           <div className="flex items-center gap-3">
             <AlertCircle className="h-4 w-4 text-white/20" />
             <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold">Queue / Pending</h3>
           </div>

           <div className="space-y-4 opacity-60">
             {activeProjects.filter(p => p.progressStatus === 'pending').length === 0 ? (
               <div className="p-8 border border-dashed border-white/5 text-center">
                 <p className="text-xs italic text-white/20">Antrian kosong.</p>
               </div>
             ) : (
               activeProjects.filter(p => p.progressStatus === 'pending').map((project, index) => (
                 <motion.div 
                   key={project.id} 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 + index * 0.05 }}
                   className="noir-card p-6 flex items-center justify-between"
                 >
                   <div>
                     <p className="text-sm font-medium text-white">{project.name}</p>
                     <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">{project.totalFiles} Files</p>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-white/20"></div>
                 </motion.div>
               ))
             )}
           </div>
        </motion.div>
      </div>
    </div>
  );
}

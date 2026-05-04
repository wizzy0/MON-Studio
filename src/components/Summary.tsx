import * as React from 'react';
import { useState, useEffect } from 'react';
import { Project, ProjectService } from '../services/projectService';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  Camera, 
  CheckCircle2, 
  FileStack,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { motion } from 'motion/react';

export default function Summary() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'prewed' | 'documentation'>('all');
  
  const now = new Date();
  const [monthFilter, setMonthFilter] = useState(String(now.getMonth()));
  const [yearFilter, setYearFilter] = useState(String(now.getFullYear()));

  useEffect(() => {
    setLoading(true);
    // Specifically fetch all 'finished' projects to summarize productivity
    const unsubscribe = ProjectService.subscribeToProjects((data) => {
      setProjects(data);
      setLoading(false);
    }, 'finished', (error) => {
      console.error("Summary subscription error:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

  const filteredProjects = projects.filter(p => {
    if (!p.finishedAt) return false;
    const date = p.finishedAt.toDate();
    const matchesMonth = date.getMonth() === Number(monthFilter);
    const matchesYear = date.getFullYear() === Number(yearFilter);
    const matchesType = typeFilter === 'all' || p.projectType === typeFilter;
    return matchesMonth && matchesYear && matchesType;
  });

  const stats = {
    total: filteredProjects.length,
    prewed: filteredProjects.filter(p => p.projectType === 'prewed').length,
    documentation: filteredProjects.filter(p => p.projectType === 'documentation').length,
    totalFiles: filteredProjects.reduce((acc, p) => acc + (p.totalFiles || 0), 0)
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/5">
        <div>
          <p className="noir-label mb-2">Performance Analytics</p>
          <h2 className="text-4xl font-bold tracking-tight text-white">Studio Summary</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Category</span>
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white h-9 text-xs">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="bg-[#0c0c0c] border-white/10 text-white">
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="prewed">Pre-Wedding</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Periode</span>
            <div className="flex gap-2">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c0c] border-white/10 text-white">
                  {months.map((m, i) => (
                    <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c0c] border-white/10 text-white">
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-white/5 border border-white/5 rounded-sm overflow-hidden shadow-2xl"
      >
        {[
          { label: 'Total Output', value: stats.total, sub: `Selesai ${months[Number(monthFilter)]}`, highlight: true },
          { label: 'Pre-Wedding', value: stats.prewed, sub: 'Sesi Ter-archive' },
          { label: 'Documentation', value: stats.documentation, sub: 'Acara Selesai' },
          { label: 'Processed RAW', value: stats.totalFiles.toLocaleString(), sub: 'Total File Masuk', dark: true },
        ].map((item, index) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`${item.dark ? 'bg-[#111111]' : 'bg-[#0c0c0c]'} p-10 flex flex-col items-center text-center`}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">{item.label}</p>
            <p className={`font-bold text-white mb-2 ${item.highlight ? 'text-6xl' : 'text-4xl text-white/60'}`}>{item.value}</p>
            <p className="text-[10px] text-white/10 uppercase">{item.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
        <div className="lg:col-span-8 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <Layers className="h-4 w-4 text-white/20" />
            <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold">List of Completions</h3>
          </motion.div>
          
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-20 text-center border border-dashed border-white/5 rounded-sm"
              >
                <p className="text-xs italic text-white/20">Tidak ada data untuk periode ini.</p>
              </motion.div>
            ) : (
              filteredProjects.map((project, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  key={project.id}
                  className="noir-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5">
                      <CheckCircle2 className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{project.name}</h4>
                      <p className="text-[9px] uppercase tracking-widest text-white/20 mt-1">
                        {project.projectType} • {project.totalFiles} Files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 md:text-right">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/20">Finalized Date</p>
                      <p className="text-[11px] text-white/50">{project.finishedAt?.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="w-8 h-[1px] bg-white/10 hidden md:block"></div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-4"
        >
           <div className="sticky top-28 space-y-6">
             <div className="noir-card p-8 bg-white/5 border-white/10">
               <BarChart3 className="h-6 w-6 text-white mb-6" />
               <h3 className="text-xl font-bold text-white mb-2">Efficiency Note</h3>
               <p className="text-xs leading-relaxed text-white/40">
                 Summary ini dihitung berdasarkan status <span className="text-white/60">Finalized Recording</span>. 
                 Pastikan setiap project yang sudah selesai di-finalize agar masuk ke dalam hitungan riwayat bulanan studio.
               </p>
             </div>

             <div className="border border-white/5 p-6 rounded-sm space-y-4">
               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/30">
                 <span>Capture Period</span>
                 <span className="text-white/50">{months[Number(monthFilter)]} {yearFilter}</span>
               </div>
               <div className="h-[1px] bg-white/5"></div>
               <p className="text-[9px] italic text-white/10 leading-relaxed uppercase tracking-tighter">
                 Professional studio monitor logs generated at {new Date().toLocaleTimeString()}
               </p>
             </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

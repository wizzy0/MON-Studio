import * as React from 'react';
import { useState, useEffect } from 'react';
import { Project, ProjectService } from '../services/projectService';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Camera, Clock, CheckCircle2, ChevronRight, AlertCircle, Trash2, Archive, ListTodo, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import CreateProjectDialog from './CreateProjectDialog';
import ProjectDetail from './ProjectDetail';
import Summary from './Summary';

import { useUser } from '../App';

interface DashboardProps {
  view: 'active' | 'finished' | 'summary';
}

export default function Dashboard({ view }: DashboardProps) {
  const { isAdmin } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (view === 'summary') return;
    setLoading(true);
    const unsubscribe = ProjectService.subscribeToProjects((data) => {
      setProjects(data);
      setLoading(false);
    }, view as 'active' | 'finished', (error) => {
      console.error("Dashboard subscription error:", error);
      setLoading(false);
      toast.error("Gagal memuat data. Periksa izin akses Anda.");
    });
    return unsubscribe;
  }, [view]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isAdmin) {
      toast.error('Only leads can delete projects');
      return;
    }
    if (confirm('Are you sure you want to delete this archive? This action cannot be undone.')) {
      try {
        await ProjectService.deleteProject(id);
        toast.success('Archive successfully purged.');
      } catch (error) {
        console.error("Delete error:", error);
        toast.error('Failed to purge archive. Check permissions.');
      }
    }
  };

  if (view === 'summary') {
    return <Summary />;
  }

  if (loading && projects.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
          <div className="h-10 w-32 animate-pulse rounded bg-white/5" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 animate-pulse rounded noir-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Top Header */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-brand-bg/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex gap-4 items-center">
          <p className="noir-label">{view === 'active' ? 'Post-Production Queue' : 'Studio Archive'}</p>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <p className="text-sm font-medium text-white flex items-center gap-2">
            {view === 'active' ? <ListTodo className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {view === 'active' ? 'Queue Management' : 'Edit History'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input 
              placeholder="Search studio archives..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/5 pl-10 text-xs text-white placeholder:text-white/20 w-48 focus:w-64 transition-all focus:ring-0 focus-visible:ring-0"
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="noir-btn-primary px-6">
            + New Intake
          </Button>
        </div>
      </header>

      <div className="p-8 flex-1">
        <AnimatePresence mode="wait">
          {selectedProjectId ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => setSelectedProjectId(null)} 
                className="mb-8 p-0 text-white/40 hover:text-white hover:bg-transparent flex items-center gap-2"
              >
                <div className="w-4 h-[1px] bg-white/40"></div>
                <span className="text-[10px] uppercase tracking-widest font-bold">Return to Studio</span>
              </Button>
              {selectedProject && <ProjectDetail project={selectedProject} />}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProjects.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center p-20 text-center noir-card border-dashed"
                >
                  {view === 'active' ? (
                    <>
                      <Camera className="h-10 w-10 text-white/10 mb-4" />
                      <h3 className="text-sm font-medium text-white/50">Post-production queue empty.</h3>
                    </>
                  ) : (
                    <>
                      <Archive className="h-10 w-10 text-white/10 mb-4" />
                      <h3 className="text-sm font-medium text-white/50">Edit history is empty.</h3>
                    </>
                  )}
                </motion.div>
              ) : (
                filteredProjects.map((project, index) => {
                  const phaseList = Object.values(project.phases);
                  const completedPhases = phaseList.filter((p: any) => p?.status === 'completed').length;
                  const progress = Math.round((completedPhases / phaseList.length) * 100);
                  
                  return (
                    <motion.div 
                      key={project.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group cursor-pointer noir-card p-6 flex flex-col transition-all hover:bg-white/5 hover:border-white/20"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2 items-center">
                          <span className="text-[9px] border border-white/20 px-2 py-0.5 uppercase tracking-widest text-white/50 italic">
                            {project.projectType === 'prewed' ? 'Pre-Wedding' : 'Documentation'}
                          </span>
                          {project.status === 'active' && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter ${
                              project.progressStatus === 'on_progress' ? 'bg-white text-black' : 
                              project.progressStatus === 'complete' ? 'bg-green-500/20 text-green-400' : 
                              'bg-white/5 text-white/40'
                            }`}>
                              {project.progressStatus?.replace('_', ' ') || 'pending'}
                            </span>
                          )}
                        </div>
                        {isAdmin && (
                          <button 
                            className="text-red-500/40 hover:text-red-500 transition-all p-2 bg-red-500/5 rounded-full hover:bg-red-500/10 active:scale-95"
                            onClick={(e) => handleDelete(e, project.id)}
                            title="Purge Archive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <h4 className="text-base font-medium text-white group-hover:underline mb-1 truncate">{project.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-8">{project.totalFiles} Raw Files</p>

                      <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] text-white/30 uppercase">Progress</span>
                           <span className="text-lg font-bold">
                             {completedPhases} <span className="text-[10px] text-white/20">/ {phaseList.length}</span>
                           </span>
                        </div>
                        <div className="w-full h-[1px] bg-white/5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-white" 
                          ></motion.div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white/20 italic">
                          <span>{progress}% processed</span>
                          {project.finishedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-2 w-2" /> Done
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/10">Studio Monitor: Connected • System Latency: 24ms</p>
      </div>

      <CreateProjectDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}

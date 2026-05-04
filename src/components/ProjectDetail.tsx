import * as React from 'react';
import { Project, ProjectService, ProjectWorkflow } from '../services/projectService';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight,
  Camera,
  Layers,
  Palette,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { useUser } from '../App';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const { isAdmin, userProfile } = useUser();
  const handleTogglePhase = async (phaseKey: keyof ProjectWorkflow) => {
    const isCompleted = project.phases[phaseKey]?.status === 'completed';
    try {
      await ProjectService.updatePhaseStatus(project.id, phaseKey, !isCompleted);
      toast.success(`${phaseKey} updated`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const updateProgressStatus = async (status: 'pending' | 'on_progress' | 'complete') => {
    try {
      await ProjectService.updateProject(project.id, { progressStatus: status });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFinish = async () => {
    try {
      await ProjectService.finishProject(project.id);
      toast.success('Project finalized and moved to History.');
    } catch (error) {
      toast.error('Failed to finalize');
    }
  };

  const handleActivate = async () => {
    try {
      await ProjectService.updateProject(project.id, { status: 'active' });
      toast.success('Project moved back to Queue.');
    } catch (error) {
      console.error("Reactivate error:", error);
      toast.error('Failed to re-activate. Check permissions.');
    }
  };

  const getPhaseConfig = (key: string) => {
    const configs: Record<string, { label: string; icon: any; desc: string }> = {
      pilah: { label: 'Pilah / Sortir', icon: Camera, desc: 'Selection and initial sorting' },
      cleaning: { label: 'Cleaning', icon: Sparkles, desc: 'Removals and spot healing' },
      grading: { label: 'Color Grading', icon: Palette, desc: 'Atmosphere and style application' },
      masking: { label: 'Masking', icon: Layers, desc: 'Area-specific adjustments' },
      finalling: { label: 'Finalling', icon: CheckCircle, desc: 'Final touch and export' },
    };
    return configs[key] || { label: key, icon: Circle, desc: '' };
  };

  const phases = Object.entries(project.phases) as [keyof ProjectWorkflow, any][];
  const allCompleted = phases.every(([_, phase]) => phase.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-2">{project.name}</h2>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-white/10 rounded-sm bg-white/5">
               <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
               <span className="text-white/60">{project.progressStatus?.replace('_', ' ') || 'pending'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10"></div>
            <span>{project.projectType === 'prewed' ? 'Pre-Wedding' : 'Documentation'}</span>
            <div className="w-1 h-1 rounded-full bg-white/10"></div>
            <span>{project.totalFiles} Raw Files</span>
            {project.afterSortFiles > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-white/10"></div>
                <span>{project.afterSortFiles} Sorted Files</span>
              </>
            )}
          </div>
          {project.selectedFiles && project.selectedFiles.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-widest text-white/30 mr-2 block w-full mb-1">Selected Edits:</span>
              {project.selectedFiles.map(file => (
                <span key={file} className="text-[9px] px-2 py-0.5 border border-white/10 bg-white/5 text-white/60 font-mono">
                  {file}
                </span>
              ))}
            </div>
          )}
        </div>

        {project.status === 'active' ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 p-1 bg-white/5 border border-white/5 rounded-sm">
              {(['pending', 'on_progress', 'complete'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateProgressStatus(s)}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest transition-all ${
                    project.progressStatus === s ? 'bg-white text-black font-bold' : 'text-white/30 hover:text-white'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <Button 
              disabled={!allCompleted}
              onClick={handleFinish}
              className={`noir-btn-primary px-8 h-12 ${allCompleted ? 'bg-white text-black' : 'opacity-20 cursor-not-allowed'}`}
            >
              {allCompleted ? 'Finalize Recording' : 'Complete All Phases First'}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleActivate}
            className="bg-white text-black hover:bg-white/90 px-8 h-12 text-[10px] uppercase tracking-widest font-bold shadow-xl active:scale-95 transition-all"
          >
            Move back to Queue
          </Button>
        )}
      </section>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4"
      >
        <p className="noir-label mb-2">Workflow Sequence</p>
        <div className="space-y-[1px] bg-white/5 border border-white/5 rounded-sm overflow-hidden">
          {phases.map(([key, phase], index) => {
            const config = getPhaseConfig(key);
            const isCompleted = phase.status === 'completed';
            const Icon = config.icon;

            return (
              <motion.div 
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`group flex items-center gap-6 p-6 transition-all ${
                  isCompleted ? 'bg-white/[0.02]' : 'bg-[#0f0f0f]'
                }`}
              >
                <div className="text-[10px] font-mono text-white/10 w-4">{index + 1}</div>
                
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: isCompleted ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.05)',
                    color: isCompleted ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  className="p-3 rounded-full"
                >
                  <Icon className="h-4 w-4" />
                </motion.div>

                <div className="flex-1">
                  <h4 className={`text-sm font-medium transition-colors ${
                    isCompleted ? 'text-white/40 line-through' : 'text-white'
                  }`}>
                    {config.label}
                  </h4>
                  <p className="text-[10px] text-white/20 uppercase tracking-tighter">
                    {isCompleted ? `Finished at ${phase.completedAt?.toDate().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : config.desc}
                  </p>
                </div>

                {(project.status === 'active' || (userProfile?.role === 'owner' || userProfile?.role === 'editor')) && (
                  <button
                    onClick={() => handleTogglePhase(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                      isCompleted 
                        ? 'border-white/20 text-white/40 hover:bg-white/5' 
                        : 'border-white/10 text-white hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-[9px] uppercase tracking-widest">Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-3 w-3" />
                        <span className="text-[9px] uppercase tracking-widest">Mark as Done</span>
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-4">
          <p className="noir-label">System Metadata</p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            <div>
              <span className="text-[10px] text-white/20 uppercase block">Created</span>
              <span className="text-xs text-white/40">{project.createdAt?.toDate().toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/20 uppercase block">Last Sync</span>
              <span className="text-xs text-white/40">{project.updatedAt?.toDate().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-sm border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
             <Clock className="h-4 w-4 text-white/20" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Operational Status</p>
            <p className="text-sm font-medium text-white">
              {project.status === 'finished' ? 'Archived Performance' : 'Optimizing Workflow'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

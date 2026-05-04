import * as React from 'react';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ProjectService } from '../services/projectService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    projectType: 'prewed' as 'prewed' | 'documentation',
    totalFiles: 0,
    afterSortFiles: 0,
    selectedFilesInput: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.totalFiles) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      // Split input by space, comma or newline and filter empty strings
      const selectedFiles = formData.selectedFilesInput
        .split(/[\s,]+/)
        .filter(f => f.trim() !== '');

      await ProjectService.createProject({
        name: formData.name,
        projectType: formData.projectType,
        totalFiles: formData.totalFiles,
        afterSortFiles: formData.afterSortFiles,
        selectedFiles,
      });
      toast.success('Project initialized');
      setFormData({
        name: '',
        projectType: 'prewed',
        totalFiles: 0,
        afterSortFiles: 0,
        selectedFilesInput: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0c0c0c] border-white/10 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white font-serif italic text-2xl">New Project Intake</DialogTitle>
            <DialogDescription className="text-white/40">
              Set up a new editing sequence for the studio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="noir-label">Project Name / Client *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Client Name" 
                className="bg-white/5 border-white/10 text-white focus:border-white/20"
              />
            </div>

            <div className="grid gap-2">
              <Label className="noir-label">Project Category</Label>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, projectType: 'prewed'})}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-widest transition-all ${
                    formData.projectType === 'prewed' ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Pre-Wedding
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, projectType: 'documentation'})}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-widest transition-all ${
                    formData.projectType === 'documentation' ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Documentation
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalFiles" className="noir-label">{formData.projectType === 'prewed' ? 'Total RAW' : 'Total Files'} *</Label>
                <Input 
                  id="totalFiles" 
                  type="number" 
                  value={formData.totalFiles || ''} 
                  onChange={e => setFormData({...formData, totalFiles: Number(e.target.value)})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="afterSortFiles" className="noir-label">After Sort</Label>
                <Input 
                  id="afterSortFiles" 
                  type="number" 
                  value={formData.afterSortFiles || ''} 
                  onChange={e => setFormData({...formData, afterSortFiles: Number(e.target.value)})}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Count"
                />
              </div>
            </div>

            {formData.projectType === 'prewed' && (
              <div className="grid gap-2">
                <Label htmlFor="selectedFilesInput" className="noir-label">Selected File Labels (Paste from WA)</Label>
                <textarea 
                  id="selectedFilesInput" 
                  value={formData.selectedFilesInput} 
                  onChange={e => setFormData({...formData, selectedFilesInput: e.target.value})}
                  placeholder="DSC_2001&#10;DSC_0201&#10;DSC_9650..." 
                  className="bg-white/5 border border-white/10 text-white p-3 text-xs min-h-[150px] resize-none focus:outline-none focus:border-white/20 font-mono"
                />
                <p className="text-[9px] text-white/20 italic italic">Langsung copas list dari WhatsApp ke sini. Akan dipisah otomatis per baris atau spasi.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="noir-btn-primary w-full py-6">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Initialize Sequence
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

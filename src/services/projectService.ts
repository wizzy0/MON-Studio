import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface WorkflowPhase {
  status: 'pending' | 'completed';
  completedAt: any | null;
}

export interface ProjectWorkflow {
  pilah: WorkflowPhase;
  cleaning?: WorkflowPhase;
  grading: WorkflowPhase;
  masking?: WorkflowPhase;
  finalling?: WorkflowPhase;
}

export interface Project {
  id: string;
  name: string;
  projectType: 'prewed' | 'documentation';
  status: 'active' | 'finished';
  ownerId: string;
  totalFiles: number;
  afterSortFiles: number;
  selectedFiles: string[];
  progressStatus: 'pending' | 'on_progress' | 'complete';
  phases: ProjectWorkflow;
  createdAt: any;
  updatedAt: any;
  finishedAt?: any;
}

export const ProjectService = {
  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'status' | 'phases' | 'progressStatus'>) {
    if (!auth.currentUser) throw new Error('User not authenticated');
    const path = 'projects';
    
    // Default phases based on type
    const phases: ProjectWorkflow = data.projectType === 'prewed' 
      ? {
          pilah: { status: 'pending', completedAt: null },
          cleaning: { status: 'pending', completedAt: null },
          grading: { status: 'pending', completedAt: null },
          masking: { status: 'pending', completedAt: null },
          finalling: { status: 'pending', completedAt: null }
        }
      : {
          pilah: { status: 'pending', completedAt: null }, // Sortir
          grading: { status: 'pending', completedAt: null } // Color Grading
        };

    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        selectedFiles: data.selectedFiles || [],
        status: 'active',
        progressStatus: 'pending',
        phases,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateProject(projectId: string, data: Partial<Project>) {
    const path = `projects/${projectId}`;
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updatePhaseStatus(projectId: string, phaseKey: keyof ProjectWorkflow, isCompleted: boolean) {
    const path = `projects/${projectId}`;
    try {
      const updateData: any = {};
      updateData[`phases.${phaseKey}.status`] = isCompleted ? 'completed' : 'pending';
      updateData[`phases.${phaseKey}.completedAt`] = isCompleted ? serverTimestamp() : null;
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(doc(db, 'projects', projectId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async finishProject(projectId: string) {
    const path = `projects/${projectId}`;
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'finished',
        finishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteProject(projectId: string) {
    const path = `projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToProjects(callback: (projects: Project[]) => void, status: 'active' | 'finished' = 'active', onError?: (error: any) => void) {
    if (!auth.currentUser) return () => {};
    const path = 'projects';
    const q = query(
      collection(db, path),
      where('status', '==', status)
    );
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Sort client-side to avoid index requirement
      projects.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      callback(projects);
    }, (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    });
  }
};

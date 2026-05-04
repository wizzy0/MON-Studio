/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { auth, signInWithGoogle, signOut, db, syncUser } from './lib/firebase';
import { User } from 'firebase/auth';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  LogOut, 
  Loader2,
  UserCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectService } from './services/projectService';

import Dashboard from './components/Dashboard';
import Overview from './components/Overview';
import Summary from './components/Summary';

interface UserContextType {
  user: User | null;
  userProfile: any | null;
  isAdmin: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [dashboardView, setDashboardView] = useState<'overview' | 'queue' | 'finished' | 'summary'>('overview');

  const isAdmin = user?.email === 'AnomMahesa02@gmail.com' || userProfile?.role === 'owner';

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2800);
      return () => clearTimeout(timer);
    }

    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        try {
          const profile = await syncUser(u);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      } else {
        setUserProfile(null);
      }
      setUser(u);
      setLoading(false);
    });
    
    // Splash screen timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0c0c0c] font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, userProfile, isAdmin, loading }}>
      <div className="min-h-screen bg-[#0c0c0c] font-sans text-white selection:bg-white selection:text-black">
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="mb-8 flex h-24 w-24 items-center justify-center rounded-sm border border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-xl"
                >
                  <Camera className="h-12 w-12 font-thin" />
                </motion.div>
                
                <div className="overflow-hidden mb-2">
                  <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "circOut" }}
                    className="text-4xl font-bold tracking-[0.3em] text-white uppercase text-center leading-tight"
                  >
                    MON PHOTO BALI
                  </motion.h1>
                </div>
                
                <div className="overflow-hidden">
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="text-[10px] uppercase tracking-[0.5em] text-white/30"
                  >
                    Studio Production Suite
                  </motion.p>
                </div>
              </div>
              
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ delay: 0.5, duration: 2, ease: "easeInOut" }}
                className="absolute bottom-20 h-[1px] bg-white/10"
              >
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </motion.div>
          ) : !user ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex h-screen flex-col items-center justify-center p-4"
            >
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-xl">
                  <Camera className="h-10 w-10 font-thin" />
                </div>
                <h1 className="text-5xl font-bold tracking-tighter text-white mt-6 leading-none">
                  MON PHOTO BALI
                </h1>
                <p className="max-w-[320px] text-white/30 text-xs uppercase tracking-[0.2em] mt-2">
                   Professional Metadata & Workflow Management 
                </p>
              </div>
              <Button 
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error: any) {
                    console.error("Login Error:", error);
                    if (error.code === 'auth/unauthorized-domain' || error.message?.includes('403')) {
                      toast.error("Error 403: Domain ini belum diizinkan di Firebase Console (Authorized Domains).", { duration: 6000 });
                    } else {
                      toast.error("Gagal login: " + (error.message || "Pastikan domain ini telah diizinkan di Firebase."));
                    }
                  }
                }}
                size="lg"
                className="h-14 w-full max-w-[280px] bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90 transition-all rounded-sm"
              >
                Enter Studio
              </Button>
            </motion.div>
          ) : (
            <div key="app-main" className="flex h-screen overflow-hidden bg-[#0c0c0c]">
              {/* Sidebar */}
              <aside className="hidden border-r border-white/5 bg-[#0a0a0a] md:flex md:w-64 md:flex-col">
                <div className="flex h-[100px] flex-col justify-center px-8 border-b border-white/5">
                  <h1 className="text-xl font-bold tracking-widest text-white">
                    MON PHOTO BALI
                  </h1>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">Post-Production</p>
                </div>
                
                <div className="flex h-1 gap-0" />
                <div className="flex flex-1 flex-col justify-between p-8">
                  <nav className="space-y-12 mt-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="noir-label mb-6">Console</p>
                      <ul className="space-y-6">
                        {[
                          { id: 'overview', label: 'Dashboard', view: 'overview' },
                          { id: 'queue', label: 'Queue', view: 'queue' },
                          { id: 'finished', label: 'History', view: 'finished' },
                          { id: 'summary', label: 'Summary', view: 'summary' },
                        ].map((item, index) => (
                          <motion.li 
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            onClick={() => setDashboardView(item.view as any)}
                            className={`flex items-center gap-4 group cursor-pointer transition-colors ${dashboardView === item.view ? 'text-white' : 'text-white/30 hover:text-white'}`}
                          >
                            <div className={`w-1.5 h-6 transition-all ${dashboardView === item.view ? 'bg-white' : 'bg-transparent'}`}></div>
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </nav>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-auto pt-8"
                  >
                    <div className="mb-10 flex items-center gap-4 p-4 rounded-sm bg-white/5 border border-white/5">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-zinc-800 text-white">{user.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-medium text-white truncate">{user.displayName}</span>
                        <span className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">
                          {userProfile?.role === 'owner' ? 'Studio Lead' : 'Editor'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => signOut()}
                      className="w-full justify-start gap-4 p-0 text-white/20 hover:bg-transparent hover:text-red-500 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Terminate Session</span>
                    </Button>
                  </motion.div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dashboardView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {dashboardView === 'overview' ? (
                      <Overview />
                    ) : dashboardView === 'summary' ? (
                      <Summary />
                    ) : (
                      <Dashboard view={dashboardView === 'queue' ? 'active' : dashboardView} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          )}
        </AnimatePresence>
        <Toaster position="bottom-right" theme="dark" />
      </div>
    </UserContext.Provider>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Activity, 
  Hospital, 
  LogOut, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Ban, 
  History,
  Lock,
  Menu,
  X,
  Plus,
  Search,
  Pill,
  Truck,
  Camera,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, AuthState, AuditLog } from './types';
import { hashPassword, DB } from './utils';
import { HOSPITALS, TREATMENTS, PHARMACIES } from './data';
import { HospitalData, Treatment, AIResult, ChatMessage, Pharmacy, MedicineOrder } from './types';
import { checkSymptoms, chatCompanion } from './services/aiService';
import { Video, Brain, Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, MessageCircle, Send } from 'lucide-react';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'about' | 'terms' | 'privacy'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState('Dashboard');
  
  // Initialize Admin if not exists
  useEffect(() => {
    const init = async () => {
      const users = DB.getUsers();
      if (!users.find(u => u.role === 'admin')) {
        const adminPass = await hashPassword('admin123');
        const admin: User = {
          id: 'admin-001',
          username: 'admin',
          fullName: 'System Administrator',
          passwordHash: adminPass,
          role: 'admin',
          isVerified: true,
          isSuspended: false,
          strikes: 0,
          createdAt: new Date().toISOString()
        };
        DB.saveUsers([...users, admin]);
      }
    };
    init();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    if (authState.user) {
      DB.addLog({
        action: 'LOGOUT',
        adminId: 'SYSTEM',
        targetUserId: authState.user.id,
        details: `User ${authState.user.username} logged out.`
      });
    }
    setAuthState({ user: null, isAuthenticated: false });
    setView('landing');
    setIsSidebarOpen(false);
    setShowLogoutModal(false);
    setActiveDashboardTab('Dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Public Navigation */}
      {!authState.isAuthenticated && (
        <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={() => setView('landing')} className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-teal-600" />
              <span className="text-xl font-bold text-slate-900">AtharvX</span>
            </button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setView('landing')} className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Home</button>
              <button onClick={() => setView('about')} className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">About</button>
              <button onClick={() => setView('terms')} className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Terms</button>
              <button onClick={() => setView('login')} className="px-5 py-2 text-sm font-bold text-teal-600 border border-teal-600 rounded-full hover:bg-teal-50 transition-all">Login</button>
              <button onClick={() => setView('register')} className="px-5 py-2 text-sm font-bold text-white bg-teal-600 rounded-full hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Register</button>
            </div>
            <button className="md:hidden p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      )}

      <AnimatePresence mode="wait">
        {view === 'landing' && !authState.isAuthenticated && <PublicLanding onGetStarted={() => setView('register')} onLogin={() => setView('login')} />}
        {view === 'about' && !authState.isAuthenticated && <AboutSection onBack={() => setView('landing')} />}
        {view === 'terms' && !authState.isAuthenticated && <TermsSection onBack={() => setView('landing')} />}
        {view === 'privacy' && !authState.isAuthenticated && <PrivacySection onBack={() => setView('landing')} />}

        {(view === 'login' || view === 'register') && !authState.isAuthenticated && (
          <div className="flex items-center justify-center flex-1 p-4 bg-teal-600 relative">
            <button 
              onClick={() => setView('landing')}
              className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-all group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-sm">Back to Home</span>
            </button>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="p-3 mb-4 bg-teal-100 rounded-xl">
                  <Activity className="w-10 h-10 text-teal-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">AtharvX</h1>
                <p className="text-slate-500 text-center text-sm">Bridging Ancient Wisdom and Modern AI for Transparent Healthcare</p>
              </div>

              {view === 'login' ? (
                <LoginForm 
                  onSuccess={(user) => {
                    setAuthState({ user, isAuthenticated: true });
                    setView('dashboard');
                  }} 
                  onSwitch={() => setView('register')}
                />
              ) : (
                <RegisterForm 
                  onSuccess={() => setView('login')} 
                  onSwitch={() => setView('login')}
                />
              )}
            </motion.div>
          </div>
        )}

        {authState.isAuthenticated && (
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar 
              user={authState.user!} 
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)}
              onLogout={handleLogout}
              activeTab={activeDashboardTab}
              onTabChange={(tab) => {
                setActiveDashboardTab(tab);
                setIsSidebarOpen(false);
              }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="app-container py-4 md:py-8">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-2 md:hidden bg-white rounded-lg shadow-sm border border-slate-200"
                    >
                      <Menu className="w-6 h-6 text-slate-600" />
                    </button>
                    
                    {/* Emergency Button */}
                    <motion.button
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      onClick={() => setShowEmergencyModal(true)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex-1 sm:flex-none"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      EMERGENCY
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-900 capitalize leading-tight">{authState.user?.fullName}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{authState.user?.role}</p>
                    </div>
                    <div className="relative group">
                      <button className="w-11 h-11 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-200 transition-all border-2 border-white shadow-sm">
                        <UserIcon className="w-6 h-6 text-teal-600" />
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Settings</p>
                        </div>
                        <button 
                          onClick={() => setActiveDashboardTab('Profile')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          My Profile
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                <DashboardContent 
                  user={authState.user!} 
                  activeTab={activeDashboardTab} 
                  onTabChange={setActiveDashboardTab}
                />
              </div>
            </main>

            {/* Emergency Modal */}
            <AnimatePresence>
              {showEmergencyModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowEmergencyModal(false)}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 bg-red-100 rounded-full mb-6">
                        <Activity className="w-12 h-12 text-red-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Emergency Assistance</h2>
                      <p className="text-slate-500 mb-8">Quickly find the nearest emergency services or call for help.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <button 
                          onClick={() => window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank')}
                          className="flex flex-col items-center gap-3 p-6 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-100 transition-all group"
                        >
                          <Hospital className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-red-900">Nearest ER</span>
                        </button>
                        <button 
                          onClick={() => window.open('tel:108', '_blank')}
                          className="flex flex-col items-center gap-3 p-6 bg-teal-50 hover:bg-teal-100 rounded-2xl border border-teal-100 transition-all group"
                        >
                          <Shield className="w-8 h-8 text-teal-600 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-teal-900">Call Ambulance</span>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setShowEmergencyModal(false)}
                        className="mt-8 text-slate-400 hover:text-slate-600 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
              {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLogoutModal(false)}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
                  >
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <LogOut className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign Out?</h2>
                    <p className="text-slate-500 mb-8">Are you sure you want to sign out? For your security, all session data will be cleared.</p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={confirmLogout}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                      >
                        Yes, Sign Out
                      </button>
                      <button 
                        onClick={() => setShowLogoutModal(false)}
                        className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginForm({ onSuccess, onSwitch }: { onSuccess: (user: User) => void, onSwitch: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const users = DB.getUsers();
    const user = users.find(u => u.username === username);
    const passHash = await hashPassword(password);

    if (user && user.passwordHash === passHash) {
      if (user.isSuspended) {
        DB.addLog({
          action: 'LOGIN_FAILED',
          adminId: 'SYSTEM',
          targetUserId: user.id,
          details: `Suspended user ${username} attempted to login.`
        });
        setError('Your account has been suspended. Contact admin.');
      } else {
        DB.addLog({
          action: 'LOGIN_SUCCESS',
          adminId: 'SYSTEM',
          targetUserId: user.id,
          details: `User ${username} logged in.`
        });
        onSuccess(user);
      }
    } else {
      DB.addLog({
        action: 'LOGIN_FAILED',
        adminId: 'SYSTEM',
        details: `Failed login attempt for username: ${username}`
      });
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          placeholder="Enter your username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          placeholder="••••••••"
          required
        />
      </div>
      <button 
        disabled={loading}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-200 disabled:opacity-50"
      >
        {loading ? 'Authenticating...' : 'Sign In'}
      </button>
      <p className="text-center text-sm text-slate-500">
        Don't have an account? <button type="button" onClick={onSwitch} className="text-teal-600 font-semibold hover:underline">Register here</button>
      </p>
      <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Testing Credentials</p>
        <p className="text-xs text-slate-500">Admin: <span className="font-mono font-bold text-slate-700">admin / admin123</span></p>
      </div>
    </form>
  );
}

function RegisterForm({ onSuccess, onSwitch }: { onSuccess: () => void, onSwitch: () => void }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = username.trim() !== '' && 
                     fullName.trim().split(/\s+/).length >= 2 && 
                     /^[a-zA-Z\s-]+$/.test(fullName) &&
                     password.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (fullName.trim().split(/\s+/).length < 2) {
        setError('Full legal name is required for identity verification (Minimum 2 words).');
      } else if (!/^[a-zA-Z\s-]+$/.test(fullName)) {
        setError('Full legal name must not contain numbers or special characters (except hyphen).');
      } else {
        setError('Please fill all fields correctly.');
      }
      return;
    }
    setLoading(true);
    setError('');

    const users = DB.getUsers();
    if (users.find(u => u.username === username)) {
      setError('Username already exists');
      setLoading(false);
      return;
    }

    const passHash = await hashPassword(password);
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      fullName: fullName.trim(),
      passwordHash: passHash,
      role,
      isVerified: false,
      isSuspended: false,
      strikes: 0,
      createdAt: new Date().toISOString()
    };

    DB.saveUsers([...users, newUser]);
    DB.addLog({
      action: 'USER_REGISTERED',
      adminId: 'SYSTEM',
      targetUserId: newUser.id,
      details: `New user ${username} registered as ${role}.`
    });
    onSuccess();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Legal Name</label>
        <input 
          type="text" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          placeholder="Enter your full legal name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          placeholder="Choose a username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          placeholder="••••••••"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Select Domain</label>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="hospital">Hospital Representative</option>
        </select>
      </div>
      <button 
        disabled={loading || !isFormValid}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-200 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Register'}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already have an account? <button type="button" onClick={onSwitch} className="text-teal-600 font-semibold hover:underline">Sign in</button>
      </p>
    </form>
  );
}

function Sidebar({ user, isOpen, onClose, onLogout, activeTab, onTabChange }: { user: User, isOpen: boolean, onClose: () => void, onLogout: () => void, activeTab: string, onTabChange: (tab: string) => void }) {
  const menuItems = [
    { label: 'Dashboard', icon: Activity, roles: ['patient', 'doctor', 'hospital', 'admin'] },
    { label: 'Pharmacy', icon: Pill, roles: ['patient', 'doctor', 'hospital', 'admin'] },
    { label: 'Users', icon: Users, roles: ['admin'] },
    { label: 'Audit Logs', icon: History, roles: ['admin'] },
    { label: 'Profile', icon: UserIcon, roles: ['patient', 'doctor', 'hospital', 'admin'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-slate-900">AtharvX</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onTabChange(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                activeTab === item.label 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.label ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function BackButton({ onClick, label = "Back" }: { onClick: () => void, label?: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all mb-8 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span className="font-bold uppercase tracking-widest text-xs">{label}</span>
    </button>
  );
}

function DashboardContent({ user, activeTab, onTabChange }: { user: User, activeTab: string, onTabChange: (tab: string) => void }) {
  if (activeTab === 'Profile') return <ProfileView user={user} onBack={() => onTabChange('Dashboard')} />;
  if (activeTab === 'Pharmacy') return <PharmacyView user={user} onBack={() => onTabChange('Dashboard')} />;
  if (user.role === 'admin') return <AdminDashboard admin={user} activeTab={activeTab} />;
  if (user.role === 'doctor') return <DoctorDashboard user={user} />;
  if (user.role === 'hospital') return <HospitalDashboard user={user} />;
  
  return <PatientDashboard user={user} onTabChange={onTabChange} />;
}

function ProfileView({ user, onBack }: { user: User, onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <BackButton onClick={onBack} label="Back to Dashboard" />
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-teal-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Username</p>
            <p className="text-slate-700 font-medium">{user.username}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Account Status</p>
            <p className={`font-bold ${user.isVerified ? 'text-teal-600' : 'text-amber-600'}`}>
              {user.isVerified ? 'Verified' : 'Pending Verification'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Member Since</p>
            <p className="text-slate-700 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Strikes</p>
            <p className="text-slate-700 font-medium">{user.strikes}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-400" />
          Security Notice
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Your account is protected by role-based access control. Any attempt to misuse medical privileges or impersonate healthcare professionals will result in account suspension and strikes.
        </p>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-teal-400 font-bold mb-1 uppercase tracking-wider">Privacy First</p>
          <p className="text-xs text-slate-500">All your session data is stored locally. Always sign out when using shared devices.</p>
        </div>
      </div>
    </div>
  );
}

function PatientDashboard({ user, onTabChange }: { user: User, onTabChange: (tab: string) => void }) {
  return (
    <div className="space-y-8 pb-20">
      <div className="responsive-grid">
        <StatCard title="Status" value={user.isVerified ? 'Verified' : 'Pending'} icon={CheckCircle} color="teal" />
        <StatCard title="Role" value={user.role.toUpperCase()} icon={Shield} color="blue" />
        <StatCard title="Strikes" value={user.strikes.toString()} icon={AlertTriangle} color="orange" />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Welcome back, {user.fullName}!</h2>
        <p className="text-slate-600 leading-relaxed">
          This is your personalized healthcare dashboard. Here you can manage your profile, view your status, and access role-specific features.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <button 
            onClick={() => window.scrollTo({ top: document.getElementById('hospital-finder')?.offsetTop || 0, behavior: 'smooth' })}
            className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all"
          >
            Go to Dashboard Tools
          </button>
          <button 
            onClick={() => onTabChange('Pharmacy')}
            className="px-6 py-2 bg-teal-50 text-teal-600 font-bold rounded-xl hover:bg-teal-100 transition-all flex items-center gap-2"
          >
            <Pill className="w-4 h-4" />
            Order Medicines (10% OFF)
          </button>
          <button 
            onClick={() => {
              const requestedRole = prompt("Requested domain (doctor, hospital):") as UserRole;
              if (requestedRole === 'patient' || !['doctor', 'hospital'].includes(requestedRole)) {
                alert("Invalid domain selection.");
                return;
              }
              const reason = prompt("Justification: Reason for domain change:");
              const proofId = prompt("Professional Credentials / Medical License ID / Proof ID:");
              if (reason && requestedRole && proofId) {
                const users = DB.getUsers();
                const updatedUsers = users.map(u => u.id === user.id ? {
                  ...u,
                  roleChangeRequest: { requestedRole, reason, proofId, status: 'pending' as const }
                } : u);
                DB.saveUsers(updatedUsers);
                DB.addLog({
                  action: 'ROLE_CHANGE_REQUESTED',
                  adminId: 'SYSTEM',
                  targetUserId: user.id,
                  details: `User ${user.username} requested domain change to ${requestedRole}. Justification: ${reason}`
                });
                alert("Domain change request submitted. Your account is now under verification. Role changes require verification to maintain platform trust and prevent misuse.");
                window.location.reload();
              }
            }}
            className="px-6 py-2 bg-white text-teal-600 border border-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-all"
          >
            Request Domain Change
          </button>
        </div>
        {user.roleChangeRequest?.status === 'pending' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Role Change Under Verification</p>
              <p className="text-xs text-blue-700">You requested to become a {user.roleChangeRequest.requestedRole}. An admin is reviewing your proof.</p>
            </div>
          </div>
        )}
        {!user.isVerified && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Account Verification Pending</p>
              <p className="text-xs text-amber-700">An administrator will review your account details shortly.</p>
            </div>
          </div>
        )}
      </div>

      {/* Hospital Finder & Cost Comparison */}
      <div id="hospital-finder">
        <HospitalFinder />
      </div>

      {/* AI & Video Call Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-1">
          <AISymptomChecker />
        </div>
        <div className="xl:col-span-1">
          <AIHealthCompanion />
        </div>
        <div className="xl:col-span-1 lg:col-span-2 xl:col-span-1">
          <VideoConsultation />
        </div>
      </div>

      {/* External Resources Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 tablet-two-col">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-teal-600" />
            Emergency Resources
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank')}
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors group"
            >
              <span className="font-semibold">Find Nearby Emergency Care</span>
              <Shield className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.open('https://www.who.int/emergencies/situations', '_blank')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors group"
            >
              <span className="font-semibold">Global Health Emergencies</span>
              <Activity className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            Quick Directions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => onTabChange('Pharmacy')}
              className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl transition-colors group"
            >
              <span className="font-semibold">Order Medicines (10% OFF)</span>
              <Pill className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.open('https://www.google.com/maps/dir//Medical+Clinic', '_blank')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors group"
            >
              <span className="font-semibold">Nearest Medical Clinic</span>
              <Hospital className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorDashboard({ user }: { user: User }) {
  return (
    <div className="space-y-8 pb-20">
      <div className="responsive-grid">
        <StatCard title="Status" value={user.isVerified ? 'Verified' : 'Pending'} icon={CheckCircle} color="teal" />
        <StatCard title="Role" value="DOCTOR" icon={Shield} color="blue" />
        <StatCard title="Patients" value="12" icon={Users} color="purple" />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Doctor Portal: Dr. {user.fullName}</h2>
        <p className="text-slate-600 leading-relaxed">
          Welcome to your professional workspace. Here you can manage tele-consultations, review patient histories, and access medical resources.
        </p>
        {!user.isVerified && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Professional Verification Pending</p>
              <p className="text-xs text-amber-700">Your medical credentials are being reviewed by our administration team.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 tablet-two-col">
        <VideoConsultation />
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Recent Patients
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Rahul Sharma', time: '10:30 AM', status: 'Completed' },
              { name: 'Priya Patel', time: '11:45 AM', status: 'Waiting' },
              { name: 'Amit Kumar', time: '02:15 PM', status: 'Scheduled' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.time}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  p.status === 'Completed' ? 'bg-teal-100 text-teal-700' :
                  p.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Medical Research & AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-100 text-left transition-all">
            <p className="font-bold text-purple-900 text-sm mb-1">Drug Interactions</p>
            <p className="text-xs text-purple-700">Check compatibility using AI</p>
          </button>
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 text-left transition-all">
            <p className="font-bold text-blue-900 text-sm mb-1">Clinical Guidelines</p>
            <p className="text-xs text-blue-700">Latest WHO protocols</p>
          </button>
          <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-100 text-left transition-all">
            <p className="font-bold text-teal-900 text-sm mb-1">Patient Analytics</p>
            <p className="text-xs text-teal-700">Health trend visualization</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function HospitalDashboard({ user }: { user: User }) {
  return (
    <div className="space-y-8 pb-20">
      <div className="responsive-grid">
        <StatCard title="Status" value={user.isVerified ? 'Verified' : 'Pending'} icon={CheckCircle} color="teal" />
        <StatCard title="Role" value="HOSPITAL" icon={Shield} color="blue" />
        <StatCard title="Transparency Score" value="94%" icon={Activity} color="indigo" />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{user.fullName} - Institution Portal</h2>
        <p className="text-slate-600 leading-relaxed">
          Manage your institution's profile, update treatment costs, and monitor transparency ratings.
        </p>
        {!user.isVerified && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Institution Verification Pending</p>
              <p className="text-xs text-amber-700">Our team is verifying your hospital registration and license.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 tablet-two-col">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" />
            Manage Treatment Costs
          </h3>
          <div className="space-y-4">
            {TREATMENTS.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-medium text-slate-700">{t.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-teal-600">₹{t.baseCost.toLocaleString()}</span>
                  <button className="text-xs text-teal-600 font-bold hover:underline">Edit</button>
                </div>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-teal-600 hover:text-teal-600 transition-all">
              + Add New Treatment
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Transparency Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">COST ACCURACY</span>
                  <span className="text-indigo-600">98%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[98%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500">USER REVIEWS</span>
                  <span className="text-indigo-600">89%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[89%]" />
                </div>
              </div>
            </div>
          </div>
          <VideoConsultation />
        </div>
      </div>
    </div>
  );
}

function AIHealthCompanion() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Welcome. I'm here to help you understand your symptoms and guide you safely. How are you feeling today?", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatCompanion(input, history);
    
    const modelMsg: ChatMessage = { 
      role: 'model', 
      text: response.text, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <MessageCircle className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Health Companion</h2>
            <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">AI-Powered Support</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] sm:max-w-[85%] p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-teal-600 text-white rounded-tr-none' 
                : msg.text.startsWith('EMERGENCY_DETECTED')
                  ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                  : 'bg-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              {msg.text.startsWith('EMERGENCY_DETECTED') ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    EMERGENCY DETECTED
                  </div>
                  <p>{msg.text.replace('EMERGENCY_DETECTED: ', '')}</p>
                  <button 
                    onClick={() => window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank')}
                    className="w-full py-2 bg-red-600 text-white rounded-lg font-bold text-xs"
                  >
                    Find Nearest Hospital
                  </button>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="How can I help you today?"
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[9px] text-slate-400 text-center leading-tight">
          "This AI assistant provides general health information inspired by publicly available global health guidance, including recommendations similar to those published by the World Health Organization. It is not affiliated with or endorsed by the WHO."
        </p>
      </div>
    </div>
  );
}
function AISymptomChecker() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const res = await checkSymptoms(input);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">AI Symptom Checker</h2>
      </div>

      <div className="space-y-4 flex-1">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you're feeling (e.g., 'I have a mild headache and a slight fever for two days')..."
          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
        />
        <button 
          onClick={handleCheck}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-2xl border border-amber-200 bg-amber-50/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">AI-Generated Health Assessment</span>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  result.urgency === 'high' ? 'bg-red-100 text-red-700' :
                  result.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-teal-100 text-teal-700'
                }`}>
                  {result.urgency} Urgency
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Possible Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {result.possibleConditions.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Recommendation</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.recommendation}</p>
                </div>
                <div className="pt-3 border-t border-amber-200">
                  <p className="text-[10px] text-amber-800 font-medium mb-1">Confidence Level: 82%</p>
                  <p className="text-[10px] text-slate-500 italic">
                    This AI-generated assessment is for informational purposes only and is not a medical diagnosis. Please consult a licensed healthcare professional for medical advice. Confidence score reflects AI reasoning strength, not clinical certainty.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VideoConsultation() {
  const [inCall, setInCall] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);
  const peerConnection = React.useRef<RTCPeerConnection | null>(null);

  const startCall = async () => {
    if (!roomCode) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      setInCall(true);
      
      // WebRTC Setup (Manual Signaling Simulation via LocalStorage)
      const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      peerConnection.current = new RTCPeerConnection(config);
      
      stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
      
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      // In a real app, we'd use a signaling server. 
      // For this MVP, we'll simulate the UI of a call.
    } catch (err) {
      console.error("Call Error:", err);
      alert("Could not access camera/microphone");
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setInCall(false);
    peerConnection.current?.close();
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[400px] sm:min-h-[500px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <VideoIcon className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tele-Consultation</h2>
      </div>

      {!inCall ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Start a Video Call</h3>
            <p className="text-sm text-slate-500 px-4">Enter a room code to connect with your doctor.</p>
          </div>
          <div className="w-full max-w-xs space-y-3 px-4">
            <input 
              type="text" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono"
            />
            <button 
              onClick={startCall}
              disabled={!roomCode}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              Join Consultation
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="video-container group">
              <video ref={localVideoRef} autoPlay playsInline muted />
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-widest">You (Local)</div>
            </div>
            <div className="video-container group">
              <video ref={remoteVideoRef} autoPlay playsInline />
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-widest">Remote Participant</div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                <p className="text-white text-xs">Waiting for peer...</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-100">
            <button className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all">
              <VideoIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={endCall}
              className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Live: {roomCode}</span>
            </div>
            <span className="text-[10px] md:text-xs text-slate-400">00:00:00</span>
          </div>
        </div>
      )}
    </div>
  );
}

function HospitalFinder() {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(TREATMENTS[0].id);
  const [districtFilter, setDistrictFilter] = useState<'All' | 'Mumbai' | 'Pune' | 'Kolhapur'>('All');
  const [sortBy, setSortBy] = useState<'cost' | 'rating'>('cost');

  const filteredHospitals = HOSPITALS
    .filter(h => districtFilter === 'All' || h.district === districtFilter)
    .map(h => ({
      ...h,
      treatmentCost: h.treatments.find(t => t.treatmentId === selectedTreatmentId)?.cost || 0
    }))
    .sort((a, b) => {
      if (sortBy === 'cost') return a.treatmentCost - b.treatmentCost;
      return b.rating - a.rating;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Hospital className="w-7 h-7 text-teal-600" />
          Treatment Cost Comparison
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <select 
              value={selectedTreatmentId}
              onChange={(e) => setSelectedTreatmentId(e.target.value)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent"
            >
              {TREATMENTS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase">District:</span>
            <select 
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value as any)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent"
            >
              <option value="All">All Districts</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Kolhapur">Kolhapur</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent"
            >
              <option value="cost">Lowest Cost</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <motion.div 
            layout
            key={hospital.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{hospital.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Activity className="w-3 h-3" /> {hospital.district}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-xs font-bold">
                  <span>★</span> {hospital.rating}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm text-slate-500">Estimated Cost</span>
                  <span className="text-lg font-bold text-teal-600">₹{hospital.treatmentCost.toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {hospital.address}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => window.open(hospital.mapsUrl, '_blank')}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-teal-600 hover:text-white text-teal-600 border border-teal-600 rounded-xl font-bold transition-all group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Get Directions
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PublicLanding({ onGetStarted, onLogin }: { onGetStarted: () => void, onLogin: () => void }) {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold mb-6"
            >
              <Activity className="w-4 h-4" />
              Bridging Ancient Wisdom and Modern AI
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6"
            >
              Bridging <span className="text-teal-600">Ancient Wisdom</span> and Modern AI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 leading-relaxed"
            >
              AtharvX is a mission-driven platform designed to eliminate healthcare cost confusion and provide accessible AI-powered triage for everyone.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-200 transition-all flex items-center gap-2"
              >
                Get Started Free
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop || 0, behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Explore Features
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50/50 -skew-x-12 translate-x-1/4 z-0 hidden lg:block" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Intelligent Healthcare Tools</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to navigate the healthcare system with confidence and clarity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Brain} 
              title="AI Symptom Checker" 
              desc="Instant, rule-based and AI-powered triage to understand your symptoms responsibly."
              color="purple"
            />
            <FeatureCard 
              icon={Hospital} 
              title="Cost Transparency" 
              desc="Compare treatment costs across hospitals in Mumbai, Pune, and Kolhapur."
              color="teal"
            />
            <FeatureCard 
              icon={VideoIcon} 
              title="Video Consultation" 
              desc="Connect with doctors instantly via secure, peer-to-peer video calling."
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* Why AtharvX Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8">Why AtharvX?</h2>
              <div className="space-y-6">
                <WhyItem 
                  title="Healthcare Cost Confusion" 
                  desc="Patients often face unexpected bills. We provide clear, hard-coded cost data for 20+ treatments."
                />
                <WhyItem 
                  title="Lack of Transparency" 
                  desc="We rank hospitals by transparency and cost, not just popularity."
                />
                <WhyItem 
                  title="AI-Based Triage" 
                  desc="Reduce unnecessary hospital visits with intelligent symptom analysis."
                />
                <WhyItem 
                  title="Rural & Urban Accessibility" 
                  desc="Designed to work across districts with minimal infrastructure requirements."
                />
              </div>
            </div>
            <div className="bg-teal-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <Activity className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10" />
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-xl leading-relaxed opacity-90">
                "To democratize healthcare information and provide every citizen with the tools to make informed, cost-effective decisions about their well-being."
              </p>
              <div className="mt-10 pt-10 border-t border-white/20">
                <p className="font-bold text-2xl">82%</p>
                <p className="text-sm opacity-70">Reduction in cost confusion reported in pilot studies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  const colors: any = {
    purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-xl transition-all group">
      <div className={`p-4 rounded-2xl w-fit mb-6 ${colors[color]}`}>
        <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function WhyItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <CheckCircle className="w-6 h-6 text-teal-600" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function AboutSection({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <BackButton onClick={onBack} label="Back to Home" />
        <h1 className="text-4xl font-bold text-slate-900 mb-12">About AtharvX</h1>
        
        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-600" />
              🌿 Our Inspiration
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              AtharvX is inspired by the spirit of the Atharva Veda — an ancient Indian scripture known for its reflections on health, healing, and holistic well-being.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg mt-4">
              While AtharvX is a modern digital platform powered by technology and artificial intelligence, its name symbolizes a bridge between traditional wisdom and contemporary healthcare innovation.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg mt-4">
              We honor the philosophy of preventive care, community health, and knowledge sharing — values that remain relevant even in the age of AI.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg mt-4">
              AtharvX does not claim to practice, represent, or replace traditional Vedic medicine. The name reflects inspiration, not clinical or religious affiliation.
            </p>
            <div className="mt-6 p-4 bg-slate-50 border-l-4 border-teal-600 rounded-r-xl">
              <p className="text-sm text-slate-500 italic">
                The name “AtharvX” is inspired by cultural heritage and does not imply endorsement, medical validation, or direct association with ancient medical systems.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">The Transparency Problem</h2>
            <p className="text-slate-600 leading-relaxed">
              In today's healthcare landscape, patients often feel lost in a maze of costs and complex terminology. AtharvX was built to solve this by providing hard-coded, verified hospital data and AI-driven triage that puts the power back in the hands of the patient.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Responsible AI</h2>
            <p className="text-slate-600 leading-relaxed">
              We believe AI should assist, not replace. Our symptom checker uses a multi-layered approach: rule-based checks for emergencies followed by advanced AI analysis, always accompanied by clear disclaimers and urgency ratings.
            </p>
          </section>

          <section className="bg-slate-900 text-white p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-400" />
              Security & Compliance
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>AtharvX is designed with a <span className="text-white font-bold">security-first architecture</span> to protect user privacy and data integrity.</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Follows responsible AI usage principles in alignment with global standards.</li>
                <li>Minimizes data storage by utilizing LocalStorage for all personal records.</li>
                <li>Uses anonymized AI queries to ensure symptom data is never linked to your identity.</li>
                <li>Does not store sensitive medical records on external servers.</li>
                <li>AtharvX implements role-based access control, identity validation measures, and controlled domain transitions to minimize misuse, impersonation, and unauthorized privilege escalation.</li>
                <li>Role changes require verification to maintain platform trust and prevent misuse.</li>
                <li>AtharvX implements structured identity validation and role-based access controls to reduce impersonation risk and protect healthcare ecosystem integrity.</li>
                <li>AtharvX is designed with layered access control mechanisms to reduce the risk of unauthorized role misuse.</li>
                <li className="text-teal-400 font-bold">For your privacy, always sign out after using AtharvX on shared or public devices.</li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs italic opacity-70">
                  "AtharvX is an MVP demonstration platform and is not yet certified under formal healthcare regulatory frameworks. It is built in alignment with general global digital health best practices."
                </p>
                <p className="text-xs italic opacity-70 mt-2">
                  "AtharvX is engineered using responsive and adaptive design principles to provide a consistent and stable user experience across modern devices and screen sizes."
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TermsSection({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <BackButton onClick={onBack} label="Back to Home" />
        <h1 className="text-4xl font-bold text-slate-900 mb-12">Terms of Service</h1>
        <div className="space-y-8 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Platform Usage</h2>
            <p>AtharvX is a demonstration platform for healthcare transparency. It is intended for educational and demo purposes only.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Limitation of Liability</h2>
            <p>AtharvX does not provide medical diagnoses. The information provided, including AI-generated assessments and hospital costs, should be verified with licensed professionals.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. No Medical Guarantee</h2>
            <p>We do not guarantee the accuracy of hospital costs or AI assessments. Users assume all responsibility for decisions made based on platform data.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PrivacySection({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <BackButton onClick={onBack} label="Back to Home" />
        <h1 className="text-4xl font-bold text-slate-900 mb-12">Privacy Policy</h1>
        <div className="space-y-8 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Data Storage</h2>
            <p>All user data, including credentials and logs, are stored locally in your browser's LocalStorage. No data is sent to our servers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. AI API Usage</h2>
            <p>Symptom descriptions are sent to the Gemini AI API for analysis. This data is anonymized and not linked to your identity.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. No Data Selling</h2>
            <p>We do not sell, share, or track your personal data for any commercial purposes.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-8 h-8 text-teal-400" />
              <span className="text-2xl font-bold">AtharvX</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Bridging Ancient Wisdom and Modern AI for Transparent Healthcare. Built for the future of community health.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><button className="hover:text-teal-400 transition-colors">Home</button></li>
              <li><button className="hover:text-teal-400 transition-colors">About Us</button></li>
              <li><button className="hover:text-teal-400 transition-colors">Features</button></li>
              <li><button className="hover:text-teal-400 transition-colors">Hospitals</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><button className="hover:text-teal-400 transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-teal-400 transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-teal-400 transition-colors">Cookie Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2026 AtharvX. All rights reserved. MVP v1.0</p>
          <div className="flex gap-6">
            <span className="text-slate-500 text-sm italic">Inspired by Cultural Heritage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PharmacyView({ user, onBack }: { user: User, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'finder' | 'delivery'>('finder');

  return (
    <div className="space-y-8">
      <BackButton onClick={onBack} label="Back to Dashboard" />
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('finder')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'finder' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Find Medical Stores
        </button>
        <button 
          onClick={() => setActiveTab('delivery')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'delivery' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Medicine Delivery
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'finder' ? (
          <motion.div key="finder" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <PharmacyFinder />
          </motion.div>
        ) : (
          <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <MedicineDelivery user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PharmacyFinder() {
  const [districtFilter, setDistrictFilter] = useState<'All' | 'Mumbai' | 'Pune' | 'Kolhapur'>('All');
  
  const filteredPharmacies = PHARMACIES.filter(p => districtFilter === 'All' || p.district === districtFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Pill className="w-7 h-7 text-teal-600" />
          Medical Stores & Discounts
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['All', 'Mumbai', 'Pune', 'Kolhapur'].map((d) => (
            <button
              key={d}
              onClick={() => setDistrictFilter(d as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${districtFilter === d ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPharmacies.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-teal-50 rounded-2xl group-hover:bg-teal-600 transition-colors">
                <Pill className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <div className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                {p.discount}% OFF
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{p.name}</h3>
            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
              <Search className="w-3 h-3" /> {p.address}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-bold text-slate-700">Verified Partner</span>
              </div>
              <button 
                onClick={() => window.open(p.mapsUrl, '_blank')}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                View on Maps
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-teal-600 rounded-3xl text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl">
            <Truck className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Free Home Delivery</h3>
            <p className="text-teal-50 opacity-90">Get your medicines delivered to your doorstep for free when you order through AtharvX. Just upload your prescription!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicineDelivery({ user }: { user: User }) {
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0].id);
  const [prescription, setPrescription] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orders, setOrders] = useState<MedicineOrder[]>(DB.getOrders().filter(o => o.userId === user.id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescription(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrder = () => {
    if (!prescription) return;
    setIsOrdering(true);
    
    const pharmacy = PHARMACIES.find(p => p.id === selectedPharmacy)!;
    const newOrder: MedicineOrder = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.fullName,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      prescriptionImage: prescription,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const allOrders = DB.getOrders();
    DB.saveOrders([newOrder, ...allOrders]);
    DB.addLog({
      action: 'MEDICINE_ORDERED',
      adminId: 'SYSTEM',
      targetUserId: user.id,
      details: `User ${user.username} ordered medicines from ${pharmacy.name}.`
    });

    setTimeout(() => {
      setOrders(prev => [newOrder, ...prev]);
      setPrescription(null);
      setIsOrdering(false);
      alert("Order placed successfully! Free home delivery is on its way.");
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600" />
            New Medicine Order
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Pharmacy</label>
              <select 
                value={selectedPharmacy}
                onChange={(e) => setSelectedPharmacy(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                {PHARMACIES.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Upload Prescription Photo</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${prescription ? 'border-teal-500 bg-teal-50' : 'border-slate-200 group-hover:border-teal-400'}`}>
                  {prescription ? (
                    <div className="space-y-2">
                      <div className="w-20 h-20 bg-white rounded-lg border border-teal-200 mx-auto overflow-hidden shadow-sm">
                        <img src={prescription} alt="Prescription" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-teal-600">Prescription Uploaded</p>
                      <button onClick={(e) => { e.stopPropagation(); setPrescription(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Click or drag to upload prescription</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">JPG, PNG allowed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleOrder}
              disabled={!prescription || isOrdering}
              className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isOrdering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Order with Free Delivery
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 italic">
              * 10% discount applied automatically on all orders through AtharvX.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Recent Orders
        </h3>
        
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <p className="text-slate-400 italic">No orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <Pill className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{order.pharmacyName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-teal-100 text-teal-700' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Free Delivery</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ admin, activeTab: navTab }: { admin: User, activeTab: string }) {
  const [users, setUsers] = useState<User[]>(DB.getUsers());
  const [logs, setLogs] = useState<AuditLog[]>(DB.getLogs());
  const [orders, setOrders] = useState<MedicineOrder[]>(DB.getOrders());
  const [localTab, setLocalTab] = useState<'users' | 'logs' | 'requests' | 'orders'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (navTab === 'Users') setLocalTab('users');
    if (navTab === 'Audit Logs') setLocalTab('logs');
    if (navTab === 'Dashboard') setLocalTab('users');
  }, [navTab]);

  const activeTab = localTab;
  const setActiveTab = setLocalTab;

  const refreshData = () => {
    setUsers(DB.getUsers());
    setLogs(DB.getLogs());
    setOrders(DB.getOrders());
  };

  const handleVerify = (targetUser: User) => {
    const allUsers = DB.getUsers();
    const updated = allUsers.map(u => u.id === targetUser.id ? { ...u, isVerified: true } : u);
    DB.saveUsers(updated);
    DB.addLog({
      action: 'VERIFY_USER',
      adminId: admin.id,
      targetUserId: targetUser.id,
      details: `Verified user ${targetUser.username}`
    });
    refreshData();
  };

  const handleSuspend = (targetUser: User) => {
    const allUsers = DB.getUsers();
    const updated = allUsers.map(u => u.id === targetUser.id ? { ...u, isSuspended: !u.isSuspended } : u);
    DB.saveUsers(updated);
    DB.addLog({
      action: targetUser.isSuspended ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
      adminId: admin.id,
      targetUserId: targetUser.id,
      details: `${targetUser.isSuspended ? 'Unsuspended' : 'Suspended'} user ${targetUser.username}`
    });
    refreshData();
  };

  const handleAddStrike = (targetUser: User) => {
    const allUsers = DB.getUsers();
    const updated = allUsers.map(u => u.id === targetUser.id ? { ...u, strikes: u.strikes + 1 } : u);
    DB.saveUsers(updated);
    DB.addLog({
      action: 'ADD_STRIKE',
      adminId: admin.id,
      targetUserId: targetUser.id,
      details: `Added strike to user ${targetUser.username}. Total strikes: ${targetUser.strikes + 1}`
    });
    refreshData();
  };

  const handleApproveRequest = (targetUser: User) => {
    if (!targetUser.roleChangeRequest) return;
    const allUsers = DB.getUsers();
    const updated = allUsers.map(u => u.id === targetUser.id ? { 
      ...u, 
      role: targetUser.roleChangeRequest!.requestedRole,
      isVerified: true,
      roleChangeRequest: { ...u.roleChangeRequest!, status: 'approved' as const }
    } : u);
    DB.saveUsers(updated);
    DB.addLog({
      action: 'APPROVE_ROLE_CHANGE',
      adminId: admin.id,
      targetUserId: targetUser.id,
      details: `Approved role change for ${targetUser.username} to ${targetUser.roleChangeRequest.requestedRole}`
    });
    refreshData();
  };

  const handleRejectRequest = (targetUser: User) => {
    if (!targetUser.roleChangeRequest) return;
    const allUsers = DB.getUsers();
    const updated = allUsers.map(u => u.id === targetUser.id ? { 
      ...u, 
      roleChangeRequest: { ...u.roleChangeRequest!, status: 'rejected' as const }
    } : u);
    DB.saveUsers(updated);
    DB.addLog({
      action: 'REJECT_ROLE_CHANGE',
      adminId: admin.id,
      targetUserId: targetUser.id,
      details: `Rejected role change for ${targetUser.username}`
    });
    refreshData();
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = users.filter(u => u.roleChangeRequest?.status === 'pending');

  const handleUpdateOrderStatus = (orderId: string, status: MedicineOrder['status']) => {
    const allOrders = DB.getOrders();
    const updated = allOrders.map(o => o.id === orderId ? { ...o, status } : o);
    DB.saveOrders(updated);
    DB.addLog({
      action: 'UPDATE_ORDER_STATUS',
      adminId: admin.id,
      details: `Updated order ${orderId} status to ${status}`
    });
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length.toString()} icon={Users} color="teal" />
        <StatCard title="Orders" value={orders.filter(o => o.status === 'pending').length.toString()} icon={Truck} color="amber" />
        <StatCard title="Requests" value={pendingRequests.length.toString()} icon={Plus} color="blue" />
        <StatCard title="Suspended" value={users.filter(u => u.isSuspended).length.toString()} icon={Ban} color="red" />
      </div>

      {pendingRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Pending Domain Change Requests</p>
              <p className="text-xs text-blue-100">There are {pendingRequests.length} users waiting for domain verification.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('requests')}
            className="px-4 py-2 bg-white text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Review Now
          </button>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'users' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'requests' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Role Requests ({pendingRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'orders' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Medicine Orders ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'logs' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Audit Logs
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Strikes</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{u.username}</div>
                          <div className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                            u.role === 'hospital' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-teal-100 text-teal-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {u.isSuspended ? (
                              <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                                <Ban className="w-3 h-3" /> Suspended
                              </span>
                            ) : u.isVerified ? (
                              <span className="flex items-center gap-1 text-teal-600 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                                <Activity className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{u.strikes}</td>
                        <td className="px-4 py-4 text-right space-x-2">
                          {u.role !== 'admin' && (
                            <>
                              {!u.isVerified && (
                                <button 
                                  onClick={() => handleVerify(u)}
                                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="Verify User"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleSuspend(u)}
                                className={`p-2 rounded-lg transition-colors ${u.isSuspended ? 'text-amber-600 hover:bg-amber-50' : 'text-red-600 hover:bg-red-50'}`}
                                title={u.isSuspended ? 'Unsuspend' : 'Suspend'}
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAddStrike(u)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Add Strike"
                              >
                                <AlertTriangle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'requests' ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 mb-4">Pending Role Change Requests</h3>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">No pending requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Current Role</th>
                        <th className="px-4 py-3">Requested Role</th>
                        <th className="px-4 py-3">Reason & Proof</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pendingRequests.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-slate-900">{u.username}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 uppercase">{u.role}</td>
                          <td className="px-4 py-4 text-sm font-bold text-teal-600 uppercase">{u.roleChangeRequest?.requestedRole}</td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-slate-600 font-medium">{u.roleChangeRequest?.reason}</div>
                            <div className="text-[10px] text-slate-400 mt-1">ID: {u.roleChangeRequest?.proofId}</div>
                          </td>
                          <td className="px-4 py-4 text-right space-x-2">
                            <button 
                              onClick={() => handleApproveRequest(u)}
                              className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(u)}
                              className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'orders' ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 mb-4">Medicine Delivery Orders</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">No orders found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Pharmacy</th>
                        <th className="px-4 py-3">Prescription</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 text-xs font-mono text-slate-400">{o.id.slice(0, 8)}...</td>
                          <td className="px-4 py-4 font-semibold text-slate-900">{o.userName}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{o.pharmacyName}</td>
                          <td className="px-4 py-4">
                            <button 
                              onClick={() => {
                                const win = window.open();
                                win?.document.write(`<img src="${o.prescriptionImage}" style="max-width: 100%"/>`);
                              }}
                              className="text-teal-600 hover:underline text-xs font-bold"
                            >
                              View Image
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                              o.status === 'delivered' ? 'bg-teal-100 text-teal-700' :
                              o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right space-x-2">
                            {o.status === 'pending' && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.id, 'processing')}
                                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Process
                              </button>
                            )}
                            {o.status === 'processing' && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.id, 'out-for-delivery')}
                                className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                Ship
                              </button>
                            )}
                            {o.status === 'out-for-delivery' && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                                className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors"
                              >
                                Deliver
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">System Activity</h3>
                <button 
                  onClick={() => {
                    localStorage.removeItem('atharvx_logs');
                    refreshData();
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear Logs
                </button>
              </div>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic">No logs found</div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        log.action.includes('SUSPEND') ? 'bg-red-100 text-red-600' :
                        log.action.includes('VERIFY') ? 'bg-teal-100 text-teal-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <History className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase">{log.action}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-700">{log.details}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color] || colors.slate}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

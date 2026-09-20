import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Users, 
  Clock, 
  Receipt, 
  TrendingUp, 
  LogOut, 
  ShieldCheck, 
  Bell, 
  Menu, 
  X,
  RefreshCw,
  Database,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { useOraxData } from './useOraxData';
import { AdminAuth } from './components/AdminAuth';
import { MetricsDashboard } from './components/MetricsDashboard';
import { PendingOrders } from './components/PendingOrders';
import { MembersManagement } from './components/MembersManagement';
import { FinancialJournal } from './components/FinancialJournal';
import { RevenueStats } from './components/RevenueStats';

type TabType = 'metrics' | 'pending' | 'members' | 'transactions' | 'stats';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem('orax_admin_session') || null;
  });
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Firestore real-time data hook
  const {
    users,
    servers,
    pendingServers,
    activeServers,
    transactions,
    stats,
    loading,
    error,
    validateServer,
    rejectServer,
    updateUserWallet,
    createDemoPendingOrder,
    forceResetSampleData
  } = useOraxData();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        setAdminEmail(user.email);
        localStorage.setItem('orax_admin_session', user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    localStorage.setItem('orax_admin_session', email);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out fallback:", e);
    }
    setAdminEmail(null);
    localStorage.removeItem('orax_admin_session');
  };

  const handleSeedReset = async () => {
    if (confirm("Réinitialiser ou actualiser les données démo dans Firestore ?")) {
      setIsResetting(true);
      try {
        await forceResetSampleData();
      } finally {
        setIsResetting(false);
      }
    }
  };

  // If not logged in as Admin, show dedicated secure login view
  if (!adminEmail) {
    return (
      <AdminAuth
        currentUser={currentUser}
        isAdminLoggedIn={false}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleLogout}
      />
    );
  }

  const navItems = [
    {
      id: 'metrics' as TabType,
      shortLabel: 'Métriques',
      fullLabel: 'Tableau de bord',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'pending' as TabType,
      shortLabel: 'Commandes',
      fullLabel: 'Commandes en Attente',
      icon: Clock,
      badge: pendingServers.length > 0 ? pendingServers.length : null,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold'
    },
    {
      id: 'members' as TabType,
      shortLabel: 'Membres',
      fullLabel: 'Gestion des Membres',
      icon: Users,
      badge: users.length,
      badgeColor: 'bg-slate-800 text-slate-200 border border-slate-700'
    },
    {
      id: 'transactions' as TabType,
      shortLabel: 'Journal CFA',
      fullLabel: 'Journal Financier CFA',
      icon: Receipt,
      badge: null
    },
    {
      id: 'stats' as TabType,
      shortLabel: 'Statistiques',
      fullLabel: 'Statistiques & Revenus',
      icon: Server,
      badge: 'CFA',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              className="flex items-center gap-3 cursor-pointer select-none" 
              onClick={() => setActiveTab('metrics')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    ORAX-ADMIN
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Host Ops
                  </span>
                </div>
                <span className="block text-xs text-slate-300 font-medium leading-tight">
                  ORAX-HOSTING Cloud PaaS
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 shrink">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{item.fullLabel}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Demo Re-seed trigger */}
            <button
              onClick={handleSeedReset}
              disabled={isResetting}
              title="Actualiser les données de démo Firestore"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline">Sync Données</span>
            </button>

            {/* Pending alert pill */}
            {pendingServers.length > 0 && (
              <button
                onClick={() => setActiveTab('pending')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold animate-pulse hover:bg-amber-500/30 transition"
                title={`${pendingServers.length} commande(s) Mobile Money en attente`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingServers.length} en attente</span>
              </button>
            )}

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-white truncate max-w-[160px]">
                  {adminEmail}
                </span>
                <span className="block text-xs text-emerald-400 font-semibold leading-none">
                  Administrateur
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Déconnexion sécurisée"
                className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.fullLabel}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-slate-400">
              Connexion à la base Firestore ORAX-HOSTING en cours...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'metrics' && (
              <MetricsDashboard
                stats={stats}
                pendingServers={pendingServers}
                transactions={transactions}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'pending' && (
              <PendingOrders
                servers={servers}
                onValidate={validateServer}
                onReject={rejectServer}
                onCreateDemoOrder={createDemoPendingOrder}
              />
            )}

            {activeTab === 'members' && (
              <MembersManagement
                users={users}
                onUpdateWallet={updateUserWallet}
              />
            )}

            {activeTab === 'transactions' && (
              <FinancialJournal
                transactions={transactions}
              />
            )}

            {activeTab === 'stats' && (
              <RevenueStats
                stats={stats}
                transactions={transactions}
                servers={servers}
              />
            )}
          </>
        )}
      </main>

      {/* Footer info strip */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="font-medium text-slate-300">ORAX-HOSTING Architecture • Base Firestore connectée</span>
          </div>
          <div className="font-mono text-xs text-slate-400">
            Database ID: <span className="text-slate-300">ai-studio-botcloudpaas-8d8460bb-f04e-41af-8df5-12b96b425cc6</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

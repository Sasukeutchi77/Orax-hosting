import React from 'react';
import { 
  Users, 
  Server, 
  Clock, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { SystemStats, HostingServer, FinancialTransaction } from '../types';

interface MetricsDashboardProps {
  stats: SystemStats;
  pendingServers: HostingServer[];
  transactions: FinancialTransaction[];
  onNavigateTab: (tab: 'pending' | 'members' | 'transactions' | 'stats') => void;
}

export function MetricsDashboard({
  stats,
  pendingServers,
  transactions,
  onNavigateTab
}: MetricsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Infrastructure ORAX Opérationnelle
              </span>
              <span className="text-xs text-slate-300 font-medium">Nœuds Abidjan & Dakar en ligne</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Tableau de bord de surveillance ORAX-HOSTING
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Surveillance en temps réel des souscriptions cloud, validation des paiements Mobile Money (Orange, Wave, Airtel) et gestion des instances serveurs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigateTab('pending')}
              className="inline-flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{pendingServers.length} commande(s) en attente</span>
            </button>
            <button
              onClick={() => onNavigateTab('stats')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Rapport Revenus</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Required Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Members */}
        <div 
          onClick={() => onNavigateTab('members')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 cursor-pointer transition shadow-sm group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Membres Inscrits</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalMembers}
            </span>
            <span className="text-xs text-blue-300 font-semibold">comptes vérifiés</span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Gestion des portefeuilles</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Metric 2: Total Active Servers */}
        <div 
          onClick={() => onNavigateTab('pending')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 cursor-pointer transition shadow-sm group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Serveurs Actifs</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalActiveServers}
            </span>
            <span className="text-xs text-emerald-300 font-semibold">instances déployées</span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>VPS, Game & Bot PaaS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Metric 3: Pending Servers */}
        <div 
          onClick={() => onNavigateTab('pending')}
          className={`border rounded-2xl p-6 cursor-pointer transition shadow-sm group hover:-translate-y-0.5 ${
            stats.pendingServers > 0 
              ? 'border-amber-500/50 bg-amber-950/20' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Serveurs en Attente</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition ${
              stats.pendingServers > 0 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {stats.pendingServers}
            </span>
            <span className={`text-xs font-semibold ${stats.pendingServers > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
              {stats.pendingServers > 0 ? 'Action requise' : 'À jour'}
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Paiements Mobile Money</span>
            {stats.pendingServers > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 text-xs font-bold border border-amber-500/40">
                À traiter
              </span>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>

        {/* Metric 4: Total Revenue in FCFA */}
        <div 
          onClick={() => onNavigateTab('stats')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 cursor-pointer transition shadow-sm group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Revenus Totaux Encaissés</span>
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalRevenueCFA.toLocaleString('fr-FR')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
              FCFA
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Aujourd'hui : <strong className="text-white font-mono">{stats.todayRevenueCFA.toLocaleString('fr-FR')} F</strong></span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
        </div>
      </div>

      {/* Quick Summary Grid: Pending highlights & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders Spotlight (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Commandes en attente de vérification</h3>
            </div>
            <button
              onClick={() => onNavigateTab('pending')}
              className="text-xs text-indigo-300 hover:text-white font-semibold inline-flex items-center gap-1.5 transition"
            >
              <span>Voir tout ({pendingServers.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingServers.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/60 p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-200">Toutes les commandes sont à jour</p>
              <p className="text-xs text-slate-400 mt-1">Aucun serveur payé par Mobile Money n'est actuellement en attente.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingServers.slice(0, 3).map((server) => (
                <div 
                  key={server.id}
                  className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm">{server.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {server.planName}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        server.paymentMethod === 'Wave' 
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : server.paymentMethod === 'Orange Money'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {server.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                      <span>Client : <strong className="text-white font-normal">{server.userEmail}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Réf : <strong className="font-mono text-indigo-300 font-semibold">{server.transactionReference || 'Non spécifié'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-bold text-white font-mono">
                        {server.priceCFA.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs font-bold text-slate-300 ml-1.5">FCFA</span>
                    </div>
                    <button
                      onClick={() => onNavigateTab('pending')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20"
                    >
                      Traiter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Transaction Feed Preview (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Derniers Flux CFA</h3>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-indigo-300 hover:text-white font-semibold inline-flex items-center gap-1.5 transition"
            >
              <span>Journal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map((tx) => (
              <div 
                key={tx.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">
                    {tx.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-medium">{tx.paymentMethod}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs font-bold font-mono ${
                    tx.status === 'completed' ? 'text-emerald-400' : tx.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    +{tx.amountCFA.toLocaleString('fr-FR')} F
                  </div>
                  <div className="text-xs font-medium text-slate-300">
                    {tx.status === 'completed' ? 'Validé' : tx.status === 'pending' ? 'En cours' : 'Échoué'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

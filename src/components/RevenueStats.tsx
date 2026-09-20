import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Smartphone, 
  PieChart, 
  BarChart3, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers,
  Percent,
  CalendarDays
} from 'lucide-react';
import { SystemStats, FinancialTransaction, HostingServer } from '../types';

interface RevenueStatsProps {
  stats: SystemStats;
  transactions: FinancialTransaction[];
  servers: HostingServer[];
}

export function RevenueStats({ stats, transactions, servers }: RevenueStatsProps) {
  // Aggregate by payment operator
  const operatorBreakdown: Record<string, { count: number; totalCFA: number }> = {
    'Wave': { count: 0, totalCFA: 0 },
    'Orange Money': { count: 0, totalCFA: 0 },
    'Airtel Money': { count: 0, totalCFA: 0 },
    'Portefeuille ORAX': { count: 0, totalCFA: 0 },
  };

  const validTransactions = transactions.filter(t => t.status === 'completed');

  validTransactions.forEach(t => {
    const method = t.paymentMethod || 'Autre';
    if (!operatorBreakdown[method]) {
      operatorBreakdown[method] = { count: 0, totalCFA: 0 };
    }
    operatorBreakdown[method].count += 1;
    operatorBreakdown[method].totalCFA += t.amountCFA || 0;
  });

  const totalValidRevenue = validTransactions.reduce((acc, curr) => acc + (curr.amountCFA || 0), 0) || 1;

  // Aggregate by Server Category
  const categoryBreakdown: Record<string, { count: number; totalCFA: number }> = {};
  servers.forEach(s => {
    const cat = s.category || 'VPS';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { count: 0, totalCFA: 0 };
    }
    categoryBreakdown[cat].count += 1;
    if (s.status === 'active') {
      categoryBreakdown[cat].totalCFA += s.priceCFA || 0;
    }
  });

  // Calculate average order value
  const avgOrderCFA = validTransactions.length > 0 
    ? Math.round(stats.totalRevenueCFA / validTransactions.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              <span>Statistiques Globales des Revenus ORAX-HOSTING</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Analyse financière consolidée, répartition par opérateur Mobile Money et prévisions de récurrence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              Devise de référence : FCFA (XOF/XAF)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Executive Financial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2.5 font-bold uppercase tracking-wider">
            <span>Chiffre d'Affaires Global</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {stats.totalRevenueCFA.toLocaleString('fr-FR')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              FCFA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Sur l'ensemble des souscriptions validées
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2.5 font-bold uppercase tracking-wider">
            <span>Revenu Mensuel Récurrent (MRR)</span>
            <CalendarDays className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {servers
                .filter(s => s.status === 'active')
                .reduce((sum, s) => sum + s.priceCFA, 0)
                .toLocaleString('fr-FR')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              FCFA/mois
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Basé sur les {servers.filter(s => s.status === 'active').length} serveurs en production
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2.5 font-bold uppercase tracking-wider">
            <span>Panier Moyen par Commande</span>
            <Percent className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {avgOrderCFA.toLocaleString('fr-FR')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
              FCFA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Calculé sur {validTransactions.length} paiements validés
          </p>
        </div>
      </div>

      {/* Distribution by Mobile Money Operator & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Money Operator Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Répartition Mobile Money (Orange, Wave, Airtel)</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Part</span>
          </div>

          <div className="space-y-5">
            {Object.entries(operatorBreakdown).map(([op, data]) => {
              const percentage = Math.round((data.totalCFA / totalValidRevenue) * 100);
              const color = 
                op === 'Wave' ? 'bg-sky-500' :
                op === 'Orange Money' ? 'bg-amber-500' :
                op === 'Airtel Money' ? 'bg-rose-500' : 'bg-indigo-500';

              return (
                <div key={op} className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${color}`}></span>
                      {op}
                    </span>
                    <div className="text-right space-x-2">
                      <span className="font-mono font-bold text-white">
                        {data.totalCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-slate-400 font-semibold">({percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 text-right font-medium">
                    {data.count} transaction(s) réussie(s)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Revenus par Type d'Hébergement</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalogue</span>
          </div>

          <div className="space-y-5">
            {Object.entries(categoryBreakdown).map(([cat, data]) => {
              const totalCatRev = Object.values(categoryBreakdown).reduce((s, c) => s + c.totalCFA, 0) || 1;
              const percentage = Math.round((data.totalCFA / totalCatRev) * 100);

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-bold text-white">
                      {cat} ({data.count} instances)
                    </span>
                    <div className="text-right space-x-2">
                      <span className="font-mono font-bold text-white">
                        {data.totalCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-slate-400 font-semibold">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Croissance estimée des souscriptions</span>
            <span className="text-emerald-400 font-bold font-mono">+28.4% ce mois</span>
          </div>
        </div>
      </div>
    </div>
  );
}

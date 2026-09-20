import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Smartphone,
  Wallet,
  Calendar
} from 'lucide-react';
import { FinancialTransaction } from '../types';

interface FinancialJournalProps {
  transactions: FinancialTransaction[];
}

export function FinancialJournal({ transactions }: FinancialJournalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.userEmail.toLowerCase().includes(q) ||
        tx.transactionReference.toLowerCase().includes(q) ||
        (tx.serverName && tx.serverName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalFilteredCFA = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amountCFA || 0), 0);

  const exportCSV = () => {
    const headers = ["ID", "Date", "Client", "Description", "Méthode", "Référence", "Montant (FCFA)", "Statut"];
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.timestamp).toISOString(),
      `"${t.userEmail}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.transactionReference,
      t.amountCFA,
      t.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `journal-financier-orax-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Journal des Transactions Financières
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Audit CFA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Traçabilité détaillée et immuable de tous les règlements serveurs et rechargements Mobile Money en Francs CFA (FCFA).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Total validé</span>
            <span className="text-xl font-extrabold font-mono text-emerald-400">
              {totalFilteredCFA.toLocaleString('fr-FR')} <span className="text-xs text-emerald-300 font-bold">FCFA</span>
            </span>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition border border-slate-700 shadow-sm"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher référence, email, libellé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Validé (Complété)</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué / Rejeté</option>
          </select>
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
          >
            <option value="all">Toutes les méthodes de paiement</option>
            <option value="Wave">Wave</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Airtel Money">Airtel Money</option>
            <option value="Portefeuille ORAX">Portefeuille ORAX</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-xs font-semibold text-slate-300 px-2">
          <span>{filteredTransactions.length} transaction(s) répertoriée(s)</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-5">Date & Réf.</th>
                <th className="py-4 px-5">Client</th>
                <th className="py-4 px-5">Description / Motif</th>
                <th className="py-4 px-5">Méthode de Paiement</th>
                <th className="py-4 px-5">Montant CFA</th>
                <th className="py-4 px-5 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Aucune transaction ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-5">
                      <div>
                        <div className="font-mono font-bold text-white text-xs">
                          {tx.transactionReference || tx.id}
                        </div>
                        <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(tx.timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-mono text-slate-200 font-medium">{tx.userEmail}</span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-white font-medium">{tx.description}</div>
                      {tx.serverName && (
                        <div className="text-xs text-indigo-300 font-semibold mt-0.5">
                          Serveur : {tx.serverName}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        tx.paymentMethod === 'Wave'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : tx.paymentMethod === 'Orange Money'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : tx.paymentMethod === 'Airtel Money'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {tx.paymentMethod === 'Portefeuille ORAX' ? (
                          <Wallet className="w-3.5 h-3.5" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5" />
                        )}
                        <span>{tx.paymentMethod}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-sm font-extrabold text-white">
                          +{tx.amountCFA.toLocaleString('fr-FR')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 font-bold">
                          FCFA
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        tx.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : tx.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {tx.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Validé</span>
                          </>
                        ) : tx.status === 'pending' ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>En Attente</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Échoué</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

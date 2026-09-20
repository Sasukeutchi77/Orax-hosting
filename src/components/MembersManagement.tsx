import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  Server, 
  Search, 
  Edit3, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface MembersManagementProps {
  users: UserProfile[];
  onUpdateWallet: (userId: string, newBalanceCFA: number, reason: string) => Promise<any>;
}

export function MembersManagement({
  users,
  onUpdateWallet
}: MembersManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Recharge manuelle / Ajustement ORAX Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.includes(q)) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const openBalanceModal = (user: UserProfile) => {
    setSelectedUserForEdit(user);
    setNewBalanceInput(user.walletBalanceCFA);
    setAdjustmentReason('Ajustement administratif / Dépôt guichet');
  };

  const handleQuickAdd = (amount: number) => {
    setNewBalanceInput((prev) => Math.max(0, prev + amount));
  };

  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setIsSubmitting(true);
    try {
      await onUpdateWallet(selectedUserForEdit.id, newBalanceInput, adjustmentReason);
      setBanner(`Solde de ${selectedUserForEdit.email} mis à jour avec succès à ${newBalanceInput.toLocaleString('fr-FR')} FCFA.`);
      setSelectedUserForEdit(null);
      setTimeout(() => setBanner(null), 4000);
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMemberBalanceCFA = users.reduce((acc, u) => acc + (u.walletBalanceCFA || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Utilisateurs Enregistrés</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{users.length}</span>
            <span className="text-xs text-slate-400 font-medium">comptes vérifiés</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fonds Totaux en Portefeuille</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalMemberBalanceCFA.toLocaleString('fr-FR')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              FCFA
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Serveurs Actifs Détenus</span>
            <Server className="w-5 h-5 text-violet-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {users.reduce((acc, u) => acc + (u.serverCount || 0), 0)}
            </span>
            <span className="text-xs text-slate-400 font-medium">instances déployées</span>
          </div>
        </div>
      </div>

      {banner && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      {/* Action and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par email, nom, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div className="text-xs sm:text-sm font-semibold text-slate-300">
          Affichage de <span className="font-bold text-white font-mono">{filteredUsers.length}</span> membre(s)
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-5">Utilisateur / Email</th>
                <th className="py-4 px-5">Contact</th>
                <th className="py-4 px-5">Serveurs Actifs</th>
                <th className="py-4 px-5">Solde Portefeuille CFA</th>
                <th className="py-4 px-5">Statut</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Aucun membre ne correspond à cette recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 shadow-sm">
                          {user.displayName ? user.displayName.slice(0, 2) : user.email.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2 text-sm">
                            <span>{user.displayName || 'Client ORAX'}</span>
                            {user.role === 'admin' && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-slate-300">
                      {user.phoneNumber ? (
                        <span className="font-mono text-xs text-slate-200 flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {user.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Non renseigné</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs border border-slate-700">
                        <Server className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{user.serverCount || 0}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="inline-flex items-baseline gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1.5 rounded-xl">
                        <span className="font-mono text-sm font-extrabold text-emerald-400">
                          {(user.walletBalanceCFA || 0).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs font-bold text-emerald-300">FCFA</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {user.status === 'active' ? 'Actif' : user.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => openBalanceModal(user)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition active:scale-95 shadow-sm"
                        title="Modifier le solde CFA"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Modifier Solde</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Balance Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Ajuster le Solde Portefeuille</h3>
              </div>
              <button 
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm space-y-2">
              <div className="text-slate-300">Client : <strong className="text-white font-bold">{selectedUserForEdit.displayName || selectedUserForEdit.email}</strong></div>
              <div className="text-slate-400 font-mono text-xs">{selectedUserForEdit.email}</div>
              <div className="text-slate-300 pt-1 flex items-center justify-between border-t border-slate-800/80">
                <span>Solde actuel :</span>
                <span className="text-emerald-400 font-extrabold font-mono text-sm">{selectedUserForEdit.walletBalanceCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <form onSubmit={handleSaveBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Nouveau Solde en Francs CFA (FCFA) :
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-black font-mono text-white outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Quick Adjust Buttons */}
              <div className="space-y-2">
                <span className="text-xs text-slate-300 font-semibold block">Raccourcis rapides :</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(5000)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 transition"
                  >
                    +5 000 F
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(10000)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 transition"
                  >
                    +10 000 F
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(25000)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 transition"
                  >
                    +25 000 F
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(-5000)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 border border-slate-700 transition"
                  >
                    -5 000 F
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBalanceInput(0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition"
                  >
                    Mettre à 0
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Motif de l'ajustement (enregistré dans le journal financier) :
                </label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Ex: Rechargement Mobile Money manuel, geste commercial..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer le solde"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

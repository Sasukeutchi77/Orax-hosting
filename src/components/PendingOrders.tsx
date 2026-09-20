import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Smartphone, 
  Server, 
  Cpu, 
  HardDrive, 
  ShieldAlert,
  PlusCircle,
  Hash,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { HostingServer, PaymentMethod } from '../types';

interface PendingOrdersProps {
  servers: HostingServer[];
  onValidate: (server: HostingServer, ip?: string) => Promise<any>;
  onReject: (server: HostingServer, reason: string) => Promise<any>;
  onCreateDemoOrder: (op: 'Orange Money' | 'Wave' | 'Airtel Money') => Promise<void>;
}

export function PendingOrders({
  servers,
  onValidate,
  onReject,
  onCreateDemoOrder
}: PendingOrdersProps) {
  const [filterOperator, setFilterOperator] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Validation modal state
  const [selectedServerForValidation, setSelectedServerForValidation] = useState<HostingServer | null>(null);
  const [customIp, setCustomIp] = useState('');
  
  // Rejection modal state
  const [selectedServerForRejection, setSelectedServerForRejection] = useState<HostingServer | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Paiement non reçu sur le compte Mobile Money après vérification des relevés.');

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter only pending servers by default, or view history
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');

  const filteredServers = servers.filter((s) => {
    if (viewMode === 'pending' && s.status !== 'pending_validation') return false;
    
    if (filterOperator !== 'all' && s.paymentMethod !== filterOperator) return false;
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.userEmail.toLowerCase().includes(q) ||
        (s.transactionReference && s.transactionReference.toLowerCase().includes(q)) ||
        (s.paymentPhone && s.paymentPhone.includes(q))
      );
    }
    return true;
  });

  const handleConfirmValidation = async () => {
    if (!selectedServerForValidation) return;
    setProcessingId(selectedServerForValidation.id);
    try {
      await onValidate(selectedServerForValidation, customIp.trim() || undefined);
      setSuccessBanner(`Serveur "${selectedServerForValidation.name}" validé et provisionné avec succès !`);
      setSelectedServerForValidation(null);
      setCustomIp('');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      alert("Erreur lors de la validation: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedServerForRejection) return;
    setProcessingId(selectedServerForRejection.id);
    try {
      await onReject(selectedServerForRejection, rejectionReason);
      setSuccessBanner(`Commande du serveur "${selectedServerForRejection.name}" rejetée.`);
      setSelectedServerForRejection(null);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      alert("Erreur lors du rejet: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Simulator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Gestion des Commandes en Attente</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Mobile Money
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Vérifiez les numéros de transaction Orange Money, Wave et Airtel Money avant d'activer les serveurs des clients.
          </p>
        </div>

        {/* Quick Test/Simulation buttons to test Mobile Money arrivals */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <span className="text-xs text-slate-300 font-semibold">Simuler arrivée :</span>
          <button
            onClick={() => onCreateDemoOrder('Orange Money')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition flex items-center gap-1.5 shadow-sm"
            title="Créer une commande test payée par Orange Money"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Orange</span>
          </button>
          <button
            onClick={() => onCreateDemoOrder('Wave')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/40 hover:bg-sky-500/25 transition flex items-center gap-1.5 shadow-sm"
            title="Créer une commande test payée par Wave"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Wave</span>
          </button>
          <button
            onClick={() => onCreateDemoOrder('Airtel Money')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25 transition flex items-center gap-1.5 shadow-sm"
            title="Créer une commande test payée par Airtel"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span>+ Airtel</span>
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              viewMode === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            En Attente ({servers.filter(s => s.status === 'pending_validation').length})
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              viewMode === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Historique complet ({servers.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Operator dropdown */}
          <div className="relative">
            <select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 w-full"
            >
              <option value="all">Tous les opérateurs</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Wave">Wave</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par serveur, email, réf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Servers Order List */}
      {filteredServers.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {viewMode === 'pending'
              ? "Toutes les demandes d'hébergement ont été validées ou traitées."
              : "Aucun serveur ne correspond aux critères de recherche."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServers.map((server) => {
            const isPending = server.status === 'pending_validation';
            const isProcessing = processingId === server.id;

            return (
              <div 
                key={server.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 transition relative overflow-hidden ${
                  isPending 
                    ? 'border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-950/10' 
                    : server.status === 'active'
                    ? 'border-emerald-900/50 hover:border-emerald-800/80'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Server & Client details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Server className="w-4 h-4" />
                      </div>
                      <span className="text-base font-bold text-white">{server.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                        {server.planName}
                      </span>
                      
                      {/* Operator badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        server.paymentMethod === 'Wave' 
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : server.paymentMethod === 'Orange Money'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        <Smartphone className="w-3 h-3" />
                        {server.paymentMethod}
                      </span>

                      {/* Status badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        server.status === 'pending_validation'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : server.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {server.status === 'pending_validation' ? 'Paiement en attente' : server.status === 'active' ? 'Actif' : 'Rejeté'}
                      </span>
                    </div>

                    {/* Meta specs info */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <Cpu className="w-3.5 h-3.5 text-slate-500" />
                        {server.specs?.cpu || '2 vCPU'} • {server.specs?.ram || '4GB RAM'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        {server.specs?.disk || '50GB NVMe'}
                      </span>
                      <span>Emplacement : <strong className="text-slate-300">{server.nodeLocation || 'Afrique de l\'Ouest'}</strong></span>
                    </div>

                    {/* Mobile Money Payment Verification Strip */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-5 flex-wrap">
                        <div>
                          <span className="text-slate-400 block text-xs font-medium">Compte client :</span>
                          <span className="font-semibold text-white">{server.userEmail}</span>
                        </div>
                        {server.paymentPhone && (
                          <div>
                            <span className="text-slate-400 block text-xs font-medium">Numéro émetteur :</span>
                            <span className="font-mono text-amber-300 font-semibold">{server.paymentPhone}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block text-xs font-medium">Réf. Transaction Opérateur :</span>
                          <span className="font-mono text-emerald-300 font-bold bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700 inline-block mt-0.5">
                            {server.transactionReference || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-xs font-medium">Date soumission :</span>
                          <span className="text-slate-300 font-medium">
                            {new Date(server.createdAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {server.ipAddress && (
                        <div>
                          <span className="text-slate-400 block text-xs font-medium">IP assignée :</span>
                          <span className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{server.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Amount & Direct Action Buttons */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-slate-300 block font-semibold uppercase tracking-wider">Prix d'hébergement</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                          {server.priceCFA.toLocaleString('fr-FR')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                          FCFA
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Par {server.billingCycle}</span>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Reject button */}
                        <button
                          disabled={isProcessing}
                          onClick={() => {
                            setSelectedServerForRejection(server);
                            setRejectionReason('Paiement non confirmé par l\'opérateur Mobile Money');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold transition flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Rejeter</span>
                        </button>

                        {/* Validate server button */}
                        <button
                          disabled={isProcessing}
                          onClick={() => {
                            setSelectedServerForValidation(server);
                            setCustomIp(`154.72.${Math.floor(Math.random() * 150) + 10}.${Math.floor(Math.random() * 250) + 2}`);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valider le serveur</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-300">
                        {server.status === 'active' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Serveur en production
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> Rejeté : {server.rejectionReason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Modal */}
      {selectedServerForValidation && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Valider et Déployer le Serveur</h3>
              </div>
              <button 
                onClick={() => setSelectedServerForValidation(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl space-y-2.5 text-xs text-slate-300 border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Instance :</span>
                <span className="font-bold text-white text-sm">{selectedServerForValidation.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Formule :</span>
                <span className="text-indigo-300 font-semibold">{selectedServerForValidation.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Montant reçu :</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{selectedServerForValidation.priceCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Opérateur :</span>
                <span className="font-semibold text-white">{selectedServerForValidation.paymentMethod} ({selectedServerForValidation.transactionReference})</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adresse IPv4 Dédiée à allouer :
              </label>
              <input
                type="text"
                value={customIp}
                onChange={(e) => setCustomIp(e.target.value)}
                placeholder="Ex: 154.72.19.45"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 mt-1.5 block">
                Cette IP sera assignée à l'instance cloud et transmise aux accès client.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedServerForValidation(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={processingId !== null}
                onClick={handleConfirmValidation}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {processingId ? "Activation en cours..." : "Confirmer la validation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedServerForRejection && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Rejeter la Commande</h3>
              </div>
              <button 
                onClick={() => setSelectedServerForRejection(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Le rejet de la commande marquera la transaction comme échouée et refusera l'ouverture du serveur <strong>{selectedServerForRejection.name}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Motif du rejet (notifié au client) :
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedServerForRejection(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={processingId !== null}
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {processingId ? "Traitement..." : "Confirmer le Rejet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, HostingServer, FinancialTransaction, SystemStats } from './types';
import { seedInitialDataIfEmpty } from './seedData';

export function useOraxData() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [servers, setServers] = useState<HostingServer[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load and seed check
  useEffect(() => {
    let unsubscribeUsers: () => void = () => {};
    let unsubscribeServers: () => void = () => {};
    let unsubscribeTransactions: () => void = () => {};

    const initializeData = async () => {
      try {
        // Check if data exists, if not, seed with sample data
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          console.log("No data found, seeding initial ORAX hosting records...");
          await seedInitialDataIfEmpty();
        }
      } catch (err: any) {
        console.warn("Auto-seed error or permission check:", err);
        if (err?.message?.includes('permission') || err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.GET, 'users');
        }
      } finally {
        // Attach real-time listeners
        try {
          unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const list: UserProfile[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...(doc.data() as any) });
            });
            setUsers(list);
          }, (err) => {
            console.error("Error listening to users:", err);
            setError(err.message);
            handleFirestoreError(err, OperationType.GET, 'users');
          });

          unsubscribeServers = onSnapshot(collection(db, 'servers'), (snapshot) => {
            const list: HostingServer[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...(doc.data() as any) });
            });
            // Sort by createdAt desc
            list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setServers(list);
          }, (err) => {
            console.error("Error listening to servers:", err);
            handleFirestoreError(err, OperationType.GET, 'servers');
          });

          unsubscribeTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
            const list: FinancialTransaction[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...(doc.data() as any) });
            });
            list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
            setTransactions(list);
            setLoading(false);
          }, (err) => {
            console.error("Error listening to transactions:", err);
            setLoading(false);
            handleFirestoreError(err, OperationType.GET, 'transactions');
          });
        } catch (e: any) {
          console.error("Snapshot attach error:", e);
          setLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      unsubscribeUsers();
      unsubscribeServers();
      unsubscribeTransactions();
    };
  }, []);

  // Action: Validate Server
  const validateServer = async (server: HostingServer, assignedIp?: string) => {
    try {
      const generatedIp = assignedIp || `154.72.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 2}`;
      const serverRef = doc(db, 'servers', server.id);
      
      await updateDoc(serverRef, {
        status: 'active',
        ipAddress: generatedIp,
        validatedAt: new Date().toISOString()
      });

      // Update associated transaction if pending
      const relatedTx = transactions.find(t => t.serverId === server.id && t.status === 'pending');
      if (relatedTx) {
        const txRef = doc(db, 'transactions', relatedTx.id);
        await updateDoc(txRef, {
          status: 'completed'
        });
      } else {
        // Record completed payment transaction if not existed
        await addDoc(collection(db, 'transactions'), {
          userId: server.userId,
          userEmail: server.userEmail,
          serverId: server.id,
          serverName: server.name,
          amountCFA: server.priceCFA,
          type: 'server_purchase',
          paymentMethod: server.paymentMethod,
          transactionReference: server.transactionReference || `TX-${Date.now()}`,
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: `Activation serveur ${server.name} (${server.planName})`
        });
      }

      // Increment user serverCount
      const user = users.find(u => u.id === server.userId || u.email === server.userEmail);
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          serverCount: (user.serverCount || 0) + 1
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error("Failed to validate server:", err);
      throw err;
    }
  };

  // Action: Reject Server
  const rejectServer = async (server: HostingServer, reason: string) => {
    try {
      const serverRef = doc(db, 'servers', server.id);
      await updateDoc(serverRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Paiement non confirmé par l\'opérateur Mobile Money'
      });

      // Update associated transaction
      const relatedTx = transactions.find(t => t.serverId === server.id && t.status === 'pending');
      if (relatedTx) {
        const txRef = doc(db, 'transactions', relatedTx.id);
        await updateDoc(txRef, {
          status: 'failed',
          description: `Paiement rejeté: ${reason || 'Référence invalide ou non reçue'}`
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error("Failed to reject server:", err);
      throw err;
    }
  };

  // Action: Update User Wallet Balance
  const updateUserWallet = async (userId: string, newBalanceCFA: number, reason: string = 'Ajustement manuel administrateur') => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error("Utilisateur introuvable");

      const diff = newBalanceCFA - user.walletBalanceCFA;
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        walletBalanceCFA: Math.max(0, newBalanceCFA)
      });

      // Log financial adjustment transaction
      await addDoc(collection(db, 'transactions'), {
        userId: user.id,
        userEmail: user.email,
        amountCFA: Math.abs(diff),
        type: diff >= 0 ? 'wallet_topup' : 'admin_adjustment',
        paymentMethod: 'Portefeuille ORAX',
        transactionReference: `ADJ-${Date.now()}`,
        status: 'completed',
        timestamp: new Date().toISOString(),
        description: `Ajustement solde (${diff >= 0 ? '+' : '-'}${Math.abs(diff).toLocaleString('fr-FR')} FCFA): ${reason}`
      });

      return { success: true };
    } catch (err: any) {
      console.error("Failed to update wallet:", err);
      throw err;
    }
  };

  // Create quick demo pending order to test Mobile Money validations
  const createDemoPendingOrder = async (operator: 'Orange Money' | 'Wave' | 'Airtel Money') => {
    const plans = [
      { name: 'ORAX Cloud VPS Gold', price: 35000, category: 'VPS', specs: { cpu: '6 vCPU', ram: '24 GB', disk: '250 GB NVMe' } },
      { name: 'ORAX FiveM Ryzen 9', price: 22000, category: 'Game Server', specs: { cpu: 'Ryzen 9 7950X', ram: '16 GB DDR5', disk: '120 GB SSD' } },
      { name: 'ORAX Bot Cluster', price: 8500, category: 'Discord Bot', specs: { cpu: '2 vCPU', ram: '6 GB', disk: '40 GB SSD' } }
    ];
    const pickedPlan = plans[Math.floor(Math.random() * plans.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)] || {
      id: 'usr_new_client',
      email: 'client.test@oraxhosting.com',
      phoneNumber: '+225 07 00 11 22'
    };

    const serverId = `srv_order_${Date.now()}`;
    const serverName = `node-${Math.random().toString(36).substring(2, 7)}-cfa`;

    const serverData: HostingServer = {
      id: serverId,
      name: serverName,
      planName: pickedPlan.name,
      category: pickedPlan.category as any,
      specs: pickedPlan.specs,
      userId: randomUser.id,
      userEmail: randomUser.email,
      priceCFA: pickedPlan.price,
      billingCycle: 'mensuel',
      paymentMethod: operator,
      paymentPhone: randomUser.phoneNumber || '+221 77 000 00 00',
      transactionReference: `${operator === 'Wave' ? 'WV' : operator === 'Orange Money' ? 'OM' : 'AM'}-${Date.now().toString().slice(-8)}`,
      status: 'pending_validation',
      createdAt: new Date().toISOString(),
      nodeLocation: 'Abidjan DataCenter 1'
    };

    const serverRef = doc(db, 'servers', serverId);
    await updateDoc(serverRef, serverData as any).catch(async () => {
      // If doesn't exist, create it with setDoc equivalent or addDoc
      const batchRef = doc(db, 'servers', serverId);
      const batch = doc(db, 'servers', serverId);
      const { setDoc } = await import('firebase/firestore');
      await setDoc(batchRef, serverData);
    });

    // Add pending transaction
    await addDoc(collection(db, 'transactions'), {
      userId: randomUser.id,
      userEmail: randomUser.email,
      serverId: serverId,
      serverName: serverName,
      amountCFA: pickedPlan.price,
      type: 'server_purchase',
      paymentMethod: operator,
      transactionReference: serverData.transactionReference || `TX-${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
      description: `Acompte commande ${pickedPlan.name}`
    });
  };

  // Re-seed trigger
  const forceResetSampleData = async () => {
    await seedInitialDataIfEmpty();
  };

  // Calculate Metrics
  const activeServers = servers.filter(s => s.status === 'active');
  const pendingServers = servers.filter(s => s.status === 'pending_validation');
  
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenueCFA = completedTransactions.reduce((acc, curr) => acc + (curr.amountCFA || 0), 0);

  // Today revenue
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayRevenueCFA = completedTransactions
    .filter(t => new Date(t.timestamp).getTime() >= startOfToday.getTime())
    .reduce((acc, curr) => acc + (curr.amountCFA || 0), 0);

  // Month revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthRevenueCFA = completedTransactions
    .filter(t => new Date(t.timestamp).getTime() >= startOfMonth.getTime())
    .reduce((acc, curr) => acc + (curr.amountCFA || 0), 0);

  const stats: SystemStats = {
    totalMembers: users.length,
    totalActiveServers: activeServers.length,
    pendingServers: pendingServers.length,
    totalRevenueCFA,
    todayRevenueCFA,
    monthRevenueCFA
  };

  return {
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
  };
}

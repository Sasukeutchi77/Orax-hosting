import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function seedInitialDataIfEmpty() {
  const usersToSeed = [
    {
      id: 'usr_moussa_01',
      email: 'moussa.traore@gmail.com',
      displayName: 'Moussa Traoré',
      walletBalanceCFA: 45000,
      serverCount: 3,
      phoneNumber: '+225 07 89 45 12',
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'usr_amadou_02',
      email: 'amadou.diallo@prodev.sn',
      displayName: 'Amadou Diallo',
      walletBalanceCFA: 12500,
      serverCount: 2,
      phoneNumber: '+221 77 123 45 67',
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
    },
    {
      id: 'usr_fatou_03',
      email: 'fatou.kone@techivoire.ci',
      displayName: 'Fatoumata Koné',
      walletBalanceCFA: 78000,
      serverCount: 4,
      phoneNumber: '+225 05 44 33 22',
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'usr_kofi_04',
      email: 'kofi.mensah@devhub.tg',
      displayName: 'Kofi Mensah',
      walletBalanceCFA: 3500,
      serverCount: 1,
      phoneNumber: '+228 90 11 22 33',
      status: 'active',
      role: 'user',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'usr_makima_admin',
      email: 'lordmakima99@gmail.com',
      displayName: 'Directeur ORAX Hosting',
      walletBalanceCFA: 500000,
      serverCount: 0,
      phoneNumber: '+221 78 999 00 00',
      status: 'active',
      role: 'admin',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ];

  const serversToSeed = [
    {
      id: 'srv_pent_01',
      name: 'prod-api-cluster-01',
      planName: 'ORAX Cloud VPS Performance',
      category: 'VPS',
      specs: { cpu: '4 vCPU AMD EPYC', ram: '16 GB DDR5', disk: '200 GB NVMe Gen4', os: 'Ubuntu 24.04 LTS' },
      userId: 'usr_moussa_01',
      userEmail: 'moussa.traore@gmail.com',
      priceCFA: 24500,
      billingCycle: 'mensuel',
      paymentMethod: 'Orange Money',
      paymentPhone: '+225 07 89 45 12',
      transactionReference: 'OM-CI-984218742',
      status: 'pending_validation',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      nodeLocation: 'Abidjan DataCenter 1'
    },
    {
      id: 'srv_pent_02',
      name: 'minecraft-bedrock-senegal',
      planName: 'ORAX Game Ryzen Extreme',
      category: 'Game Server',
      specs: { cpu: 'Ryzen 9 7950X (5.7GHz)', ram: '32 GB DDR5', disk: '100 GB NVMe Raid-1', os: 'Debian 12' },
      userId: 'usr_amadou_02',
      userEmail: 'amadou.diallo@prodev.sn',
      priceCFA: 18000,
      billingCycle: 'mensuel',
      paymentMethod: 'Wave',
      paymentPhone: '+221 77 123 45 67',
      transactionReference: 'WV-SN-2024-884102',
      status: 'pending_validation',
      createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
      nodeLocation: 'Dakar Datacenter Teranga'
    },
    {
      id: 'srv_pent_03',
      name: 'discord-music-bot-paas',
      planName: 'ORAX Node Bot PaaS 24/7',
      category: 'Discord Bot',
      specs: { cpu: '2 vCPU', ram: '4 GB RAM', disk: '25 GB NVMe', os: 'Docker PaaS Engine' },
      userId: 'usr_kofi_04',
      userEmail: 'kofi.mensah@devhub.tg',
      priceCFA: 6500,
      billingCycle: 'mensuel',
      paymentMethod: 'Airtel Money',
      paymentPhone: '+228 90 11 22 33',
      transactionReference: 'AM-TG-77319082',
      status: 'pending_validation',
      createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
      nodeLocation: 'Lomé Cloud Exchange'
    },
    {
      id: 'srv_act_01',
      name: 'ecommerce-ivoire-shop',
      planName: 'ORAX Cloud VPS Performance',
      category: 'VPS',
      specs: { cpu: '8 vCPU AMD EPYC', ram: '32 GB DDR5', disk: '450 GB NVMe', os: 'Ubuntu 22.04 LTS' },
      userId: 'usr_fatou_03',
      userEmail: 'fatou.kone@techivoire.ci',
      priceCFA: 49000,
      billingCycle: 'mensuel',
      paymentMethod: 'Wave',
      paymentPhone: '+225 05 44 33 22',
      transactionReference: 'WV-CI-77329910',
      status: 'active',
      ipAddress: '154.72.19.45',
      nodeLocation: 'Abidjan DataCenter 1',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      validatedAt: new Date(Date.now() - 12 * 86400000 + 300000).toISOString()
    },
    {
      id: 'srv_act_02',
      name: 'database-postgres-cluster',
      planName: 'ORAX Managed DB Pro',
      category: 'PaaS',
      specs: { cpu: '4 vCPU Dedicated', ram: '16 GB RAM', disk: '150 GB NVMe SSD', os: 'PostgreSQL 16' },
      userId: 'usr_moussa_01',
      userEmail: 'moussa.traore@gmail.com',
      priceCFA: 32000,
      billingCycle: 'mensuel',
      paymentMethod: 'Orange Money',
      paymentPhone: '+225 07 89 45 12',
      transactionReference: 'OM-CI-5529104',
      status: 'active',
      ipAddress: '154.72.19.82',
      nodeLocation: 'Abidjan DataCenter 1',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      validatedAt: new Date(Date.now() - 10 * 86400000 + 120000).toISOString()
    },
    {
      id: 'srv_act_03',
      name: 'saas-crm-senegal',
      planName: 'ORAX Cloud VPS Bronze',
      category: 'VPS',
      specs: { cpu: '2 vCPU', ram: '8 GB RAM', disk: '80 GB NVMe', os: 'Debian 12' },
      userId: 'usr_amadou_02',
      userEmail: 'amadou.diallo@prodev.sn',
      priceCFA: 14500,
      billingCycle: 'mensuel',
      paymentMethod: 'Wave',
      paymentPhone: '+221 77 123 45 67',
      transactionReference: 'WV-SN-110943',
      status: 'active',
      ipAddress: '196.207.214.12',
      nodeLocation: 'Dakar Datacenter Teranga',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      validatedAt: new Date(Date.now() - 6 * 86400000 + 400000).toISOString()
    }
  ];

  const transactionsToSeed = [
    {
      id: 'tx_991823',
      userId: 'usr_fatou_03',
      userEmail: 'fatou.kone@techivoire.ci',
      serverId: 'srv_act_01',
      serverName: 'ecommerce-ivoire-shop',
      amountCFA: 49000,
      type: 'server_purchase',
      paymentMethod: 'Wave',
      transactionReference: 'WV-CI-77329910',
      status: 'completed',
      timestamp: new Date(Date.now() - 12 * 86400000).toISOString(),
      description: 'Achat serveur VPS Performance - 1 mois'
    },
    {
      id: 'tx_991824',
      userId: 'usr_moussa_01',
      userEmail: 'moussa.traore@gmail.com',
      serverId: 'srv_act_02',
      serverName: 'database-postgres-cluster',
      amountCFA: 32000,
      type: 'server_purchase',
      paymentMethod: 'Orange Money',
      transactionReference: 'OM-CI-5529104',
      status: 'completed',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
      description: 'Achat Managed DB Pro - 1 mois'
    },
    {
      id: 'tx_991825',
      userId: 'usr_amadou_02',
      userEmail: 'amadou.diallo@prodev.sn',
      serverId: 'srv_act_03',
      serverName: 'saas-crm-senegal',
      amountCFA: 14500,
      type: 'server_purchase',
      paymentMethod: 'Wave',
      transactionReference: 'WV-SN-110943',
      status: 'completed',
      timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
      description: 'Achat VPS Bronze - 1 mois'
    },
    {
      id: 'tx_991826',
      userId: 'usr_fatou_03',
      userEmail: 'fatou.kone@techivoire.ci',
      amountCFA: 50000,
      type: 'wallet_topup',
      paymentMethod: 'Wave',
      transactionReference: 'WV-CI-44109283',
      status: 'completed',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
      description: 'Recharge compte client Portefeuille ORAX'
    },
    {
      id: 'tx_991827',
      userId: 'usr_moussa_01',
      userEmail: 'moussa.traore@gmail.com',
      serverId: 'srv_pent_01',
      serverName: 'prod-api-cluster-01',
      amountCFA: 24500,
      type: 'server_purchase',
      paymentMethod: 'Orange Money',
      transactionReference: 'OM-CI-984218742',
      status: 'pending',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      description: 'Acompte commande serveur VPS Performance'
    },
    {
      id: 'tx_991828',
      userId: 'usr_amadou_02',
      userEmail: 'amadou.diallo@prodev.sn',
      serverId: 'srv_pent_02',
      serverName: 'minecraft-bedrock-senegal',
      amountCFA: 18000,
      type: 'server_purchase',
      paymentMethod: 'Wave',
      transactionReference: 'WV-SN-2024-884102',
      status: 'pending',
      timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
      description: 'Acompte commande serveur Game Ryzen Extreme'
    },
    {
      id: 'tx_991829',
      userId: 'usr_kofi_04',
      userEmail: 'kofi.mensah@devhub.tg',
      serverId: 'srv_pent_03',
      serverName: 'discord-music-bot-paas',
      amountCFA: 6500,
      type: 'server_purchase',
      paymentMethod: 'Airtel Money',
      transactionReference: 'AM-TG-77319082',
      status: 'pending',
      timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
      description: 'Acompte commande Node Bot PaaS 24/7'
    }
  ];

  const batch = writeBatch(db);

  usersToSeed.forEach(u => {
    const ref = doc(db, 'users', u.id);
    batch.set(ref, u, { merge: true });
  });

  serversToSeed.forEach(s => {
    const ref = doc(db, 'servers', s.id);
    batch.set(ref, s, { merge: true });
  });

  transactionsToSeed.forEach(t => {
    const ref = doc(db, 'transactions', t.id);
    batch.set(ref, t, { merge: true });
  });

  await batch.commit();
}

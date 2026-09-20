export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  walletBalanceCFA: number;
  serverCount: number;
  createdAt: any;
  status: 'active' | 'suspended' | 'pending';
  phoneNumber?: string;
  role?: 'admin' | 'user';
}

export type PaymentMethod = 'Orange Money' | 'Wave' | 'Airtel Money' | 'MTN Money' | 'Autre';

export type ServerStatus = 'pending_validation' | 'active' | 'rejected' | 'suspended' | 'cancelled';

export interface HostingServer {
  id: string;
  name: string;
  planName: string; // e.g. "ORAX VPS Bronze", "ORAX Game Ryzen 9", "Bot Starter"
  category?: 'VPS' | 'Game Server' | 'Discord Bot' | 'Web Hosting' | 'PaaS';
  specs: {
    cpu: string;
    ram: string;
    disk: string;
    os?: string;
  };
  userId: string;
  userEmail: string;
  priceCFA: number;
  billingCycle: 'mensuel' | 'trimestriel' | 'annuel';
  paymentMethod: PaymentMethod;
  paymentPhone?: string;
  transactionReference?: string;
  status: ServerStatus;
  createdAt: any;
  validatedAt?: any;
  rejectedAt?: any;
  rejectionReason?: string;
  ipAddress?: string;
  nodeLocation?: string;
}

export interface FinancialTransaction {
  id: string;
  userId: string;
  userEmail: string;
  serverId?: string;
  serverName?: string;
  amountCFA: number;
  type: 'server_purchase' | 'wallet_topup' | 'refund' | 'admin_adjustment';
  paymentMethod: PaymentMethod | 'Portefeuille ORAX';
  transactionReference: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: any;
  description: string;
  operatorFeeCFA?: number;
}

export interface SystemStats {
  totalMembers: number;
  totalActiveServers: number;
  pendingServers: number;
  totalRevenueCFA: number;
  todayRevenueCFA: number;
  monthRevenueCFA: number;
}

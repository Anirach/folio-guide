export interface PriceAlert {
  id: string;
  stockId: string;
  stockSymbol: string;
  type: 'upper' | 'lower';
  threshold: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  stockSymbol: string;
  message: string;
  type: 'upper' | 'lower';
  currentPrice: number;
  threshold: number;
  timestamp: string;
  isRead: boolean;
}
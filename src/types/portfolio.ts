export interface Stock {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
}

export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
}
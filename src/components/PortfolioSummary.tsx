import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { Stock } from "../types/portfolio";

interface PortfolioSummaryProps {
  stocks: Stock[];
}

export const PortfolioSummary = ({ stocks }: PortfolioSummaryProps) => {
  // Calculate portfolio metrics
  const totalInvested = stocks.reduce((sum, stock) => sum + (stock.shares * stock.purchasePrice), 0);
  const currentValue = stocks.reduce((sum, stock) => sum + (stock.shares * stock.currentPrice), 0);
  const totalGainLoss = currentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  
  const isPositive = totalGainLoss >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-br from-card to-card/95 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Current market value
          </p>
        </CardContent>
      </Card>

      {/* Total Invested */}
      <Card className="bg-gradient-to-br from-card to-card/95 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Invested
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Initial investment
          </p>
        </CardContent>
      </Card>

      {/* Total Gain/Loss */}
      <Card className="bg-gradient-to-br from-card to-card/95 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Return
          </CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(totalGainLoss)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Unrealized {isPositive ? 'gain' : 'loss'}
          </p>
        </CardContent>
      </Card>

      {/* Percentage Gain/Loss */}
      <Card className="bg-gradient-to-br from-card to-card/95 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Return %
          </CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {formatPercentage(gainLossPercentage)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Overall performance
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  ArrowUpDown,
  Bell,
  BellOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stock } from "../types/portfolio";
import { PriceAlert } from "../types/alerts";
import { EditStockModal } from "./EditStockModal";
import { PriceAlertsModal } from "./PriceAlertsModal";

interface StockTableProps {
  stocks: Stock[];
  onUpdateStock: (stock: Stock) => void;
  onDeleteStock: (stockId: string) => void;
  alerts: PriceAlert[];
  onUpdateAlerts: (alerts: PriceAlert[]) => void;
}

type SortField = 'symbol' | 'shares' | 'purchasePrice' | 'currentPrice' | 'gainLoss' | 'gainLossPercent';
type SortDirection = 'asc' | 'desc';

export const StockTable = ({ stocks, onUpdateStock, onDeleteStock, alerts, onUpdateAlerts }: StockTableProps) => {
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [alertStock, setAlertStock] = useState<Stock | null>(null);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const calculateGainLoss = (stock: Stock) => {
    const invested = stock.shares * stock.purchasePrice;
    const current = stock.shares * stock.currentPrice;
    return current - invested;
  };

  const calculateGainLossPercent = (stock: Stock) => {
    const invested = stock.shares * stock.purchasePrice;
    const gainLoss = calculateGainLoss(stock);
    return invested > 0 ? (gainLoss / invested) * 100 : 0;
  };

  const getStockAlertCount = (stockId: string) => {
    return alerts.filter(alert => alert.stockId === stockId && alert.isActive).length;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'symbol':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'shares':
        aValue = a.shares;
        bValue = b.shares;
        break;
      case 'purchasePrice':
        aValue = a.purchasePrice;
        bValue = b.purchasePrice;
        break;
      case 'currentPrice':
        aValue = a.currentPrice;
        bValue = b.currentPrice;
        break;
      case 'gainLoss':
        aValue = calculateGainLoss(a);
        bValue = calculateGainLoss(b);
        break;
      case 'gainLossPercent':
        aValue = calculateGainLossPercent(a);
        bValue = calculateGainLossPercent(b);
        break;
      default:
        aValue = a.symbol;
        bValue = b.symbol;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground"
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <>
      <div className="rounded-lg border bg-background/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>
                <SortButton field="symbol">Symbol</SortButton>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">
                <SortButton field="shares">Shares</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="purchasePrice">Purchase Price</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="currentPrice">Current Price</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="gainLoss">Gain/Loss</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="gainLossPercent">Return %</SortButton>
              </TableHead>
              <TableHead className="text-center">Alerts</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStocks.map((stock) => {
              const gainLoss = calculateGainLoss(stock);
              const gainLossPercent = calculateGainLossPercent(stock);
              const isPositive = gainLoss >= 0;

              return (
                <TableRow key={stock.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono font-semibold">
                        {stock.symbol}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{stock.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {stock.shares.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(stock.purchasePrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(stock.currentPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end space-x-1 font-mono ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{formatCurrency(gainLoss)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className={`font-mono ${isPositive ? 'bg-success hover:bg-success/80' : 'bg-danger hover:bg-danger/80'}`}
                    >
                      {formatPercentage(gainLossPercent)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAlertStock(stock)}
                      className="relative"
                    >
                      {getStockAlertCount(stock.id) > 0 ? (
                        <>
                          <Bell className="h-4 w-4 text-primary" />
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                          >
                            {getStockAlertCount(stock.id)}
                          </Badge>
                        </>
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAlertStock(stock)}>
                          <Bell className="mr-2 h-4 w-4" />
                          Price Alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingStock(stock)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteStock(stock.id)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingStock && (
        <EditStockModal
          stock={editingStock}
          isOpen={true}
          onClose={() => setEditingStock(null)}
          onUpdateStock={onUpdateStock}
        />
      )}

      {alertStock && (
        <PriceAlertsModal
          stock={alertStock}
          isOpen={true}
          onClose={() => setAlertStock(null)}
          alerts={alerts}
          onUpdateAlerts={onUpdateAlerts}
        />
      )}
    </>
  );
};
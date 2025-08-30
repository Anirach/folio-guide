import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { PortfolioSummary } from "./PortfolioSummary";
import { StockTable } from "./StockTable";
import { AddStockModal } from "./AddStockModal";
import { AlertNotifications } from "./AlertNotifications";
import { Stock } from "../types/portfolio";
import { PriceAlert, AlertNotification } from "../types/alerts";
import { useToast } from "@/hooks/use-toast";

const MOCK_STOCKS: Stock[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    purchasePrice: 150.00,
    currentPrice: 175.50,
    purchaseDate: "2024-01-15"
  },
  {
    id: "2",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 25,
    purchasePrice: 2800.00,
    currentPrice: 2950.75,
    purchaseDate: "2024-02-10"
  },
  {
    id: "3",
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 30,
    purchasePrice: 220.00,
    currentPrice: 195.25,
    purchaseDate: "2024-03-05"
  },
  {
    id: "4",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 40,
    purchasePrice: 320.00,
    currentPrice: 385.40,
    purchaseDate: "2024-01-20"
  }
];

export const PortfolioDashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  // Mock price checking effect (simulates real-time price monitoring)
  useEffect(() => {
    const checkAlerts = () => {
      const activeAlerts = alerts.filter(alert => alert.isActive);
      const currentStock = stocks.find(stock => 
        activeAlerts.some(alert => alert.stockId === stock.id)
      );

      activeAlerts.forEach(alert => {
        const stock = stocks.find(s => s.id === alert.stockId);
        if (!stock) return;

        const shouldTrigger = 
          (alert.type === 'upper' && stock.currentPrice >= alert.threshold) ||
          (alert.type === 'lower' && stock.currentPrice <= alert.threshold);

        if (shouldTrigger && !alert.triggeredAt) {
          const notification: AlertNotification = {
            id: Date.now().toString() + Math.random(),
            alertId: alert.id,
            stockSymbol: stock.symbol,
            message: `${stock.symbol} has ${alert.type === 'upper' ? 'exceeded' : 'dropped below'} your ${alert.type} threshold`,
            type: alert.type,
            currentPrice: stock.currentPrice,
            threshold: alert.threshold,
            timestamp: new Date().toISOString(),
            isRead: false
          };

          setNotifications(prev => [notification, ...prev]);
          
          // Mark alert as triggered
          setAlerts(prev => prev.map(a => 
            a.id === alert.id 
              ? { ...a, triggeredAt: new Date().toISOString() }
              : a
          ));

          // Show toast notification
          toast({
            title: "Price Alert Triggered!",
            description: `${stock.symbol} is now $${stock.currentPrice.toFixed(2)} (${alert.type} threshold: $${alert.threshold.toFixed(2)})`,
            duration: 5000,
          });
        }
      });
    };

    const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [stocks, alerts, toast]);

  const addStock = (newStock: Omit<Stock, 'id'>) => {
    const stock: Stock = {
      ...newStock,
      id: Date.now().toString(),
    };
    setStocks([...stocks, stock]);
  };

  const updateStock = (updatedStock: Stock) => {
    setStocks(stocks.map(stock => 
      stock.id === updatedStock.id ? updatedStock : stock
    ));
  };

  const deleteStock = (stockId: string) => {
    // Also remove alerts for this stock
    setAlerts(alerts.filter(alert => alert.stockId !== stockId));
    setStocks(stocks.filter(stock => stock.id !== stockId));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
                <p className="text-sm text-muted-foreground">Manage your investments</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <AlertNotifications
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                onDeleteNotification={deleteNotification}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Portfolio Summary */}
        <PortfolioSummary stocks={stocks} />

        {/* Stock Table */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Holdings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockTable 
              stocks={stocks} 
              onUpdateStock={updateStock}
              onDeleteStock={deleteStock}
              alerts={alerts}
              onUpdateAlerts={setAlerts}
            />
          </CardContent>
        </Card>
      </main>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStock={addStock}
      />
    </div>
  );
};
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  BellOff, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Stock } from "../types/portfolio";
import { PriceAlert } from "../types/alerts";

interface PriceAlertsModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onUpdateAlerts: (alerts: PriceAlert[]) => void;
}

export const PriceAlertsModal = ({ 
  stock, 
  isOpen, 
  onClose, 
  alerts,
  onUpdateAlerts 
}: PriceAlertsModalProps) => {
  const [newAlertType, setNewAlertType] = useState<'upper' | 'lower'>('upper');
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [error, setError] = useState('');

  const stockAlerts = alerts.filter(alert => alert.stockId === stock.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const validateThreshold = (value: string, type: 'upper' | 'lower') => {
    const threshold = parseFloat(value);
    if (isNaN(threshold) || threshold <= 0) {
      return 'Threshold must be a positive number';
    }
    
    if (type === 'upper' && threshold <= stock.currentPrice) {
      return 'Upper threshold must be above current price';
    }
    
    if (type === 'lower' && threshold >= stock.currentPrice) {
      return 'Lower threshold must be below current price';
    }
    
    return '';
  };

  const handleAddAlert = () => {
    const validationError = validateThreshold(newAlertThreshold, newAlertType);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      stockId: stock.id,
      stockSymbol: stock.symbol,
      type: newAlertType,
      threshold: parseFloat(newAlertThreshold),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedAlerts = [...alerts, newAlert];
    onUpdateAlerts(updatedAlerts);
    
    setNewAlertThreshold('');
    setError('');
  };

  const handleDeleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    onUpdateAlerts(updatedAlerts);
  };

  const handleToggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId
        ? { ...alert, isActive: !alert.isActive }
        : alert
    );
    onUpdateAlerts(updatedAlerts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Price Alerts - {stock.symbol}</span>
          </DialogTitle>
          <DialogDescription>
            Set price thresholds to receive alerts when {stock.symbol} reaches your target prices.
          </DialogDescription>
        </DialogHeader>

        {/* Current Price Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <span className="font-bold text-lg">{formatCurrency(stock.currentPrice)}</span>
          </div>
        </div>

        {/* Add New Alert */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <Label className="font-semibold">Add New Alert</Label>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={newAlertType === 'upper' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewAlertType('upper')}
                  className="flex-1"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Upper
                </Button>
                <Button
                  type="button"
                  variant={newAlertType === 'lower' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewAlertType('lower')}
                  className="flex-1"
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Lower
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Threshold ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={newAlertThreshold}
                onChange={(e) => {
                  setNewAlertThreshold(e.target.value);
                  setError('');
                }}
                className={error ? 'border-danger' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleAddAlert} 
                className="w-full"
                disabled={!newAlertThreshold}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
        </div>

        <Separator />

        {/* Active Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Active Alerts ({stockAlerts.length})</Label>
          </div>
          
          {stockAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No price alerts set for this stock</p>
              <p className="text-sm">Add alerts above to get notified of price changes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.isActive ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${
                      alert.type === 'upper' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {alert.type === 'upper' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.type === 'upper' ? 'default' : 'secondary'}>
                          {alert.type === 'upper' ? 'Upper' : 'Lower'}
                        </Badge>
                        <span className="font-semibold">
                          {formatCurrency(alert.threshold)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.type === 'upper' ? 'Alert when price goes above' : 'Alert when price goes below'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-danger hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
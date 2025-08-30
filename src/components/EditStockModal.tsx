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
import { Stock } from "../types/portfolio";

interface EditStockModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (stock: Stock) => void;
}

export const EditStockModal = ({ stock, isOpen, onClose, onUpdateStock }: EditStockModalProps) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    shares: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stock) {
      setFormData({
        symbol: stock.symbol,
        name: stock.name,
        shares: stock.shares.toString(),
        purchasePrice: stock.purchasePrice.toString(),
        currentPrice: stock.currentPrice.toString(),
        purchaseDate: stock.purchaseDate
      });
    }
  }, [stock]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Stock symbol is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!formData.shares || parseFloat(formData.shares) <= 0) {
      newErrors.shares = 'Shares must be greater than 0';
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onUpdateStock({
      ...stock,
      symbol: formData.symbol.toUpperCase().trim(),
      name: formData.name.trim(),
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      purchaseDate: formData.purchaseDate
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Stock Position</DialogTitle>
          <DialogDescription>
            Update your stock position details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className={errors.symbol ? 'border-danger' : ''}
              />
              {errors.symbol && (
                <p className="text-sm text-danger">{errors.symbol}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                step="1"
                min="1"
                placeholder="100"
                value={formData.shares}
                onChange={(e) => handleInputChange('shares', e.target.value)}
                className={errors.shares ? 'border-danger' : ''}
              />
              {errors.shares && (
                <p className="text-sm text-danger">{errors.shares}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="Apple Inc."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-danger' : ''}
            />
            {errors.name && (
              <p className="text-sm text-danger">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="150.00"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                className={errors.purchasePrice ? 'border-danger' : ''}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-danger">{errors.purchasePrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price ($)</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="175.50"
                value={formData.currentPrice}
                onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                className={errors.currentPrice ? 'border-danger' : ''}
              />
              {errors.currentPrice && (
                <p className="text-sm text-danger">{errors.currentPrice}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className={errors.purchaseDate ? 'border-danger' : ''}
            />
            {errors.purchaseDate && (
              <p className="text-sm text-danger">{errors.purchaseDate}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            >
              Update Stock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Bell, 
  BellRing, 
  X, 
  TrendingUp, 
  TrendingDown,
  Check
} from "lucide-react";
import { AlertNotification } from "../types/alerts";

interface AlertNotificationsProps {
  notifications: AlertNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}

export const AlertNotifications = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: AlertNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 text-primary" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Price Alerts</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No price alerts yet</p>
              <p className="text-xs">Set up alerts for your stocks to get notified</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {sortedNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-background hover:bg-muted/30' 
                      : 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'upper' 
                            ? 'bg-danger/10 text-danger' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {notification.type === 'upper' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.stockSymbol}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-sm font-medium mt-1">
                            {notification.type === 'upper' ? 'Price Alert Triggered!' : 'Price Alert Triggered!'}
                          </p>
                          
                          <p className="text-xs text-muted-foreground">
                            Current: {formatCurrency(notification.currentPrice)} 
                            {notification.type === 'upper' ? ' ≥ ' : ' ≤ '}
                            Threshold: {formatCurrency(notification.threshold)}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
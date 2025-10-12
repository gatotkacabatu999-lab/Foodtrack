import { X, TrendingUp, AlertTriangle, Trash2, Package, PieChart, Heart } from "lucide-react";
import { FoodItem } from "@shared/schema";
import { getDaysUntilExpiry } from "@/lib/date-utils";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItems: FoodItem[];
  deletedItems: FoodItem[];
}

export default function StatsModal({ isOpen, onClose, foodItems, deletedItems }: StatsModalProps) {
  if (!isOpen) return null;

  // Calculate statistics
  const totalItems = foodItems.length;
  const totalDeleted = deletedItems.length;
  
  const expiringItems = foodItems.filter(item => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days <= 7 && days >= 0;
  });
  
  const expiredItems = foodItems.filter(item => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days < 0;
  });

  // Category statistics
  const categoryStats = foodItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);


  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" data-testid="stats-modal">
      <div className="glass-dark rounded-lg p-6 m-4 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h5 className="text-sm font-semibold">Food Statistics</h5>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-stats-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-lg p-3 text-center">
              <Package className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-semibold">{totalItems}</div>
              <div className="text-xs text-muted-foreground">Active Items</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <Trash2 className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <div className="text-lg font-semibold">{totalDeleted}</div>
              <div className="text-xs text-muted-foreground">In Trash</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-semibold">{expiringItems.length}</div>
              <div className="text-xs text-muted-foreground">Expiring Soon</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <X className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <div className="text-lg font-semibold">{expiredItems.length}</div>
              <div className="text-xs text-muted-foreground">Expired</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-primary" />
              <span>By Category</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-2 glass rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{category}</span>
                  </div>
                  <span className="text-sm font-medium">{count} items</span>
                </div>
              ))}
              {Object.keys(categoryStats).length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No items to show
                </div>
              )}
            </div>
          </div>

          {/* Health Score */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>Food Health</span>
            </h4>
            <div className="glass rounded-lg p-3">
              {totalItems === 0 ? (
                <div className="text-center text-muted-foreground text-sm">
                  Add some food items to see your health score!
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Fresh Items</span>
                    <span className="text-sm font-medium">
                      {Math.round(((totalItems - expiredItems.length) / totalItems) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round(((totalItems - expiredItems.length) / totalItems) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="close-stats-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
import { Edit, Trash, Undo2, X, Info } from "lucide-react";
import { FoodItem } from "@shared/schema";
import { getDaysUntilExpiry, getCountdownStatus, formatExpiryDate, formatUploadDate, getDaysUntilTrashClear, isExpired } from "@/lib/date-utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FoodItemCardProps {
  item: FoodItem;
  isDeleted?: boolean;
  onEdit?: (item: FoodItem) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}


export default function FoodItemCard({ 
  item, 
  isDeleted = false, 
  onEdit, 
  onDelete, 
  onRestore, 
  onPermanentDelete 
}: FoodItemCardProps) {
  const daysRemaining = getDaysUntilExpiry(item.expiryDate);
  const status = getCountdownStatus(daysRemaining);
  
  if (isDeleted) {
    const daysUntilClear = item.deletedAt ? getDaysUntilTrashClear(item.deletedAt) : 0;
    const itemExpired = isExpired(item.expiryDate);
    
    return (
      <div className="glass rounded-lg p-3 opacity-70 animate-fade-in" data-testid={`deleted-item-${item.id}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <h3 className="text-sm font-medium line-through" data-testid="item-name">
                {item.name}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground" data-testid="deleted-date">
                Deleted: {item.deletedAt ? formatExpiryDate(item.deletedAt) : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-orange-400" data-testid="trash-countdown">
                {daysUntilClear > 0 
                  ? `Auto-clear in ${daysUntilClear} day${daysUntilClear !== 1 ? 's' : ''}`
                  : 'Ready for auto-clear'
                }
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-3">
            {!itemExpired && (
              <button 
                className="p-1 hover:bg-green-500/20 rounded text-xs transition-colors duration-200"
                onClick={() => onRestore?.(item.id)}
                data-testid={`restore-item-${item.id}`}
              >
                <Undo2 className="w-3 h-3 text-green-400 transition-transform hover:rotate-12" />
              </button>
            )}
            <button 
              className="p-1 hover:bg-red-500/20 rounded text-xs transition-colors duration-200 group"
              onClick={() => onPermanentDelete?.(item.id)}
              data-testid={`permanent-delete-${item.id}`}
            >
              <X className="w-3 h-3 text-destructive transition-transform hover:rotate-90 group-hover:animate-[shake_0.5s_ease-in-out] group-active:animate-[wobble_0.6s_ease-in-out]" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass rounded-lg p-3 animate-fade-in" data-testid={`food-item-${item.id}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h3 className="text-sm font-medium" data-testid="item-name">
              {item.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground" data-testid="expiry-date">
              Expires: {formatExpiryDate(item.expiryDate)}
            </span>
            <span 
              className={`countdown-badge ${status}`}
              data-testid="countdown-badge"
            >
              {daysRemaining < 0 ? 'Expired' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-3">
          <button 
            className="p-1 hover:bg-white/10 rounded text-xs transition-colors duration-200"
            onClick={() => onEdit?.(item)}
            data-testid={`edit-item-${item.id}`}
          >
            <Edit className="w-3 h-3 text-muted-foreground transition-transform hover:rotate-12" />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="p-1 hover:bg-blue-500/20 rounded text-xs transition-colors duration-200"
                data-testid={`info-item-${item.id}`}
              >
                <Info className="w-3 h-3 text-blue-400 transition-transform hover:scale-110" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side="left" align="center">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">Item Details</h4>
                {item.createdAt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Upload Date & Time:</p>
                    <p className="text-xs text-foreground">{formatUploadDate(item.createdAt)}</p>
                  </div>
                )}
                {item.notes ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                    <p className="text-xs text-foreground leading-relaxed">{item.notes}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                    <p className="text-xs text-muted-foreground italic">No notes added</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <button 
            className="p-1 hover:bg-red-500/20 rounded text-xs transition-colors duration-200 group"
            onClick={() => onDelete?.(item.id)}
            data-testid={`delete-item-${item.id}`}
          >
            <Trash className="w-3 h-3 text-destructive transition-transform duration-200 group-hover:animate-[shake_0.5s_ease-in-out] group-active:animate-[wobble_0.6s_ease-in-out]" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { X, Check, Bell, Trash2, Calendar, BarChart3, Settings, Utensils } from "lucide-react";

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DescriptionModal({ isOpen, onClose }: DescriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" data-testid="description-modal">
      <div className="glass-dark rounded-lg p-6 m-4 w-full max-w-md animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">About FoodTracker</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-description-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Track Food Expiration</h4>
            <p className="text-muted-foreground leading-relaxed">
              Keep track of your food items and their expiration dates to reduce waste and stay organized.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Key Features:</h4>
            
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Smart Notifications</span>
                <p className="text-muted-foreground text-xs mt-1">Get alerts 15 days and 3 days before items expire</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Bell className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Browser Notifications</span>
                <p className="text-muted-foreground text-xs mt-1">Receive push notifications even when app is closed</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Trash2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Auto-Delete Expired</span>
                <p className="text-muted-foreground text-xs mt-1">Automatically move expired items to trash (can be disabled)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Calendar View</span>
                <p className="text-muted-foreground text-xs mt-1">View all expiring items in a monthly calendar layout</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <BarChart3 className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Statistics</span>
                <p className="text-muted-foreground text-xs mt-1">Track your food waste patterns and category breakdowns</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Settings className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Customizable Settings</span>
                <p className="text-muted-foreground text-xs mt-1">Configure notifications and auto-delete preferences</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-2">Categories:</h4>
            <div className="flex items-center space-x-4 text-xs">
              <span className="px-2 py-1 bg-muted rounded text-muted-foreground">None</span>
              <span className="px-2 py-1 bg-muted rounded text-muted-foreground">LSSD</span>
              <span className="px-2 py-1 bg-muted rounded text-muted-foreground">GM</span>
              <span className="px-2 py-1 bg-muted rounded text-muted-foreground">RTE</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="close-description-button"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
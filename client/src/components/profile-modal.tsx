import { useState } from "react";
import { X, User, Settings, Bell, Trash2, Download, Upload, Shield, AlertTriangle, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export default function ProfileModal({ isOpen, onClose, onClearAllData }: ProfileModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [fifteenDayWarning, setFifteenDayWarning] = useState(true);
  const [threeDayWarning, setThreeDayWarning] = useState(true);

  if (!isOpen) return null;

  const handleExportData = () => {
    // This would implement data export functionality
    console.log("Exporting data...");
  };

  const handleImportData = () => {
    // This would implement data import functionality
    console.log("Importing data...");
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" data-testid="profile-modal">
      <div className="glass-dark rounded-lg p-6 m-4 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-profile-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Info Section */}
          <div className="glass rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Food Tracker User</h4>
                <p className="text-sm text-muted-foreground">Managing your food inventory</p>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>App Preferences</span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 glass rounded">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="notifications" className="text-sm">Push Notifications</Label>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  data-testid="notifications-toggle"
                />
              </div>

              <div className="flex items-center justify-between p-3 glass rounded">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="dark-mode" className="text-sm">Dark Theme</Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  data-testid="dark-mode-toggle"
                />
              </div>

              <div className="flex items-center justify-between p-3 glass rounded">
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="auto-delete" className="text-sm">Auto-delete expired items</Label>
                </div>
                <Switch
                  id="auto-delete"
                  checked={autoDelete}
                  onCheckedChange={setAutoDelete}
                  data-testid="auto-delete-toggle"
                />
              </div>

              <div className="flex items-center justify-between p-3 glass rounded">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="fifteen-day-warning" className="text-sm">15-day warning</Label>
                </div>
                <Switch
                  id="fifteen-day-warning"
                  checked={fifteenDayWarning}
                  onCheckedChange={setFifteenDayWarning}
                  data-testid="fifteen-day-warning-toggle"
                />
              </div>

              <div className="flex items-center justify-between p-3 glass rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="three-day-warning" className="text-sm">3-day warning</Label>
                </div>
                <Switch
                  id="three-day-warning"
                  checked={threeDayWarning}
                  onCheckedChange={setThreeDayWarning}
                  data-testid="three-day-warning-toggle"
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <Database className="w-4 h-4 text-primary" />
              <span>Data Management</span>
            </h4>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex-1 text-xs"
                  data-testid="export-data-button"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportData}
                  className="flex-1 text-xs"
                  data-testid="import-data-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Import Data
                </Button>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearAllData}
                className="w-full text-xs"
                data-testid="clear-all-data-button"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All Data
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div className="glass rounded-lg p-3">
            <div className="text-center space-y-1">
              <h5 className="text-sm font-medium">FoodTracker</h5>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground">
                Keep track of your food expiry dates and reduce waste
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            onClick={onClose}
            className="w-full"
            data-testid="close-profile-button"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
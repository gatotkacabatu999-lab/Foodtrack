import { useState, useEffect } from "react";
import { X, Download, Info, Trash2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData?: () => void;
}

interface Settings {
  pushNotifications: boolean;
  warningDays15: boolean;
  warningDays3: boolean;
  autoDeleteExpired: boolean;
}

export default function SettingsModal({ isOpen, onClose, onClearAllData }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    warningDays15: true,
    warningDays3: true,
    autoDeleteExpired: true
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('foodTracker-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  const updateSetting = (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('foodTracker-settings', JSON.stringify(newSettings));
    
    // Update notification permissions if needed
    if (key === 'pushNotifications' && value && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const exportData = () => {
    // Export functionality could be implemented here
    console.log('Export data functionality would be implemented here');
  };

  const showAbout = () => {
    alert('FoodTracker v1.0\nTrack food expiration dates and reduce waste with smart notifications.');
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/change-password', {
        currentPassword,
        newPassword
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Password changed successfully!');
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Failed to change password');
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearAllData?.();
      localStorage.removeItem('foodTracker-settings');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" data-testid="settings-modal">
      <div className="glass-dark rounded-lg p-6 m-4 w-full max-w-sm max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slide-up scale-100 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          <div className="flex items-center justify-between">
            <span className="text-sm">Push Notifications</span>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              data-testid="toggle-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">15-Day Warning</span>
            <Switch
              checked={settings.warningDays15}
              onCheckedChange={(checked) => updateSetting('warningDays15', checked)}
              data-testid="toggle-15-day-warning"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">3-Day Alert</span>
            <Switch
              checked={settings.warningDays3}
              onCheckedChange={(checked) => updateSetting('warningDays3', checked)}
              data-testid="toggle-3-day-alert"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-Delete Expired</span>
            <Switch
              checked={settings.autoDeleteExpired}
              onCheckedChange={(checked) => updateSetting('autoDeleteExpired', checked)}
              data-testid="toggle-auto-delete"
            />
          </div>

          <hr className="border-border my-4" />

          {showChangePassword ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Change Admin Password</h4>
              <div>
                <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-input border-border text-xs"
                  data-testid="current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-input border-border text-xs"
                  data-testid="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input border-border text-xs"
                  data-testid="confirm-password"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-destructive" data-testid="password-error">
                  {passwordError}
                </p>
              )}
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="flex-1 text-xs"
                  data-testid="cancel-password-change"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleChangePassword}
                  className="flex-1 text-xs"
                  data-testid="save-password-change"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportData}
                className="w-full justify-start text-sm py-2 hover:bg-white/5"
                data-testid="export-data"
              >
                <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                Export Data
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangePassword(true)}
                className="w-full justify-start text-sm py-2 hover:bg-white/5"
                data-testid="change-password"
              >
                <Key className="w-4 h-4 mr-2 text-muted-foreground" />
                Change Password
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={showAbout}
            className="w-full justify-start text-sm py-2 hover:bg-white/5"
            data-testid="about-button"
          >
            <Info className="w-4 h-4 mr-2 text-muted-foreground" />
            About
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllData}
            className="w-full justify-start text-sm py-2 text-destructive hover:bg-red-500/10"
            data-testid="clear-data"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  description: string;
}

export default function PasswordModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description 
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    onConfirm(password);
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in"
      data-testid="password-modal"
    >
      <div className="glass-dark rounded-lg p-6 m-4 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold" data-testid="password-modal-title">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-password-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4" data-testid="password-modal-description">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={`bg-input border-border ${error ? "border-destructive" : ""}`}
              data-testid="input-password"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive mt-1" data-testid="password-error">
                {error}
              </p>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              data-testid="cancel-password"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              data-testid="confirm-password"
            >
              Confirm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
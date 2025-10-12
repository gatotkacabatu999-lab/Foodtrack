import { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

interface NotificationProps {
  id: string;
  message: string;
  type:
    | "success"
    | "warning"
    | "error"
    | "info"
    | "warning-3day"
    | "warning-8day"
    | "warning-15day";
  onRemove: (id: string) => void;
  duration?: number;
}

export default function Notification({
  id,
  message,
  type,
  onRemove,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onRemove, duration]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
      case "warning-3day":
      case "warning-8day":
      case "warning-15day":
        return <AlertTriangle className="w-4 h-4" />;
      case "error":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "warning-3day":
        return "text-red-400";
      case "warning-8day":
        return "text-red-400";
      case "warning-15day":
        return "text-orange-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div
      className={`glass rounded-lg p-3 text-sm flex items-center space-x-2 mb-2 animate-slide-up ${getColorClass()}`}
      data-testid={`notification-${type}`}
    >
      {getIcon()}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        data-testid={`close-notification-${id}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

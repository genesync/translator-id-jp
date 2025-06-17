
import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoBannerProps {
  type: 'success' | 'warning' | 'info';
  title: string;
  children: React.ReactNode;
  dismissible?: boolean;
  defaultOpen?: boolean;
  onClose?: () => void;
  persistentId?: string; // For tracking closed state in localStorage
  toggleMode?: boolean; // For show/hide instead of close
}

const InfoBanner = ({ 
  type, 
  title, 
  children, 
  dismissible = true, 
  defaultOpen = true,
  onClose,
  persistentId,
  toggleMode = false
}: InfoBannerProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (persistentId) {
      const closedState = localStorage.getItem(`info_banner_${persistentId}`);
      if (closedState === 'closed') {
        setIsOpen(false);
      }
    }
  }, [persistentId]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (toggleMode) {
      setIsOpen(false);
    } else {
      setIsOpen(false);
      if (persistentId) {
        localStorage.setItem(`info_banner_${persistentId}`, 'closed');
      }
      onClose?.();
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-300';
      case 'warning':
        return 'text-amber-800 dark:text-amber-300';
      case 'info':
        return 'text-blue-800 dark:text-blue-300';
      default:
        return 'text-blue-800 dark:text-blue-300';
    }
  };

  return (
    <div className={`mb-6 p-6 border rounded-lg ${getStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getIcon()}
          <div className="flex-1">
            <h3 className={`font-medium ${getTitleColor()} mb-2`}>
              {title}
            </h3>
            <div className={`${type === 'success' ? 'text-green-700 dark:text-green-400' : 
                              type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 
                              'text-blue-700 dark:text-blue-400'}`}>
              {children}
            </div>
          </div>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMode ? handleToggle : handleClose}
            className="p-1 h-auto"
          >
            {toggleMode ? <EyeOff className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InfoBanner;

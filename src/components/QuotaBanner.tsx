
import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotaBannerProps {
  remainingQuota: number;
  totalQuota: number;
  apiProvider: string;
  nextApiProvider?: string;
  nextApiQuota?: number;
  onClose?: () => void;
}

const QuotaBanner = ({ 
  remainingQuota, 
  totalQuota, 
  apiProvider, 
  nextApiProvider,
  nextApiQuota,
  onClose 
}: QuotaBannerProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [lastClosedLevel, setLastClosedLevel] = useState<number>(0);

  useEffect(() => {
    const savedLevel = localStorage.getItem(`quota_banner_${apiProvider}_closed_level`);
    if (savedLevel) {
      setLastClosedLevel(parseInt(savedLevel));
    }
  }, [apiProvider]);

  if (!isOpen) return null;

  const quotaPercentage = (remainingQuota / totalQuota) * 100;
  
  // Show logic based on quota levels and previous close actions
  const shouldShow = () => {
    if (quotaPercentage > 20) return false;
    
    if (lastClosedLevel === 0) {
      return quotaPercentage <= 20; // First time showing
    } else if (lastClosedLevel === 20) {
      return quotaPercentage <= 10; // Show again when critical
    } else if (lastClosedLevel === 10) {
      return quotaPercentage <= 1; // Show when switching APIs
    }
    
    return false;
  };

  if (!shouldShow()) return null;

  const handleClose = () => {
    setIsOpen(false);
    
    // Save the current level when closed
    if (quotaPercentage <= 1) {
      localStorage.setItem(`quota_banner_${apiProvider}_closed_level`, '1');
    } else if (quotaPercentage <= 10) {
      localStorage.setItem(`quota_banner_${apiProvider}_closed_level`, '10');
    } else {
      localStorage.setItem(`quota_banner_${apiProvider}_closed_level`, '20');
    }
    
    onClose?.();
  };

  const getWarningLevel = () => {
    if (quotaPercentage <= 1) return 'critical';
    if (quotaPercentage <= 10) return 'severe';
    return 'warning';
  };

  const warningLevel = getWarningLevel();
  const isVeryLow = warningLevel === 'severe' || warningLevel === 'critical';

  const getTitle = () => {
    switch (warningLevel) {
      case 'critical':
        return 'Kritis: API Akan Beralih';
      case 'severe':
        return 'Peringatan: Quota API Hampir Habis';
      default:
        return 'Info: Quota API Menipis';
    }
  };

  const getDescription = () => {
    switch (warningLevel) {
      case 'critical':
        return `Sistem akan beralih dari ${apiProvider.toUpperCase()} ke ${nextApiProvider?.toUpperCase() || 'API berikutnya'} ${nextApiQuota ? `dengan quota ${nextApiQuota.toLocaleString()}` : ''}`;
      case 'severe':
        return `API ${apiProvider.toUpperCase()} tinggal ${remainingQuota} request. Sistem akan beralih ke ${nextApiProvider?.toUpperCase() || 'API berikutnya'} setelah habis.`;
      default:
        return 'Pertimbangkan untuk top up quota API Anda dalam waktu dekat.';
    }
  };

  return (
    <div className={`mb-6 p-6 border rounded-lg ${
      isVeryLow 
        ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
        : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertCircle className={`w-6 h-6 ${
            isVeryLow ? 'text-red-600' : 'text-amber-600'
          }`} />
          <div className="flex-1">
            <h3 className={`font-medium mb-2 ${
              isVeryLow 
                ? 'text-red-800 dark:text-red-300'
                : 'text-amber-800 dark:text-amber-300'
            }`}>
              {getTitle()}
            </h3>
            <div className={`${
              isVeryLow 
                ? 'text-red-700 dark:text-red-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              <p className="mb-2">
                <strong>API Provider:</strong> {apiProvider.toUpperCase()}
              </p>
              <p className="mb-2">
                <strong>Sisa Quota:</strong> {remainingQuota.toLocaleString()} dari {totalQuota.toLocaleString()} 
                <span className="ml-2">({quotaPercentage.toFixed(1)}%)</span>
              </p>
              <p className="text-sm">
                {getDescription()}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuotaBanner;

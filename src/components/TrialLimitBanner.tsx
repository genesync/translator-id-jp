
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";

interface TrialLimitBannerProps {
  remainingTrials: number;
  onSignIn: () => void;
}

const TrialLimitBanner = ({ remainingTrials, onSignIn }: TrialLimitBannerProps) => {
  const isLimitReached = remainingTrials <= 0;

  return (
    <Card className={`mb-6 ${isLimitReached ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${isLimitReached ? 'bg-red-100' : 'bg-blue-100'}`}>
            {isLimitReached ? (
              <Lock className={`w-5 h-5 ${isLimitReached ? 'text-red-600' : 'text-blue-600'}`} />
            ) : (
              <Zap className={`w-5 h-5 ${isLimitReached ? 'text-red-600' : 'text-blue-600'}`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold mb-2 ${isLimitReached ? 'text-red-800' : 'text-blue-800'}`}>
              {isLimitReached ? 'Batas Trial Tercapai' : 'Mode Trial'}
            </h3>
            <p className={`text-sm mb-3 ${isLimitReached ? 'text-red-700' : 'text-blue-700'}`}>
              {isLimitReached 
                ? 'Anda telah menggunakan semua percobaan gratis. Silakan masuk dengan Google untuk menggunakan fitur terjemahan tanpa batas.'
                : `Anda memiliki ${remainingTrials} percobaan terjemahan tersisa. Masuk dengan Google untuk akses unlimited.`
              }
            </p>
            <Button 
              onClick={onSignIn}
              className={`${isLimitReached 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialLimitBanner;

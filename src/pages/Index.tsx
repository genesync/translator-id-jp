import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import TranslateForm from "@/components/TranslateForm";
import TranslationHistory from "@/components/TranslationHistory";
import ApiKeyWarning from "@/components/ApiKeyWarning";
import TrialLimitBanner from "@/components/TrialLimitBanner";
import InfoBanner from "@/components/InfoBanner";
import QuotaBanner from "@/components/QuotaBanner";
import { MultiApiService } from "@/services/multiApiService";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { Languages, History, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const TRIAL_LIMIT = 3; // Maximum free translations for non-logged in users

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [apiService] = useState(() => new MultiApiService());
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [trialCount, setTrialCount] = useState(0);
  const [currentApiProvider, setCurrentApiProvider] = useState<string>('');
  const [apiSettingsChanged, setApiSettingsChanged] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user session
    const checkAuth = async () => {
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        loadTranslations();
      }
    };

    // Load trial count from localStorage
    const savedTrialCount = parseInt(localStorage.getItem('trialCount') || '0');
    setTrialCount(savedTrialCount);

    // Check if API settings have changed
    const lastApiCheck = localStorage.getItem('last_api_check');
    const currentApis = JSON.stringify(apiService.getAvailableApis().sort());
    if (lastApiCheck !== currentApis) {
      setApiSettingsChanged(true);
      localStorage.setItem('last_api_check', currentApis);
      // Clear info banner closed states when APIs change
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('info_banner_')) {
          localStorage.removeItem(key);
        }
      });
    }

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      const { user } = await supabaseService.signInWithGoogle();
      setUser(user);
      await loadTranslations();
      toast({
        title: "Berhasil Masuk",
        description: `Selamat datang, ${user.user_metadata?.full_name || user.email}! Sekarang Anda bisa menggunakan terjemahan tanpa batas.`
      });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "Gagal masuk dengan Google. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setTranslations([]);
      toast({
        title: "Berhasil Keluar",
        description: "Anda berhasil keluar dari akun"
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Gagal keluar dari akun",
        variant: "destructive"
      });
    }
  };

  const handleTranslate = async (text: string, direction: 'indonesia-japanese' | 'japanese-indonesia') => {
    // Check trial limit for non-logged in users
    if (!user && trialCount >= TRIAL_LIMIT) {
      toast({
        title: "Batas Trial Tercapai",
        description: "Silakan masuk dengan Google untuk menggunakan terjemahan tanpa batas",
        variant: "destructive"
      });
      return;
    }

    // Check if any API is available
    const availableApis = apiService.getAvailableApis();
    console.log('Available APIs before translation:', availableApis);
    
    if (availableApis.length === 0) {
      toast({
        title: "Tidak Ada API Tersedia",
        description: "Silakan konfigurasikan API di halaman pengaturan dan pastikan ada API yang aktif",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.translate(text, direction);
      setCurrentApiProvider(result.provider);
      
      // Show which API was used
      toast({
        title: "Terjemahan Berhasil",
        description: `Diterjemahkan menggunakan ${result.provider.toUpperCase()}`,
      });
      
      // Increment trial count for non-logged in users
      if (!user) {
        const newTrialCount = trialCount + 1;
        setTrialCount(newTrialCount);
        localStorage.setItem('trialCount', newTrialCount.toString());
        
        if (newTrialCount >= TRIAL_LIMIT) {
          toast({
            title: "Trial Terakhir Digunakan",
            description: "Ini adalah percobaan terakhir Anda. Masuk dengan Google untuk akses unlimited!",
            variant: "destructive"
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Translation error:", error);
      
      // Show specific error messages for API switching
      if (error instanceof Error) {
        if (error.message.includes('Tidak ada API')) {
          toast({
            title: "Semua API Tidak Tersedia",
            description: "Silakan periksa pengaturan API atau coba lagi nanti",
            variant: "destructive"
          });
        } else if (error.message.includes('Semua API gagal')) {
          toast({
            title: "Semua API Gagal",
            description: "Terjadi masalah dengan semua layanan translation. Periksa koneksi internet dan API key Anda.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error Terjemahan",
            description: error.message,
            variant: "destructive"
          });
        }
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async (translationData: any) => {
    if (!user) {
      toast({
        title: "Info",
        description: "Silakan masuk terlebih dahulu untuk menyimpan riwayat",
        variant: "destructive"
      });
      return;
    }

    try {
      const savedTranslation = await supabaseService.saveTranslation(translationData);
      setTranslations(prev => [savedTranslation, ...prev]);
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  const loadTranslations = async () => {
    try {
      const userTranslations = await supabaseService.getTranslations();
      setTranslations(userTranslations);
    } catch (error) {
      console.error("Load translations error:", error);
    }
  };

  const handleLoadTranslation = (translation: any) => {
    toast({
      title: "Riwayat Dimuat",
      description: "Terjemahan dari riwayat berhasil dimuat"
    });
  };

  // Check if any API is configured
  const availableApis = apiService.getAvailableApis();
  const hasConfiguredApi = availableApis.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Translate Indonesia ⇄ Jepang
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Terjemahan berkualitas tinggi dengan Multi-API untuk JLPT N5-N3
            </p>
          </div>
          <Link to="/settings">
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Pengaturan API</span>
            </Button>
          </Link>
        </div>

        {!hasConfiguredApi ? (
          <InfoBanner 
            type="warning" 
            title="Konfigurasi API Diperlukan"
            persistentId="no_api_configured"
          >
            <p className="text-sm mb-3">
              Silakan konfigurasikan setidaknya satu API translation di pengaturan untuk mulai menggunakan layanan.
            </p>
            <Link to="/settings">
              <Button variant="outline" size="sm">
                Konfigurasi Sekarang
              </Button>
            </Link>
          </InfoBanner>
        ) : (
          <InfoBanner 
            type="success" 
            title="Sistem Siap Digunakan"
            persistentId={`system_ready_${availableApis.join('_')}`}
            key={`system_ready_${availableApis.join('_')}`}
          >
            <p className="text-sm">
              API tersedia: <strong>{availableApis.join(', ').toUpperCase()}</strong>
              {apiSettingsChanged && <span className="block mt-1 text-xs text-green-600">✓ Konfigurasi API berhasil diperbarui</span>}
            </p>
          </InfoBanner>
        )}

        {/* Enhanced Quota Banner with next API info */}
        <QuotaBanner
          remainingQuota={150}
          totalQuota={1000}
          apiProvider="openai"
          nextApiProvider="google"
          nextApiQuota={5000}
        />

        <Tabs defaultValue="translate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
            <TabsTrigger value="translate" className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <span>Terjemahkan</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Riwayat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translate" className="space-y-6">
            <InfoBanner 
              type="info" 
              title="Penting: API Key dan Quota"
              persistentId="api_quota_info"
              toggleMode={true}
            >
              <div className="space-y-2 text-sm">
                <p>• Pastikan API key Anda memiliki credit/quota yang cukup</p>
                <p>• Periksa billing dashboard OpenAI untuk melihat usage Anda</p>
                <p>• Jika error 429 muncul, tunggu beberapa saat atau top up quota</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.open('https://platform.openai.com/usage', '_blank')}
                >
                  Cek Quota OpenAI
                </Button>
              </div>
            </InfoBanner>
            
            {!user && (
              <TrialLimitBanner 
                remainingTrials={TRIAL_LIMIT - trialCount}
                onSignIn={handleSignIn}
              />
            )}
            
            <TranslateForm
              onTranslate={handleTranslate}
              onSaveHistory={handleSaveHistory}
              loading={loading}
              disabled={!hasConfiguredApi || (!user && trialCount >= TRIAL_LIMIT)}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {!user ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Riwayat Terjemahan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Silakan masuk dengan Google untuk melihat dan menyimpan riwayat terjemahan Anda
                </p>
                <button
                  onClick={handleSignIn}
                  disabled={authLoading}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {authLoading ? 'Memuat...' : 'Masuk dengan Google'}
                </button>
              </div>
            ) : (
              <TranslationHistory
                translations={translations}
                onLoadTranslation={handleLoadTranslation}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-16 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/20">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>Translate Indonesia ⇄ Jepang</strong> - Aplikasi untuk Calon Pekerja Migran
          </p>
          <p className="text-sm">
            Didukung oleh OpenAI GPT-4 • Dibangun dengan React & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { API_PROVIDERS } from "@/services/apiProviders";
import { MultiApiService } from "@/services/multiApiService";
import { useToast } from "@/hooks/use-toast";
import { Settings, Key, Activity, AlertTriangle, ExternalLink } from "lucide-react";

const API_KEY_LINKS = {
  openai: "https://platform.openai.com/api-keys",
  google: "https://console.cloud.google.com/apis/credentials",
  libretranslate: "https://libretranslate.com/docs/#authentication",
  mymemory: "https://mymemory.translated.net/doc/keygen.php"
};

const ApiSettings = () => {
  const [apiService] = useState(() => new MultiApiService());
  const [apiKeys, setApiKeys] = useState<{[key: string]: string}>({});
  const [activeApis, setActiveApis] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load current API keys and active status
    const keys: {[key: string]: string} = {};
    const active: {[key: string]: boolean} = {};
    
    API_PROVIDERS.forEach(provider => {
      keys[provider.id] = apiService.getApiKey(provider.id) || '';
      active[provider.id] = apiService.isApiActive(provider.id);
    });
    
    setApiKeys(keys);
    setActiveApis(active);
    
    console.log('Loaded API settings:', { keys: Object.keys(keys), active });
  }, [apiService]);

  const handleApiKeyChange = (apiId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [apiId]: value }));
  };

  const handleSaveApiKey = (apiId: string) => {
    apiService.setApiKey(apiId, apiKeys[apiId]);
    toast({
      title: "API Key Disimpan",
      description: `API key untuk ${API_PROVIDERS.find(p => p.id === apiId)?.name} berhasil disimpan`
    });
  };

  const handleToggleApi = (apiId: string, enabled: boolean) => {
    console.log(`Toggling API ${apiId} to ${enabled}`);
    setActiveApis(prev => ({ ...prev, [apiId]: enabled }));
    apiService.setApiActive(apiId, enabled);
    toast({
      title: enabled ? "API Diaktifkan" : "API Dinonaktifkan",
      description: `${API_PROVIDERS.find(p => p.id === apiId)?.name} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`
    });
  };

  const getUsagePercentage = (apiId: string) => {
    const usage = apiService.getUsageInfo(apiId);
    return (usage.used / usage.limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const openApiKeyLink = (apiId: string) => {
    const link = API_KEY_LINKS[apiId as keyof typeof API_KEY_LINKS];
    if (link) {
      window.open(link, '_blank');
    }
  };

  // Check which APIs are currently available
  const availableApis = apiService.getAvailableApis();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Pengaturan API Translation</h2>
      </div>

      {/* API Status Summary */}
      <Card className="glass-card border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Activity className="w-5 h-5" />
            <span>Status Sistem</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{availableApis.length}</div>
              <div className="text-sm text-gray-600">API Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(activeApis).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">API Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(apiKeys).filter(key => apiKeys[key]).length}
              </div>
              <div className="text-sm text-gray-600">API Keys</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${availableApis.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {availableApis.length > 0 ? 'SIAP' : 'ERROR'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
          {availableApis.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✅ Sistem siap digunakan dengan API: <strong>{availableApis.join(', ')}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Key Generation Guide */}
      <Card className="glass-card border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <Key className="w-5 h-5" />
            <span>Generate API Keys</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Klik link di bawah untuk mendapatkan API key dari masing-masing provider:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {API_PROVIDERS.map(provider => (
              <Button
                key={provider.id}
                variant="outline"
                size="sm"
                onClick={() => openApiKeyLink(provider.id)}
                className="flex items-center justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Konfigurasi API</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {API_PROVIDERS.map(provider => {
              const usage = apiService.getUsageInfo(provider.id);
              const percentage = getUsagePercentage(provider.id);
              const isAvailable = availableApis.includes(provider.id);
              const isActive = activeApis[provider.id];

              return (
                <div key={provider.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => handleToggleApi(provider.id, checked)}
                      />
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-gray-600">{provider.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isAvailable ? "default" : "destructive"}>
                        {isAvailable ? "Tersedia" : "Tidak Tersedia"}
                      </Badge>
                      {percentage >= 90 && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Always show API key input for all providers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`api-key-${provider.id}`} className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>
                          API Key 
                          {!provider.requiresKey && (
                            <span className="text-xs text-gray-500 ml-1">(Opsional)</span>
                          )}
                        </span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openApiKeyLink(provider.id)}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Get API Key
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        id={`api-key-${provider.id}`}
                        type="password"
                        value={apiKeys[provider.id] ?? ''}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                        placeholder={
                          provider.requiresKey 
                            ? "Masukkan API key..." 
                            : "Masukkan API key untuk rate limit lebih tinggi (opsional)..."
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSaveApiKey(provider.id)}
                        disabled={!apiKeys[provider.id]}
                        size="sm"
                      >
                        Simpan
                      </Button>
                    </div>
                    {!provider.requiresKey && (
                      <p className="text-xs text-gray-500">
                        {provider.name} gratis dengan limit {provider.freeLimit} request/hari. 
                        API key opsional untuk rate limit lebih tinggi.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Penggunaan</span>
                      <span>{usage.used} / {usage.limit}</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Priority: {provider.priority}</span>
                      <span className={percentage >= 90 ? "text-red-500 font-medium" : ""}>
                        {percentage.toFixed(1)}% digunakan
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Auto-Switching</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Sistem akan otomatis beralih ke API lain ketika API yang sedang digunakan mencapai batas quota. 
              Urutan prioritas berdasarkan kualitas dan ketersediaan.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Urutan Prioritas API:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {API_PROVIDERS
                  .sort((a, b) => a.priority - b.priority)
                  .map(provider => (
                    <li key={provider.id} className="flex items-center justify-between">
                      <span>{provider.name}</span>
                      <Badge variant={activeApis[provider.id] ? "default" : "secondary"}>
                        {activeApis[provider.id] ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSettings;

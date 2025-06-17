
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Key, ExternalLink } from "lucide-react";
import { StorageService } from "@/services/storageService";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState(StorageService.getApiKey() || "");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Silakan masukkan API Key OpenAI",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Error", 
        description: "API Key OpenAI harus dimulai dengan 'sk-'",
        variant: "destructive"
      });
      return;
    }

    StorageService.saveApiKey(apiKey);
    onApiKeySet(apiKey);
    toast({
      title: "Berhasil",
      description: "API Key berhasil disimpan"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-center text-xl">
            API Key Diperlukan
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan API Key OpenAI untuk menggunakan fitur terjemahan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Catatan Keamanan:</strong>
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• API Key disimpan di browser Anda saja</li>
              <li>• Tidak dikirim ke server kami</li>
              <li>• Hapus dari browser jika menggunakan komputer umum</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Simpan API Key
            </Button>
          </form>

          <div className="pt-4 border-t space-y-3">
            <p className="text-xs text-gray-600 text-center">
              Belum punya API Key?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Dapatkan API Key OpenAI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyInput;

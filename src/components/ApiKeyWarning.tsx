
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const ApiKeyWarning = () => {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="space-y-3">
          <p className="font-medium">
            Penting: Untuk menggunakan fitur terjemahan, Anda perlu API key OpenAI yang valid dengan quota tersedia.
          </p>
          <div className="text-sm space-y-2">
            <p>• Pastikan API key Anda memiliki credit/quota yang cukup</p>
            <p>• Periksa billing dashboard OpenAI untuk melihat usage Anda</p>
            <p>• Jika error 429 muncul, tunggu beberapa saat atau top up quota</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 text-amber-700 border-amber-300 hover:bg-amber-100"
            onClick={() => window.open('https://platform.openai.com/usage', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Cek Quota OpenAI
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeyWarning;

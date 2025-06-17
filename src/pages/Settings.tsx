
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApiSettings from "@/components/ApiSettings";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header user={null} onSignOut={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Translate
            </Button>
          </Link>
        </div>

        <ApiSettings />
      </main>
    </div>
  );
};

export default Settings;

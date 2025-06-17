
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { Link } from "react-router-dom";
import ModalPricing from "@/components/ModalPricing";

interface HeaderProps {
  user: any;
  onSignOut: () => void;
}

const Header = ({ user, onSignOut }: HeaderProps) => {
  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">翻</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Translate Indonesia ⇄ Jepang
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                JLPT N5-N3 untuk Calon Pekerja Migran
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DarkModeToggle />
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
            
                <ModalPricing />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

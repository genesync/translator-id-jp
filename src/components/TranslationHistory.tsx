
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Volume2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Translation {
  id: string;
  input_text: string;
  output_text: string;
  romaji?: string;
  jlpt_level?: string;
  direction: 'indonesia-japanese' | 'japanese-indonesia';
  created_at: string;
}

interface TranslationHistoryProps {
  translations: Translation[];
  onLoadTranslation: (translation: Translation) => void;
}

const TranslationHistory = ({ translations, onLoadTranslation }: TranslationHistoryProps) => {
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const { toast } = useToast();

  const handlePlayAudio = (text: string, direction: string) => {
    try {
      if ('speechSynthesis' in window) {
        // Stop any currently playing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (direction === 'indonesia-japanese') {
          utterance.lang = 'ja-JP';
          utterance.rate = 0.8; // Slower for Japanese
        } else {
          utterance.lang = 'id-ID';
          utterance.rate = 1.0;
        }
        
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          toast({
            title: "Error Audio",
            description: "Gagal memutar audio. Silakan coba lagi.",
            variant: "destructive"
          });
        };
        
        speechSynthesis.speak(utterance);
        
        toast({
          title: "Audio Diputar",
          description: "Memutar audio dari riwayat"
        });
      } else {
        toast({
          title: "Tidak Didukung",
          description: "Browser Anda tidak mendukung fitur audio",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Audio error:', error);
      toast({
        title: "Error Audio",
        description: "Terjadi kesalahan saat memutar audio",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id });
    } catch {
      return dateString;
    }
  };

  if (translations.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Belum Ada Riwayat
          </h3>
          <p className="text-gray-500">
            Mulai menerjemahkan dan simpan untuk melihat riwayat di sini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Riwayat Terjemahan ({translations.length})
      </h2>
      
      <div className="space-y-3">
        {translations.map((translation) => (
          <Card 
            key={translation.id} 
            className="history-item cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setSelectedTranslation(translation);
              onLoadTranslation(translation);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(translation.created_at)}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {translation.direction === 'indonesia-japanese' ? 'ID → JP' : 'JP → ID'}
                  </span>
                  {translation.jlpt_level && (
                    <span className={`px-2 py-1 rounded-full text-xs jlpt-badge jlpt-${translation.jlpt_level.toLowerCase()}`}>
                      JLPT {translation.jlpt_level}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio(translation.output_text, translation.direction);
                  }}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {translation.direction === 'indonesia-japanese' ? 'Indonesia:' : 'Jepang:'}
                  </p>
                  <p className={`text-sm ${translation.direction === 'japanese-indonesia' ? 'japanese-text' : ''}`}>
                    {translation.input_text}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 md:col-span-1">
                  <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {translation.direction === 'indonesia-japanese' ? 'Jepang:' : 'Indonesia:'}
                    </p>
                    <p className={`text-sm ${translation.direction === 'indonesia-japanese' ? 'japanese-text' : ''}`}>
                      {translation.output_text}
                    </p>
                    {translation.romaji && (
                      <p className="text-xs text-blue-600 mt-1 romaji-text">
                        {translation.romaji}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TranslationHistory;

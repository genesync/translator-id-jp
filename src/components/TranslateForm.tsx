
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftRight, Volume2, RotateCcw, Save, Loader2, Keyboard, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JapaneseKeyboard from "./JapaneseKeyboard";

interface TranslateFormProps {
  onTranslate: (text: string, direction: 'indonesia-japanese' | 'japanese-indonesia') => Promise<any>;
  onSaveHistory: (translation: any) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

const TranslateForm = ({ onTranslate, onSaveHistory, loading, disabled = false }: TranslateFormProps) => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [romaji, setRomaji] = useState("");
  const [jlptLevel, setJlptLevel] = useState("");
  const [direction, setDirection] = useState<'indonesia-japanese' | 'japanese-indonesia'>('indonesia-japanese');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Silakan masukkan teks yang ingin diterjemahkan",
        variant: "destructive"
      });
      return;
    }

    if (disabled) {
      toast({
        title: "Akses Terbatas",
        description: "Silakan masuk dengan Google untuk menggunakan fitur terjemahan",
        variant: "destructive"
      });
      return;
    }

    // Start progress animation
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const result = await onTranslate(inputText, direction);
      if (result) {
        setOutputText(result.translation);
        setRomaji(result.romaji || "");
        setJlptLevel(result.jlptLevel || "");
        setProgress(100);
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menerjemahkan teks. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSwapDirection = () => {
    if (loading) return;
    
    setDirection(prev => 
      prev === 'indonesia-japanese' ? 'japanese-indonesia' : 'indonesia-japanese'
    );
    setInputText(outputText);
    setOutputText(inputText);
    setRomaji("");
    setJlptLevel("");
    setShowKeyboard(false);
  };

  const handleReset = () => {
    if (loading) return;
    
    setInputText("");
    setOutputText("");
    setRomaji("");
    setJlptLevel("");
    setShowKeyboard(false);
  };

  const handlePlayAudio = () => {
    if (!outputText || loading) return;
    
    try {
      if ('speechSynthesis' in window) {
        // Stop any currently playing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(outputText);
        
        if (direction === 'indonesia-japanese') {
          // Playing Japanese audio
          utterance.lang = 'ja-JP';
          utterance.rate = 0.7;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          // Try to find Japanese voice
          const voices = speechSynthesis.getVoices();
          const japaneseVoice = voices.find(voice => 
            voice.lang.includes('ja') || voice.lang.includes('JP')
          );
          if (japaneseVoice) {
            utterance.voice = japaneseVoice;
          }
        } else {
          // Playing Indonesian audio
          utterance.lang = 'id-ID';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          // Try to find Indonesian voice
          const voices = speechSynthesis.getVoices();
          const indonesianVoice = voices.find(voice => 
            voice.lang.includes('id') || voice.lang.includes('ID')
          );
          if (indonesianVoice) {
            utterance.voice = indonesianVoice;
          }
        }
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          toast({
            title: "Error Audio",
            description: "Gagal memutar audio. Silakan coba lagi.",
            variant: "destructive"
          });
        };
        
        utterance.onstart = () => {
          toast({
            title: "Audio Diputar",
            description: `Memutar audio dalam bahasa ${direction === 'indonesia-japanese' ? 'Jepang' : 'Indonesia'}`
          });
        };
        
        // Wait for voices to load if not already loaded
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            speechSynthesis.speak(utterance);
          });
        } else {
          speechSynthesis.speak(utterance);
        }
        
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

  const handleSave = async () => {
    if (!inputText || !outputText || loading) return;

    try {
      const translationData = {
        input_text: inputText,
        output_text: outputText,
        romaji: romaji,
        jlpt_level: jlptLevel,
        direction: direction,
        created_at: new Date().toISOString()
      };
      
      await onSaveHistory(translationData);
      toast({
        title: "Berhasil",
        description: "Terjemahan berhasil disimpan ke riwayat"
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan ke riwayat",
        variant: "destructive"
      });
    }
  };

  const handleKeyboardInput = (key: string) => {
    if (loading) return;
    setInputText(prev => prev + key);
  };

  const handleCopyResult = async () => {
    if (!outputText || loading) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Berhasil",
        description: "Hasil terjemahan berhasil disalin"
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Error",
        description: "Gagal menyalin teks",
        variant: "destructive"
      });
    }
  };

  const isButtonDisabled = loading || disabled;

  return (
    <>
      <div className="w-full space-y-6">
        {/* Direction Selector */}
        <Card className={`glass-card ${disabled ? 'opacity-60' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                <span className="font-medium">
                  {direction === 'indonesia-japanese' ? 'Indonesia' : 'Jepang'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapDirection}
                className="p-2"
                disabled={isButtonDisabled}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-4 bg-white border border-red-500 rounded-sm flex items-center justify-center">
                  <div className="w-3 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="font-medium">
                  {direction === 'indonesia-japanese' ? 'Jepang' : 'Indonesia'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Interface - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className={`glass-card ${disabled ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    {direction === 'indonesia-japanese' ? 'Bahasa Indonesia' : 'Bahasa Jepang'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {inputText.length}/500
                    </span>
                    {direction === 'japanese-indonesia' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKeyboard(!showKeyboard)}
                        disabled={isButtonDisabled}
                      >
                        <Keyboard className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                  placeholder={direction === 'indonesia-japanese' 
                    ? "Masukkan teks bahasa Indonesia..." 
                    : "日本語のテキストを入力してください..."}
                  className={`w-full min-h-[120px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                    placeholder-gray-500 dark:placeholder-gray-400 resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${direction === 'japanese-indonesia' ? 'japanese-text' : ''}
                    ${isButtonDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  rows={5}
                  disabled={isButtonDisabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className={`glass-card ${disabled ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    {direction === 'indonesia-japanese' ? 'Bahasa Jepang' : 'Bahasa Indonesia'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {jlptLevel && (
                      <span className={`jlpt-badge jlpt-${jlptLevel.toLowerCase()}`}>
                        JLPT {jlptLevel}
                      </span>
                    )}
                    {outputText && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyResult}
                        disabled={isButtonDisabled}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {loading && progress > 0 && (
                  <div className="mb-4">
                    <Progress value={progress} className="w-full h-2" />
                    <p className="text-sm text-gray-500 mt-1 text-center">
                      Menerjemahkan... {Math.round(progress)}%
                    </p>
                  </div>
                )}
                
                <div
                  className={`w-full min-h-[120px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                    bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                    cursor-text select-text overflow-auto
                    ${direction === 'indonesia-japanese' ? 'japanese-text' : ''}
                    ${!outputText ? 'flex items-center justify-center text-gray-500 dark:text-gray-400' : ''}`}
                  onClick={() => outputText && navigator.clipboard.writeText(outputText)}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Sedang menerjemahkan...</span>
                    </div>
                  ) : (
                    outputText || "Hasil terjemahan akan muncul di sini..."
                  )}
                </div>
                {romaji && !loading && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Romaji:</p>
                    <p className="romaji-text text-blue-800 dark:text-blue-300 select-text cursor-text">
                      {romaji}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className={`glass-card ${disabled ? 'opacity-60' : ''}`}>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handleTranslate}
                disabled={loading || !inputText.trim() || disabled}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-2 rounded-lg font-medium"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menerjemahkan...</>
                ) : (
                  "Terjemahkan"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-6 py-2 rounded-lg"
                disabled={isButtonDisabled}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={handlePlayAudio}
                disabled={!outputText || isButtonDisabled}
                className="px-6 py-2 rounded-lg"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Play Audio
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={!outputText || isButtonDisabled}
                className="px-6 py-2 rounded-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Riwayat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Japanese Keyboard */}
      {showKeyboard && !loading && (
        <JapaneseKeyboard
          onInput={handleKeyboardInput}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </>
  );
};

export default TranslateForm;

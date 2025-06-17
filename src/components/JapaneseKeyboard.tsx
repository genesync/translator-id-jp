
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface JapaneseKeyboardProps {
  onInput: (text: string) => void;
  onClose: () => void;
}

const JapaneseKeyboard = ({ onInput, onClose }: JapaneseKeyboardProps) => {
  const [mode, setMode] = useState<'hiragana' | 'katakana' | 'numbers'>('hiragana');

  const hiraganaKeys = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', '', 'ゆ', '', 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', '', 'を', '', 'ん'],
    ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
    ['だ', 'ぢ', 'づ', 'で', 'ど'],
    ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
    ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
    ['ゃ', 'ゅ', 'ょ', 'っ', 'ー']
  ];

  const katakanaKeys = [
    ['ア', 'イ', 'ウ', 'エ', 'オ'],
    ['カ', 'キ', 'ク', 'ケ', 'コ'],
    ['サ', 'シ', 'ス', 'セ', 'ソ'],
    ['タ', 'チ', 'ツ', 'テ', 'ト'],
    ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    ['マ', 'ミ', 'ム', 'メ', 'モ'],
    ['ヤ', '', 'ユ', '', 'ヨ'],
    ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    ['ワ', '', 'ヲ', '', 'ン'],
    ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
    ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
    ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'],
    ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
    ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
    ['ャ', 'ュ', 'ョ', 'ッ', 'ー']
  ];

  const numberKeys = [
    ['１', '２', '３', '４', '５'],
    ['６', '７', '８', '９', '０'],
    ['。', '、', '？', '！', '〜'],
    ['（', '）', '「', '」', '・']
  ];

  const getCurrentKeys = () => {
    switch (mode) {
      case 'hiragana':
        return hiraganaKeys;
      case 'katakana':
        return katakanaKeys;
      case 'numbers':
        return numberKeys;
      default:
        return hiraganaKeys;
    }
  };

  const handleKeyPress = (key: string) => {
    if (key.trim()) {
      onInput(key);
    }
  };

  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <Button
              variant={mode === 'hiragana' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('hiragana')}
            >
              ひらがな
            </Button>
            <Button
              variant={mode === 'katakana' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('katakana')}
            >
              カタカナ
            </Button>
            <Button
              variant={mode === 'numbers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('numbers')}
            >
              記号・数字
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid gap-1 max-h-60 overflow-y-auto">
          {getCurrentKeys().map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key, keyIndex) => (
                <Button
                  key={keyIndex}
                  variant="outline"
                  size="sm"
                  className="min-w-[40px] h-8 p-0 text-sm japanese-text"
                  onClick={() => handleKeyPress(key)}
                  disabled={!key.trim()}
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInput(' ')}
            className="px-8"
          >
            スペース
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInput('\n')}
          >
            改行
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JapaneseKeyboard;

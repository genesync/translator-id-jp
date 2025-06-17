// Translation service for handling OpenAI API calls
export interface TranslationResult {
  translation: string;
  romaji?: string;
  jlptLevel?: string;
}

export class TranslationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(
    text: string, 
    direction: 'indonesia-japanese' | 'japanese-indonesia'
  ): Promise<TranslationResult> {
    const prompt = this.buildPrompt(text, direction);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'Anda adalah ahli penerjemah bahasa Indonesia dan Jepang yang sangat berpengalaman, khususnya untuk membantu calon pekerja migran Indonesia. Berikan terjemahan yang akurat dan praktis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('API key Anda telah mencapai batas quota. Silakan periksa billing OpenAI Anda atau coba lagi nanti.');
        } else if (response.status === 401) {
          throw new Error('API key tidak valid. Silakan periksa kembali API key OpenAI Anda.');
        } else if (response.status === 400) {
          throw new Error('Request tidak valid. Silakan coba dengan teks yang berbeda.');
        } else {
          throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('Tidak ada respons dari API');
      }

      return this.parseResponse(result, direction);
    } catch (error) {
      console.error('Translation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Maaf, terjadi kesalahan saat menerjemahkan. Silakan coba lagi.');
    }
  }

  private buildPrompt(text: string, direction: 'indonesia-japanese' | 'japanese-indonesia'): string {
    if (direction === 'indonesia-japanese') {
      return `
Terjemahkan kalimat berikut dari Bahasa Indonesia ke Bahasa Jepang. Berikan respons dalam format JSON yang tepat:

Input: "${text}"

Berikan respons dalam format JSON berikut:
{
  "translation": "tulisan Jepang (gunakan Kanji/Hiragana yang tepat)",
  "romaji": "cara baca dalam huruf Latin",
  "jlptLevel": "N5/N4/N3"
}

Pastikan terjemahan sesuai untuk konteks percakapan sehari-hari atau situasi kerja. Tentukan level JLPT berdasarkan kompleksitas kosakata dan tata bahasa yang digunakan.
      `;
    } else {
      return `
Terjemahkan kalimat berikut dari Bahasa Jepang ke Bahasa Indonesia. Berikan respons dalam format JSON yang tepat:

Input: "${text}"

Berikan respons dalam format JSON berikut:
{
  "translation": "terjemahan dalam Bahasa Indonesia",
  "romaji": "cara baca input Jepang dalam huruf Latin (jika input mengandung Kanji/Hiragana)",
  "jlptLevel": "N5/N4/N3"
}

Berikan terjemahan yang natural dan mudah dipahami. Tentukan level JLPT berdasarkan kompleksitas kosakata dan tata bahasa input Jepang.
      `;
    }
  }

  private parseResponse(response: string, direction: string): TranslationResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          translation: parsed.translation || '',
          romaji: parsed.romaji || '',
          jlptLevel: parsed.jlptLevel || ''
        };
      }
      
      // Fallback parsing if JSON format is not perfect
      const lines = response.split('\n').filter(line => line.trim());
      let translation = '';
      let romaji = '';
      let jlptLevel = '';
      
      for (const line of lines) {
        if (line.includes('translation') || line.includes('terjemahan')) {
          translation = line.split(':')[1]?.replace(/['"]/g, '').trim() || '';
        } else if (line.includes('romaji')) {
          romaji = line.split(':')[1]?.replace(/['"]/g, '').trim() || '';
        } else if (line.includes('jlpt') || line.includes('JLPT')) {
          jlptLevel = line.split(':')[1]?.replace(/['"]/g, '').trim() || '';
        }
      }
      
      return {
        translation: translation || response.trim(),
        romaji,
        jlptLevel
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        translation: response.trim(),
        romaji: '',
        jlptLevel: ''
      };
    }
  }
}

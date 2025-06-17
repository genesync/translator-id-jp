import { TranslationApiResponse, ApiCredentials, ApiUsage } from "@/types/api";
import { API_PROVIDERS } from "./apiProviders";

export class MultiApiService {
  private credentials: ApiCredentials = {};
  private usage: ApiUsage = {};
  private activeApis: {[key: string]: boolean} = {};

  constructor() {
    this.loadCredentials();
    this.loadUsage();
    this.loadActiveApis();
  }

  private loadCredentials() {
    const saved = localStorage.getItem('api_credentials');
    if (saved) {
      this.credentials = JSON.parse(saved);
    }
  }

  private saveCredentials() {
    localStorage.setItem('api_credentials', JSON.stringify(this.credentials));
  }

  private loadUsage() {
    const saved = localStorage.getItem('api_usage');
    if (saved) {
      this.usage = JSON.parse(saved);
    }
  }

  private saveUsage() {
    localStorage.setItem('api_usage', JSON.stringify(this.usage));
  }

  private loadActiveApis() {
    const saved = localStorage.getItem('api_active_status');
    if (saved) {
      this.activeApis = JSON.parse(saved);
    } else {
      // Set default active status from API_PROVIDERS
      API_PROVIDERS.forEach(provider => {
        this.activeApis[provider.id] = provider.isActive;
      });
      this.saveActiveApis();
    }
  }

  private saveActiveApis() {
    localStorage.setItem('api_active_status', JSON.stringify(this.activeApis));
  }

  setApiKey(apiId: string, key: string) {
    this.credentials[apiId] = key;
    this.saveCredentials();
    console.log(`API key saved for ${apiId}`);
  }

  getApiKey(apiId: string): string | null {
    return this.credentials[apiId] || null;
  }

  setApiActive(apiId: string, isActive: boolean) {
    this.activeApis[apiId] = isActive;
    this.saveActiveApis();
    console.log(`API ${apiId} set to ${isActive ? 'active' : 'inactive'}`);
  }

  isApiActive(apiId: string): boolean {
    return this.activeApis[apiId] !== undefined ? this.activeApis[apiId] : false;
  }

  private updateUsage(apiId: string) {
    if (!this.usage[apiId]) {
      this.usage[apiId] = {
        used: 0,
        limit: this.getApiLimit(apiId),
        lastReset: new Date().toISOString()
      };
    }
    this.usage[apiId].used += 1;
    this.saveUsage();
    console.log(`Usage updated for ${apiId}: ${this.usage[apiId].used}/${this.usage[apiId].limit}`);
  }

  private getApiLimit(apiId: string): number {
    const provider = API_PROVIDERS.find(p => p.id === apiId);
    return provider?.freeLimit || 1000; // Default limit
  }

  private isApiAvailable(apiId: string): boolean {
    const provider = API_PROVIDERS.find(p => p.id === apiId);
    if (!provider) {
      console.log(`Provider ${apiId} not found`);
      return false;
    }

    // Check if API is active
    if (!this.isApiActive(apiId)) {
      console.log(`API ${apiId} is not active`);
      return false;
    }

    // For APIs that require keys, check if key is present
    if (provider.requiresKey && !this.getApiKey(apiId)) {
      console.log(`API ${apiId} requires key but none provided`);
      return false;
    }

    const usage = this.usage[apiId];
    if (usage && usage.used >= usage.limit) {
      console.log(`API ${apiId} has reached usage limit`);
      return false;
    }

    console.log(`API ${apiId} is available`);
    return true;
  }

  getAvailableApis(): string[] {
    const available = API_PROVIDERS
      .filter(provider => this.isApiAvailable(provider.id))
      .sort((a, b) => a.priority - b.priority)
      .map(provider => provider.id);
    
    console.log('Available APIs:', available);
    return available;
  }

  getUsageInfo(apiId: string) {
    return this.usage[apiId] || {
      used: 0,
      limit: this.getApiLimit(apiId),
      lastReset: new Date().toISOString()
    };
  }

  async translate(
    text: string, 
    direction: 'indonesia-japanese' | 'japanese-indonesia'
  ): Promise<TranslationApiResponse> {
    console.log(`Starting translation: "${text}" (${direction})`);
    
    const availableApis = this.getAvailableApis();
    console.log('Available APIs for translation:', availableApis);
    
    if (availableApis.length === 0) {
      console.error('No APIs available for translation');
      throw new Error('Tidak ada API yang tersedia. Silakan periksa konfigurasi API atau quota Anda.');
    }

    for (const apiId of availableApis) {
      try {
        console.log(`Trying API: ${apiId}`);
        const result = await this.translateWithApi(apiId, text, direction);
        this.updateUsage(apiId);
        console.log(`Translation successful with ${apiId}`);
        return { ...result, provider: apiId };
      } catch (error) {
        console.warn(`API ${apiId} failed:`, error);
        
        // Mark API as temporarily unavailable if quota exceeded
        if (error instanceof Error && (error.message.includes('quota') || error.message.includes('429'))) {
          console.log(`Marking ${apiId} as quota exceeded`);
          this.usage[apiId] = {
            ...this.usage[apiId],
            used: this.getApiLimit(apiId)
          };
          this.saveUsage();
        }
        
        continue; // Try next API
      }
    }

    console.error('All APIs failed');
    throw new Error('Semua API gagal. Silakan coba lagi nanti.');
  }

  private async translateWithApi(
    apiId: string, 
    text: string, 
    direction: 'indonesia-japanese' | 'japanese-indonesia'
  ): Promise<Omit<TranslationApiResponse, 'provider'>> {
    switch (apiId) {
      case 'openai':
        return this.translateOpenAI(text, direction);
      case 'google':
        return this.translateGoogle(text, direction);
      case 'libretranslate':
        return this.translateLibreTranslate(text, direction);
      case 'mymemory':
        return this.translateMyMemory(text, direction);
      default:
        throw new Error(`Unknown API: ${apiId}`);
    }
  }

  private async translateOpenAI(text: string, direction: 'indonesia-japanese' | 'japanese-indonesia') {
    const apiKey = this.getApiKey('openai');
    if (!apiKey) throw new Error('OpenAI API key required');

    const prompt = this.buildOpenAIPrompt(text, direction);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah ahli penerjemah bahasa Indonesia dan Jepang.'
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
      if (response.status === 429) {
        throw new Error('quota');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content;
    
    return this.parseOpenAIResponse(result, direction);
  }

  private async translateGoogle(text: string, direction: 'indonesia-japanese' | 'japanese-indonesia') {
    const apiKey = this.getApiKey('google');
    if (!apiKey) throw new Error('Google Translate API key required');

    const sourceLang = direction === 'indonesia-japanese' ? 'id' : 'ja';
    const targetLang = direction === 'indonesia-japanese' ? 'ja' : 'id';

    console.log(`Google Translate: ${sourceLang} -> ${targetLang}, API Key: ${apiKey.substring(0, 10)}...`);

    try {
      // Use the correct Google Translate API v2 endpoint
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      console.log('Google Translate response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Translate error response:', errorText);
        
        if (response.status === 400) {
          throw new Error(`Google Translate API error: Invalid request - ${errorText}`);
        } else if (response.status === 403) {
          throw new Error('Google Translate API error: Forbidden - Check your API key and billing');
        } else if (response.status === 429) {
          throw new Error('quota');
        } else {
          throw new Error(`Google Translate API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Google Translate response data:', data);
      
      if (!data.data || !data.data.translations || !data.data.translations[0]) {
        throw new Error('Invalid response format from Google Translate API');
      }

      return {
        translation: data.data.translations[0].translatedText,
        romaji: '',
        jlptLevel: ''
      };
    } catch (error) {
      console.error('Google Translate API error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google Translate API request failed');
    }
  }

  private async translateLibreTranslate(text: string, direction: 'indonesia-japanese' | 'japanese-indonesia') {
    // LibreTranslate language codes
    const sourceLang = direction === 'indonesia-japanese' ? 'id' : 'ja';
    const targetLang = direction === 'indonesia-japanese' ? 'ja' : 'id';
    const apiKey = this.getApiKey('libretranslate');

    console.log(`LibreTranslate: ${sourceLang} -> ${targetLang}, API Key: ${apiKey ? 'Present' : 'None'}`);

    try {
      // First, check if the language pair is supported
      const languagesResponse = await fetch('https://libretranslate.de/languages');
      const languages = await languagesResponse.json();
      console.log('LibreTranslate supported languages:', languages);

      const sourceSupported = languages.some((lang: any) => lang.code === sourceLang);
      const targetSupported = languages.some((lang: any) => lang.code === targetLang);

      if (!sourceSupported || !targetSupported) {
        throw new Error(`LibreTranslate: Language pair ${sourceLang}->${targetLang} not supported`);
      }

      // Build request body
      const requestBody: any = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      };

      // Add API key if available for higher rate limits
      if (apiKey) {
        requestBody.api_key = apiKey;
      }

      console.log('LibreTranslate request body:', requestBody);

      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('LibreTranslate response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LibreTranslate error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            throw new Error(`LibreTranslate API error: ${errorData.error}`);
          }
        } catch (parseError) {
          // If JSON parsing fails, use the raw error text
        }
        
        if (response.status === 429) throw new Error('quota');
        if (response.status === 403) {
          throw new Error('LibreTranslate API error: Invalid API key or quota exceeded');
        }
        throw new Error(`LibreTranslate error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('LibreTranslate response data:', data);
      
      if (!data.translatedText) {
        throw new Error('Invalid response format from LibreTranslate API');
      }

      return {
        translation: data.translatedText,
        romaji: '',
        jlptLevel: ''
      };
    } catch (error) {
      console.error('LibreTranslate API error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('LibreTranslate API request failed');
    }
  }

  private async translateMyMemory(text: string, direction: 'indonesia-japanese' | 'japanese-indonesia') {
    const sourceLang = direction === 'indonesia-japanese' ? 'id' : 'ja';
    const targetLang = direction === 'indonesia-japanese' ? 'ja' : 'id';
    const apiKey = this.getApiKey('mymemory');

    console.log(`MyMemory: ${sourceLang} -> ${targetLang}`);

    // Build URL with optional API key
    let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) throw new Error('quota');
      throw new Error(`MyMemory error: ${response.status}`);
    }

    const data = await response.json();
    return {
      translation: data.responseData.translatedText,
      romaji: '',
      jlptLevel: ''
    };
  }

  private buildOpenAIPrompt(text: string, direction: 'indonesia-japanese' | 'japanese-indonesia'): string {
    if (direction === 'indonesia-japanese') {
      return `Terjemahkan dari Indonesia ke Jepang dengan format JSON:
Input: "${text}"
Format: {"translation": "terjemahan", "romaji": "romaji", "jlptLevel": "N5/N4/N3"}`;
    } else {
      return `Terjemahkan dari Jepang ke Indonesia dengan format JSON:
Input: "${text}"
Format: {"translation": "terjemahan", "romaji": "romaji input", "jlptLevel": "N5/N4/N3"}`;
    }
  }

  private parseOpenAIResponse(response: string, direction: string) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          translation: parsed.translation || '',
          romaji: parsed.romaji || '',
          jlptLevel: parsed.jlptLevel || ''
        };
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
    }
    
    return {
      translation: response.trim(),
      romaji: '',
      jlptLevel: ''
    };
  }
}

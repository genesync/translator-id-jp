
import { ApiProvider } from "@/types/api";

export const API_PROVIDERS: ApiProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Terjemahan berkualitas tinggi dengan AI dan informasi JLPT',
    requiresKey: true,
    isActive: true,
    priority: 1
  },
  {
    id: 'google',
    name: 'Google Translate',
    description: 'Terjemahan cepat dan akurat dari Google',
    requiresKey: true,
    isActive: true, // Set default aktif
    priority: 2
  },
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    description: 'Terjemahan open source dan gratis (API key opsional untuk rate limit lebih tinggi)',
    requiresKey: false,
    freeLimit: 100,
    isActive: true, // Set default aktif
    priority: 3
  },
  {
    id: 'mymemory',
    name: 'MyMemory',
    description: 'Terjemahan gratis dengan database terbesar (API key opsional untuk rate limit lebih tinggi)',
    requiresKey: false,
    freeLimit: 1000,
    isActive: true, // Set default aktif
    priority: 4
  }
];

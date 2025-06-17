
export interface ApiProvider {
  id: string;
  name: string;
  description: string;
  requiresKey: boolean;
  freeLimit?: number;
  isActive: boolean;
  priority: number;
}

export interface ApiCredentials {
  [key: string]: string;
}

export interface ApiUsage {
  [apiId: string]: {
    used: number;
    limit: number;
    lastReset: string;
  };
}

export interface TranslationApiResponse {
  translation: string;
  romaji?: string;
  jlptLevel?: string;
  provider: string;
}

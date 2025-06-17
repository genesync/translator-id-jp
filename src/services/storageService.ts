
export class StorageService {
  private static readonly API_KEY_KEY = 'openai_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_KEY);
  }

  static removeApiKey(): void {
    localStorage.removeItem(this.API_KEY_KEY);
  }

  static hasApiKey(): boolean {
    return !!this.getApiKey();
  }
}

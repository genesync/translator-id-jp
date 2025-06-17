
// Mock Supabase service for demonstration
// In production, this should be connected to actual Supabase
interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Translation {
  id: string;
  user_id: string;
  input_text: string;
  output_text: string;
  romaji?: string;
  jlpt_level?: string;
  direction: 'indonesia-japanese' | 'japanese-indonesia';
  created_at: string;
}

class MockSupabaseService {
  private user: User | null = null;
  private translations: Translation[] = [];

  async signInWithGoogle(): Promise<{ user: User }> {
    // Mock Google sign in
    return new Promise((resolve) => {
      setTimeout(() => {
        this.user = {
          id: 'mock-user-id',
          email: 'user@example.com',
          user_metadata: {
            full_name: 'Demo User',
            avatar_url: 'https://via.placeholder.com/32'
          }
        };
        resolve({ user: this.user });
      }, 1000);
    });
  }

  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.user = null;
        resolve();
      }, 500);
    });
  }

  async getCurrentUser(): Promise<User | null> {
    return this.user;
  }

  async saveTranslation(translation: Omit<Translation, 'id' | 'user_id'>): Promise<Translation> {
    const newTranslation: Translation = {
      ...translation,
      id: Date.now().toString(),
      user_id: this.user?.id || 'mock-user-id'
    };
    
    this.translations.unshift(newTranslation);
    return newTranslation;
  }

  async getTranslations(): Promise<Translation[]> {
    return this.translations.filter(t => t.user_id === this.user?.id);
  }
}

export const supabaseService = new MockSupabaseService();

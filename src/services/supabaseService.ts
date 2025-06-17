import { supabase } from './../lib/supabaseClient'

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

class RealSupabaseService {
  async signInWithGoogle(): Promise<{ user: User }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;
    // Note: redirect will happen. Use `getCurrentUser` after login.
    return { user: null as any } // sementara karena Google login redirect-based
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null

    const { id, email, user_metadata } = data.user
    return { id, email, user_metadata } as User
  }

  async saveTranslation(translation: Omit<Translation, 'id' | 'user_id'>): Promise<Translation> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('translations')
      .insert([
        {
          ...translation,
          user_id: user.id,
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data as Translation
  }

  async getTranslations(): Promise<Translation[]> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Translation[]
  }
}

export const supabaseService = new RealSupabaseService()

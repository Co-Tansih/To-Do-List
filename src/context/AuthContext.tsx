import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

interface User {
  id: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ensureProfileExists = async (userId: string, email: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if profile doesn't exist
        console.error('Error checking profile:', fetchError);
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
    }
  };

  React.useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
          };
          
          // Ensure profile exists before setting user
          await ensureProfileExists(userData.id, userData.email);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
          };
          
          // Ensure profile exists before setting user
          await ensureProfileExists(userData.id, userData.email);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign up timed out')), 10000); // 10 second timeout
      });

      // Race between signup and timeout
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        }
      });

      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;
      
      if (error) {
        setError(error.message);
        return;
      }

      // Check if user was created successfully
      if (data.user && data.session) {
        // User is immediately signed in (email confirmation disabled in Supabase settings)
        await ensureProfileExists(data.user.id, data.user.email!);
        setUser({
          id: data.user.id,
          email: data.user.email!,
        });
        navigate('/todos');
      } else if (data.user && !data.session) {
        // Email confirmation is required - user needs to check their email
        setError('Account created successfully! Please check your email (including spam folder) and click the confirmation link before signing in.');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Sign up timed out') {
        setError('Sign up is taking too long. Please try again or check your internet connection.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred during sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in timed out')), 10000); // 10 second timeout
      });

      // Race between login and timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      if (error) {
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
          setError('Please check your email (including spam folder) and click the confirmation link to verify your account before signing in.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Ensure profile exists after successful login
      if (data.user && data.session) {
        await ensureProfileExists(data.user.id, data.user.email!);
        setUser({
          id: data.user.id,
          email: data.user.email!,
        });
        navigate('/todos');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Sign in timed out') {
        setError('Sign in is taking too long. Please try again or check your internet connection.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
      }
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if there's an error
      setUser(null);
      navigate('/');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
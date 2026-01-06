import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/user';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchingRef = useRef(false);

    // Helper to create a user from auth session data (fallback)
    const createUserFromSession = (authUser: any): User => ({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role: (authUser.user_metadata?.role as UserRole) || 'content_writer',
        avatar_url: authUser.user_metadata?.avatar_url || undefined,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at || authUser.created_at,
    });

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    // IMMEDIATELY set a fallback user from session to prevent infinite loading
                    const fallbackUser = createUserFromSession(session.user);
                    setUser(fallbackUser);
                    setIsLoading(false);

                    // Then try to fetch the full profile (non-blocking)
                    fetchUserProfile(session.user.id);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
                // Set fallback user immediately
                const fallbackUser = createUserFromSession(session.user);
                setUser(fallbackUser);
                setIsLoading(false);

                // Then fetch full profile
                if (!fetchingRef.current) {
                    fetchUserProfile(session.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (userId: string) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        console.log('Fetching user profile for:', userId);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            console.log('Profile fetch result:', { data, error });

            // Only update if we got valid data - keeps the fallback user otherwise
            if (data && !error) {
                const userData = data as any;
                setUser({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role as UserRole,
                    avatar_url: userData.avatar_url || undefined,
                    created_at: userData.created_at,
                    updated_at: userData.updated_at,
                });
            } else if (error) {
                console.warn('Could not fetch user profile, using fallback:', error.message);
            }
        } catch (err) {
            console.warn('Error fetching user profile, using fallback:', err);
        } finally {
            fetchingRef.current = false;
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setIsLoading(false);
            throw error;
        }
        // User profile will be fetched by onAuthStateChange
    };

    const logout = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setIsLoading(false);
            throw error;
        }
        setUser(null);
        setIsLoading(false);
    };

    const signUp = async (
        email: string,
        password: string,
        name: string,
        role: UserRole = 'content_writer'
    ) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                },
            },
        });
        if (error) {
            setIsLoading(false);
            throw error;
        }
        // User profile will be created by database trigger and fetched by onAuthStateChange
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                signUp,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

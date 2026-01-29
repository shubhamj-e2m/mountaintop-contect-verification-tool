import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/user';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isPasswordRecovery: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
    resetPasswordForEmail: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    clearPasswordRecovery: () => void;
    refreshUserProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
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

        // Listen for auth changes including token refresh
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === 'PASSWORD_RECOVERY' && session?.user) {
                const fallbackUser = createUserFromSession(session.user);
                setUser(fallbackUser);
                setIsPasswordRecovery(true);
                setIsLoading(false);
            } else if (event === 'SIGNED_IN' && session?.user) {
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
                setIsPasswordRecovery(false);
                setIsLoading(false);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                // Token was refreshed in background - update session silently
                // No need to refetch user profile, just ensure session is valid
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

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

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

    const resetPasswordForEmail = async (email: string) => {
        // Redirect URL must be allowed in Supabase Dashboard > Auth > URL Configuration.
        const redirectTo = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setIsPasswordRecovery(false);
    };

    const clearPasswordRecovery = useCallback(() => {
        setIsPasswordRecovery(false);
    }, []);

    const refreshUserProfile = useCallback(() => {
        if (user?.id) fetchUserProfile(user.id);
    }, [user?.id]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                isPasswordRecovery,
                login,
                logout,
                signUp,
                resetPasswordForEmail,
                updatePassword,
                clearPasswordRecovery,
                refreshUserProfile,
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

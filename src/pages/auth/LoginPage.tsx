import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/user';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login, signUp, isLoading } = useAuth();
    const location = useLocation();
    const messageFromState = location.state && typeof location.state === 'object' && 'message' in location.state
        ? String((location.state as { message: string }).message)
        : '';
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('content_writer');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isSignUp) {
                if (!name.trim()) {
                    setError('Please enter your name');
                    return;
                }
                await signUp(email, password, name, selectedRole);
                setSuccess('Account created! Please check your email to verify your account.');
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="bg-bg-secondary p-8 rounded-lg shadow-lg border border-border max-w-md w-full">
                <div className="text-center mb-8">
                    <img
                        src="/mountaintop-logo.png"
                        alt="Mountaintop"
                        className="h-10 mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        Content Verification Tool
                    </h1>
                    <p className="text-text-secondary">
                        {isSignUp ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-text-primary mb-1"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                                placeholder="Enter your name"
                                required={isSignUp}
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {isSignUp && (
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-text-primary mb-1"
                            >
                                Role
                            </label>
                            <select
                                id="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                            >
                                <option value="seo_analyst">SEO Analyst</option>
                                <option value="content_writer">Content Writer</option>
                                <option value="content_verifier">Content Verifier</option>
                            </select>
                            <p className="mt-1 text-xs text-text-tertiary">
                                Admin roles can only be assigned by existing admins.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-error-light text-error text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {(success || messageFromState) && (
                        <div className="p-3 bg-success-light text-success text-sm rounded-md">
                            {success || messageFromState}
                        </div>
                    )}

                    {!isSignUp && (
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-accent hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setSuccess('');
                        }}
                        className="text-sm text-accent hover:underline"
                    >
                        {isSignUp
                            ? 'Already have an account? Sign in'
                            : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

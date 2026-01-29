import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Page where the user enters their email to receive a password reset link.
 * Uses Supabase {@code resetPasswordForEmail}; the link redirects to /reset-password.
 */
const ForgotPasswordPage: React.FC = () => {
    const { resetPasswordForEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await resetPasswordForEmail(email);
            setSuccess(
                'If an account exists for that email, you will receive a link to reset your password. Check your inbox and spam folder.'
            );
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
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
                        Reset your password
                    </h1>
                    <p className="text-text-secondary">
                        Enter your email and we will send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-error-light text-error text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-success-light text-success text-sm rounded-md">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        Send reset link
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-accent hover:underline"
                    >
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

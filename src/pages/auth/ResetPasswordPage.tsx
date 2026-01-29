import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

/**
 * Page shown after the user clicks the password reset link from email.
 * When {@code isPasswordRecovery} is true (Supabase PASSWORD_RECOVERY event),
 * shows a form to set a new password. Otherwise prompts the user to use the email link.
 */
const ResetPasswordPage: React.FC = () => {
    const { isPasswordRecovery, updatePassword, clearPasswordRecovery, isLoading } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            clearPasswordRecovery();
        };
    }, [clearPasswordRecovery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            await updatePassword(password);
            navigate('/login', { state: { message: 'Password updated. Please sign in with your new password.' } });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isPasswordRecovery) {
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
                            Please use the link from your email to reset your password. Links expire after a short time.
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-accent hover:underline"
                        >
                            Request a new reset link
                        </Link>
                    </div>

                    <div className="mt-4 text-center">
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
    }

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
                        Set new password
                    </h1>
                    <p className="text-text-secondary">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            New password
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
                                autoComplete="new-password"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-error-light text-error text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        Update password
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

export default ResetPasswordPage;

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/user';

const LoginPage: React.FC = () => {
    const { login, switchRole } = useAuth();
    const [email, setEmail] = useState('alex@example.com');
    const [password, setPassword] = useState('password');
    const [selectedRole, setSelectedRole] = useState<UserRole>('seo_analyst');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const handleRoleSwitch = (role: UserRole) => {
        setSelectedRole(role);
        switchRole(role);

        // Update email based on role
        switch (role) {
            case 'seo_analyst':
                setEmail('alex@example.com');
                break;
            case 'content_writer':
                setEmail('jordan@example.com');
                break;
            case 'content_verifier':
                setEmail('sam@example.com');
                break;
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="bg-bg-secondary p-8 rounded-lg shadow-lg border border-border max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">ContentVerify</h1>
                    <p className="text-text-secondary">Sign in to your account</p>
                </div>

                {/* Demo Role Selector */}
                <div className="mb-6 p-4 bg-accent-light rounded-md">
                    <p className="text-sm text-text-secondary mb-2">Demo Mode - Select Role:</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRoleSwitch('seo_analyst')}
                            className="flex-1 px-3 py-2 text-sm rounded-md transition-smooth bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        >
                            SEO Analyst
                        </button>
                        <button
                            onClick={() => handleRoleSwitch('content_writer')}
                            className="flex-1 px-3 py-2 text-sm rounded-md transition-smooth bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        >
                            Writer
                        </button>
                        <button
                            onClick={() => handleRoleSwitch('content_verifier')}
                            className="flex-1 px-3 py-2 text-sm rounded-md transition-smooth bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        >
                            Verifier
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-error-light text-error text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-accent text-white py-2 px-4 rounded-md hover:opacity-90 transition-smooth font-medium"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-4 text-xs text-text-tertiary text-center">
                    Demo credentials are pre-filled. Just click Sign In.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

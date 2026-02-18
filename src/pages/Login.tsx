import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.admin);
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#2a2a2a] border border-[#3a3a3a] p-10 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#b8935e] text-[#1a1a1a] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <Anchor className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-[#e5e5e5] uppercase mb-2">Admin Login</h1>
                    <p className="text-[#a0a0a0] font-medium">Cruise Management System</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[#333333] border-l-4 border-[#b8935e] text-[#e5e5e5] text-sm font-medium flex items-center gap-3">
                        <span className="bg-[#b8935e] text-[#1a1a1a] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">!</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0] group-focus-within:text-[#b8935e] transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#333333] border border-[#3a3a3a] text-[#e5e5e5] rounded-xl py-4 pl-12 pr-4 outline-none focus:bg-[#2a2a2a] focus:border-[#b8935e] transition-all text-sm font-medium placeholder:text-[#666666]"
                                placeholder="admin@cruise.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0] group-focus-within:text-[#b8935e] transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#333333] border border-[#3a3a3a] text-[#e5e5e5] rounded-xl py-4 pl-12 pr-4 outline-none focus:bg-[#2a2a2a] focus:border-[#b8935e] transition-all text-sm font-medium placeholder:text-[#666666]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#b8935e] text-[#1a1a1a] font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:bg-[#a07d4d] hover:translate-y-[-2px] hover:shadow-lg active:translate-y-[0] transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                SIGN IN <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
            <p className="mt-10 text-[#a0a0a0] text-xs font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>

            <div className="mt-8 w-full max-w-md text-center">
                <p className="text-[#b8935e] text-xs font-black uppercase tracking-[0.2em] mb-3">Test Credentials</p>
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-6 py-4 space-y-2">
                    <p className="text-[#a0a0a0] text-sm font-medium">
                        <span className="text-[#e5e5e5] font-bold">Email:</span> admin@cruise.com
                    </p>
                    <p className="text-[#a0a0a0] text-sm font-medium">
                        <span className="text-[#e5e5e5] font-bold">Password:</span> admin123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

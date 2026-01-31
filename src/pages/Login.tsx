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
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-2xl shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <Anchor className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">Admin Login</h1>
                    <p className="text-gray-400 font-medium">Cruise Management System</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-gray-50 border-l-4 border-black text-black text-sm font-medium flex items-center gap-3">
                        <span className="bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">!</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-black transition-all text-sm font-medium"
                                placeholder="admin@cruise.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-black transition-all text-sm font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-lg active:translate-y-[0] transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                SIGN IN <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
            <p className="mt-10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
        </div>
    );
};

export default Login;

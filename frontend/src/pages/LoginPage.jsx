import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('demo@pulsespace.io');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then((res) => {
      if (!res.error) navigate('/');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-600/30">
            P
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-xs">Sign in to your PulseSpace Workspace</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-brand-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

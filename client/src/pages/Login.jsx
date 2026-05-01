import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../utils/formatters.js';
import { Layers } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0b] text-foreground p-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/3 rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
            <Layers className="text-white h-8 w-8" />
          </div>
          <h1 className="bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent text-4xl font-extrabold tracking-tight mb-3">
            Team Task Manager
          </h1>
          <p className="text-base text-slate-400 font-medium max-w-sm">
            Sync your workflow, align your team, and ship faster.
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl animate-slide-up">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Log in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-400 border border-red-500/20 text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="bg-black/20 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all text-white"
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="bg-black/20 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all text-white"
              />
            </div>

            <Button
              type="submit"
              className="mt-8 w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3.5 shadow-lg shadow-indigo-500/25 border-0 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign in to workspace'}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium animate-fade-in" style={{ animationDelay: '200ms' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors underline-offset-4">
            Sign up for free
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;

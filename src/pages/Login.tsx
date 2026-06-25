import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Film, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoute } from '../contexts/RouteContext';

export default function LoginPage() {
  const { login, error, clearError, isLoading } = useAuth();
  const { navigateTo } = useRoute();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors on load
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      await login(email, password);
      // Upon successful login, RouteContext is protected and App will redirect to home automatically,
      // but let's force-navigate to home to be safe.
      navigateTo('home');
    } catch (err: any) {
      // Error is already set in AuthContext and rendered below
    }
  };

  const displayError = localError || error;

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#09090B] relative px-4 overflow-hidden" 
      id="login-page-container"
    >
      {/* Visual Ambient Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#A855F7]/10 blur-[150px] pointer-events-none" />

      {/* Login Card */}
      <div 
        className="w-full max-w-md bg-[#0E0E12]/90 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 transition-all duration-300"
        id="login-card"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8" id="login-header">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-xl shadow-[#7C3AED]/20 mb-3">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            ASTRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]"> CINEMA</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1 font-medium">Faça login para continuar assistindo</p>
        </div>

        {/* Error Alert Box */}
        {displayError && (
          <div 
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200"
            id="login-error-alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Erro de login</p>
              <p className="text-xs text-red-400/90 mt-0.5">{displayError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="email-input">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                id="email-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                  if (error) clearError();
                }}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="password-input">
                Senha
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError(null);
                  if (error) clearError();
                }}
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7C3AED]/20 hover:shadow-[#7C3AED]/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="login-submit-btn"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Signup redirection link */}
        <div className="mt-8 pt-6 border-t border-zinc-900 text-center" id="login-footer">
          <p className="text-sm text-zinc-500">
            Novo no Astra Cinema?{' '}
            <button
              onClick={() => {
                clearError();
                navigateTo('register');
              }}
              className="text-white hover:text-[#A855F7] font-semibold transition-colors cursor-pointer"
            >
              Criar conta grátis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

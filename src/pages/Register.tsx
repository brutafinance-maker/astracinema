import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Film, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoute } from '../contexts/RouteContext';

export default function RegisterPage() {
  const { register, error, clearError, isLoading } = useAuth();
  const { navigateTo } = useRoute();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors on load
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Standard Client validations
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      await register(email, password, name);
      // Upon successful signup, the user document is automatically created in Firestore by AuthContext,
      // and we redirect to home page.
      navigateTo('home');
    } catch (err: any) {
      // Error is set in AuthContext and rendered below
    }
  };

  const displayError = localError || error;

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#09090B] relative px-4 overflow-hidden" 
      id="register-page-container"
    >
      {/* Visual Ambient Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#A855F7]/10 blur-[150px] pointer-events-none" />

      {/* Register Card */}
      <div 
        className="w-full max-w-md bg-[#0E0E12]/90 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 transition-all duration-300"
        id="register-card"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-6" id="register-header">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-xl shadow-[#7C3AED]/20 mb-3">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            ASTRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]"> CINEMA</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1 font-medium">Crie sua conta grátis em poucos segundos</p>
        </div>

        {/* Error Alert Box */}
        {displayError && (
          <div 
            className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200"
            id="register-error-alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Erro de cadastro</p>
              <p className="text-xs text-red-400/90 mt-0.5">{displayError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          {/* Complete Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="name-input">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                id="name-input"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (localError) setLocalError(null);
                  if (error) clearError();
                }}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="register-email-input">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                id="register-email-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                  if (error) clearError();
                }}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="register-password-input">
              Senha (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError(null);
                  if (error) clearError();
                }}
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all disabled:opacity-50"
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

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="confirm-password-input">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (localError) setLocalError(null);
                  if (error) clearError();
                }}
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7C3AED]/20 hover:shadow-[#7C3AED]/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="register-submit-btn"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Cadastrar-se</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login redirection link */}
        <div className="mt-6 pt-5 border-t border-zinc-900 text-center" id="register-footer">
          <p className="text-sm text-zinc-500">
            Já tem uma conta?{' '}
            <button
              onClick={() => {
                clearError();
                navigateTo('login');
              }}
              className="text-white hover:text-[#A855F7] font-semibold transition-colors cursor-pointer"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

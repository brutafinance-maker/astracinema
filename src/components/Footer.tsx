import React from 'react';
import { Film, ShieldCheck } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';

export default function Footer() {
  const { navigateTo } = useRoute();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#09090B] border-t border-white/5 py-16 px-6 md:px-12 mt-auto" id="platform-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Logo and Description */}
        <div className="flex flex-col gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigateTo('home')}
            id="footer-logo"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-wider text-white select-none">
              ASTRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]"> CINEMA</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
            Astra Cinema é a primeira versão de uma experiência cinematográfica de streaming premium criada em 2026. Desenhada com foco absoluto em UI/UX de alto desempenho, carregamento instantâneo de metadados e compatibilidade total com múltiplos dispositivos.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#7C3AED] flex items-center justify-center hover:text-white hover:bg-[#7C3AED]/10 transition-all duration-250">
              <span className="text-xs">FB</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#7C3AED] flex items-center justify-center hover:text-white hover:bg-[#7C3AED]/10 transition-all duration-250">
              <span className="text-xs">IG</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#7C3AED] flex items-center justify-center hover:text-white hover:bg-[#7C3AED]/10 transition-all duration-250">
              <span className="text-xs">YT</span>
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Navegação</h4>
          <ul className="space-y-2 text-xs font-medium text-zinc-500">
            <li>
              <button onClick={() => navigateTo('home')} className="hover:text-[#A855F7] transition-colors cursor-pointer">
                Início
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('movies')} className="hover:text-[#A855F7] transition-colors cursor-pointer">
                Filmes
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('series')} className="hover:text-[#A855F7] transition-colors cursor-pointer">
                Séries
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('mylist')} className="hover:text-[#A855F7] transition-colors cursor-pointer">
                Minha Lista
              </button>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Suporte</h4>
          <ul className="space-y-2 text-xs font-medium text-zinc-500">
            <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contato de Imprensa</a></li>
          </ul>
        </div>

        {/* Corporate */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Corporativo</h4>
          <ul className="space-y-2 text-xs font-medium text-zinc-500">
            <li><a href="#" className="hover:text-white transition-colors">Trabalhe Conosco</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Relação com Investidores</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Parcerias Astra</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Configurações de Cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>© {currentYear} Astra Cinema. Todos os direitos reservados. Feito com fins demonstrativos.</span>
        </div>
        
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Políticas</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Segurança</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Acessibilidade</a>
        </div>
      </div>
    </footer>
  );
}

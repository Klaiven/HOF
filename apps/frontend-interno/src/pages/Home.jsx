import React, { useState } from 'react';
import { Phone, Search, FileText, Lock, ChevronRight } from 'lucide-react';

function Home() {
  const [busca, setBusca] = useState("");

  return (
    <div className="min-h-screen bg-bg-light font-sans text-text-dark">
      {/* NAVBAR */}
      <nav className="bg-primary p-4 shadow-md flex justify-between items-center px-[8vw]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-bold">H</div>
          <h1 className="text-white font-bold text-lg tracking-tight uppercase">HOF | Interno</h1>
        </div>
        <a href="/login" className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/10 px-4 py-2 rounded-full transition-all">
          <Lock size={16} /> Área do Editor
        </a>
      </nav>

      <main className="max-w-[1000px] mx-auto py-16 px-6">
        {/* HERO BUSCA */}
        <header className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Central de Informações</h2>
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Pesquisar ramal, setor ou documento..."
              className="w-full pl-16 pr-6 py-5 rounded-2xl border-none shadow-xl focus:ring-4 focus:ring-primary/10 text-lg outline-none bg-white transition-all"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </header>

        {/* CARDS DE ACESSO RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seção Ramais */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Phone size={24}/></div>
              <h3 className="text-xl font-bold">Ramais Úteis</h3>
            </div>
            <div className="space-y-3">
               {/* Exemplo de item de ramal */}
               <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer">
                 <div>
                   <p className="font-bold text-slate-800">TI / SUPORTE</p>
                   <p className="text-xs text-slate-500">Prédio Administrativo</p>
                 </div>
                 <span className="text-xl font-mono font-bold text-primary">2544</span>
               </div>
            </div>
          </section>

          {/* Seção Publicações */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><FileText size={24}/></div>
              <h3 className="text-xl font-bold">Manuais e Protocolos</h3>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                 <p className="font-bold text-slate-800 uppercase text-sm">Protocolo Higienização</p>
                 <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform"/>
               </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
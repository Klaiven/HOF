import React, { useState } from 'react';
import { Menu, X, ArrowLeft, User, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoHOF from '../assets/img/HOF.png';
import { useAuth } from '../hooks/useAuth';

function Layout({ children, title }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menu = [
    { nome: 'Início', rota: '/' },
    { nome: 'Ramais', rota: '/ramais' },
    { nome: 'Manuais', rota: '/manuais' },
    { nome: 'Tutoriais', rota: '/tutoriais' },
    { nome: 'Atualizações', rota: '/atualizacoes' },
  ];

  const getNomeCurto = () => {
    if (!user) return 'Rede interna';

    if (!user.nome) return user.username;

    const partes = user.nome.trim().split(' ');
    const primeiro = partes[0];
    const ultimo = partes[partes.length - 1];

    return partes.length > 1
      ? `${primeiro} ${ultimo}`
      : primeiro;
  };

  const isHome = location.pathname === '/';

  return (
    <div className="flex h-[100dvh] w-full bg-gray-50 overflow-hidden">

      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative z-50 top-0 left-0 h-full w-64 bg-primary text-white
        flex flex-col shrink-0
        transform ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300
      `}>

        {/* HEADER SIDEBAR */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-white/20 shrink-0">
          <div className="flex items-center">
            <img src={logoHOF} alt="HOF" className="w-42" />
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menu.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.rota);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition"
            >
              {item.nome}
            </button>
          ))}
        </nav>

      </aside>

      {/* OVERLAY MOBILE */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* COLUNA DIREITA (Header + Conteúdo) */}
      <div className="flex flex-col flex-1 w-full h-full relative">

        {/* HEADER */}
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-10">

          {/* ESQUERDA DO HEADER (Títulos e Botões) */}
          <div className="flex items-center gap-3">
            {/* BOTÃO MENU */}
            <button className="md:hidden" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>

            {/* BOTÃO VOLTAR (MOBILE) */}
            {!isHome && (
              <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-1 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}

            <h1 className="text-sm md:text-lg font-semibold text-secondary">
              {title || 'Sistema Interno'}
            </h1>
          </div>

          {/* DIREITA DO HEADER (Usuário / Admin) */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* BOTÃO ADMIN */}
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  title="Acessar Painel Administrativo"
                >
                  <LayoutDashboard size={18} className="text-primary" />
                  <span className="text-sm font-semibold hidden sm:block">Admin</span>
                </button>

                {/* DIVISÓRIA (Some no mobile pequeno) */}
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                {/* INFO USUÁRIO */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary border border-slate-200 shadow-sm">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 capitalize hidden md:block">
                    {getNomeCurto()}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-sm uppercase font-black text-gray-500 hidden md:block">
                Rede interna
              </span>
            )}
          </div>

        </header>

        {/* CONTEÚDO DAS PÁGINAS */}
        <main className="p-4 md:p-8 flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default Layout;
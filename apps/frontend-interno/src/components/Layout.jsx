import React, { useState } from 'react';
import { 
  Menu, X, ArrowLeft, User, Home, Phone, BookOpen, ListChecks, Megaphone, Users, LogOut, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoHOF from '../assets/img/HOF.png';
import { useAuth } from '../hooks/useAuth';
import { Notifications } from './Notifications';

function Layout({ children, title }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isHome = location.pathname === '/';

  const menu = [
    { nome: 'Início', rota: '/', icon: Home },
    { nome: 'Ramais', rota: '/ramais', icon: Phone },
    { nome: 'Manuais', rota: '/publicacoes/manuais', icon: BookOpen },
    { nome: 'Portal de Capacitação', rota: '/publicacoes/portal-capacitacao', icon: ListChecks },
    { nome: 'Comunicados', rota: '/publicacoes/comunicados', icon: Megaphone },
    ...(user?.tipo?.toLowerCase() === 'master' ? [{ nome: 'Usuários', rota: '/usuarios', icon: Users }] : []),
  ];

  const getNomeCurto = () => {
    if (!user) return 'Convidado';
    if (!user.nome) return user.username;
    const partes = user.nome.trim().split(' ');
    return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1]}` : partes[0];
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-[60] top-0 left-0 h-full w-72 bg-primary text-white
        flex flex-col shrink-0 transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-8 pb-10 flex items-center justify-center shrink-0">
          <img src={logoHOF} alt="HOF" className="w-48" />
          <button className="md:hidden absolute top-8 right-6" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="px-6 space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
          <p className="px-4 mb-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Menu Principal</p>
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.rota || (item.rota !== '/' && location.pathname.startsWith(item.rota));
            
            return (
              <button
                key={index}
                onClick={() => {
                  navigate(item.rota);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white text-primary shadow-xl shadow-black/10 font-bold' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white font-medium'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-sm tracking-tight">{item.nome}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </button>
            );
          })}
        </nav>

        {user && (
          <div className="p-6 mt-auto">
            <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shadow-lg font-black">
                  {getNomeCurto().charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{getNomeCurto()}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{user?.tipo || 'Usuário'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <LogOut size={14} /> Sair do Sistema
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay Mobile */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main Content Container */}
      <div className="flex flex-col flex-1 w-full h-full relative overflow-hidden">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between shrink-0 z-[40]">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-primary hover:text-white transition-all" 
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {!isHome && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-all group"
                title="Voltar"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>
            
            <h1 className="text-lg font-medium text-secondary tracking-tight">
              {title || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <Notifications />
            
            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-semibold text-slate-800 leading-none mb-1 capitalize">{getNomeCurto()}</p>
                  <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {user.tipo}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <User size={20} />
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                <User size={16} /> LOGIN
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 relative scroll-smooth bg-slate-50/50">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
import React from 'react';
import { 
  Phone, FileText, BookOpen, RefreshCw, Users, Home, LogOut, LayoutDashboard, User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const menu = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'ramais', label: 'Ramais', icon: Phone },
  { id: 'manuais', label: 'Manuais', icon: FileText },
  { id: 'tutoriais', label: 'Tutoriais', icon: BookOpen },
  { id: 'atualizacoes', label: 'Atualizações', icon: RefreshCw },
  { id: 'usuarios', label: 'Usuários', icon: Users }, 
];

function LayoutAdmin({ children, abaAtiva, setAbaAtiva }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 50);
  };

  return (
    // Coloquei h-screen e overflow-hidden para travar a tela e rolar apenas o conteúdo
    <div className="h-screen flex bg-slate-50 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-10">

        {/* LOGO */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center">
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard size={24} />
            <h1 className="font-black text-xl text-slate-800 tracking-tight">HOF Admin</h1>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  abaAtiva === item.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* COLUNA DIREITA (Header + Conteúdo) */}
      <div className="flex-1 flex flex-col h-screen relative">
        
        {/* TOP BAR (Header) */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-end z-10">
          <div className="flex items-center gap-4">
            
            {/* INFORMAÇÕES DO USUÁRIO */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-slate-200">
                <User size={16} />
              </div>
              <span className="text-sm font-bold text-slate-700 capitalize">
                {user?.nome || 'Administrador'}
              </span>
            </div>

            {/* LINHA DIVISÓRIA */}
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {/* BOTÃO DE SAIR */}
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold"
            >
              <LogOut size={16} />
              Sair
            </button>

          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default LayoutAdmin;
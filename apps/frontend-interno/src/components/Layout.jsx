import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft, User, Bell, Clock, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoHOF from '../assets/img/HOF.png';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const userTipo = user?.tipo?.toLowerCase();
  const userSetor = user?.setor?.toUpperCase();
  const isTI = userTipo === 'master' //&& (userSetor === 'TI' || userSetor === 'TI/CPD');

  const fetchNotifications = async () => {
    if (!isTI) return;
    try {
      const res = await api.get('/cesus');
      const pending = (res.data || []).filter(n => n.resolvido === null || n.resolvido === undefined);
      setNotifications(pending);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isTI]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isTI) return null;

  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      await api.put(`/cesus/${id}`, {
        resolvido: action === 'concluido' ? 'S' : 'N',
        usuarioAtendimentoId: user.id,
        horarioAtendimento: new Date().toISOString()
      });
      fetchNotifications();
      setSelectedRequest(null);
      setOpen(false);
    } catch (err) {
      alert('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell size={22} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Notificações</h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
              {notifications.length} Pendentes
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-400 text-xs">Tudo limpo por aqui!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedRequest(n);
                    setOpen(false);
                  }}
                  className="w-full p-4 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="text-primary" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{n.nomeCompleto}</p>
                    <p className="text-xs text-slate-500 truncate">{n.setor}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <Clock size={10} />
                      {n.horarioAbertura ? new Date(n.horarioAbertura).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Sem data'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Detalhes da Solicitação</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                  <p className="text-sm font-semibold text-slate-700">{selectedRequest.nomeCompleto}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ramal/Telefone</label>
                  <p className="text-sm font-semibold text-slate-700">{selectedRequest.ramalTelefone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail</label>
                  <p className="text-sm font-semibold text-slate-700">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Setor</label>
                  <p className="text-sm font-semibold text-slate-700">{selectedRequest.setor}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aberto em</label>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedRequest.horarioAbertura ? new Date(selectedRequest.horarioAbertura).toLocaleString('pt-BR') : 'Sem data'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[60px]">
                  <p className="text-sm text-slate-600">{selectedRequest.descricao || 'Sem descrição.'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 flex gap-3">
              <button
                disabled={loading}
                onClick={() => handleAction(selectedRequest.id, 'negado')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
              >
                <X size={18} /> Negar
              </button>
              <button
                disabled={loading}
                onClick={() => handleAction(selectedRequest.id, 'concluido')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Check size={18} /> Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Layout({ children, title }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menu = [
    { nome: 'Início', rota: '/' },
    { nome: 'Ramais', rota: '/ramais' },
    { nome: 'Manuais', rota: '/publicacoes/manuais' },
    { nome: 'Tutoriais', rota: '/publicacoes/tutoriais' },
    { nome: 'Atualizações', rota: '/publicacoes/atualizacoes' },
    ...(user?.tipo?.toLowerCase() === 'master' ? [{ nome: 'Usuários', rota: '/usuarios' }] : []),
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
      <aside className={`
        fixed md:relative z-50 top-0 left-0 h-full w-64 bg-primary text-white
        flex flex-col shrink-0
        transform ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300
      `}>
        <div className="flex items-center justify-center px-4 py-4 border-b border-white/20 shrink-0">
          <div className="flex items-center">
            <img src={logoHOF} alt="HOF" className="w-42" />
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
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

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 w-full h-full relative">
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-10 capitalize">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>
            {!isHome && (
              <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-1 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-sm md:text-lg font-semibold text-secondary">
              {title || 'Sistema Interno'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NotificationBell />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary border border-slate-200 shadow-sm">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 capitalize hidden md:block">
                    {getNomeCurto()}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md capitalize">
                  {user.tipo}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors"
                  title="Sair do sistema"
                >
                  <span className="text-sm font-semibold">Sair</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <User size={18} />
                <span className="text-sm font-semibold">Login</span>
              </button>
            )}
          </div>
        </header>

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
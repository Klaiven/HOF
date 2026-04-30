import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Clock, Check, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showChamadoInput, setShowChamadoInput] = useState(false);
  const [chamadoCesu, setChamadoCesu] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const dropdownRef = useRef(null);

  const isTI = user?.tipo?.toLowerCase() === 'master';

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
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'concluido' && !showChamadoInput) {
      setShowChamadoInput(true);
      return;
    }

    if (action === 'concluido' && !chamadoCesu.trim()) {
      alert('Por favor, informe o número do Chamado Cesu.');
      return;
    }

    setLoadingAction(true);
    try {
      await api.put(`/cesus/${id}`, {
        resolvido: action === 'concluido' ? 'S' : 'N',
        CdChamadoCesu: action === 'concluido' ? chamadoCesu : null,
        usuarioAtendimentoId: user.id,
        horarioAtendimento: new Date().toISOString()
      });
      fetchNotifications();
      setSelectedRequest(null);
      setShowChamadoInput(false);
      setChamadoCesu('');
      setOpenDropdown(false);
    } catch (err) {
      alert('Erro ao processar solicitação');
    } finally {
      setLoadingAction(false);
    }
  };

  if (!isTI) return null;

  return (
    <>
      {/* BELL & DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setOpenDropdown(!openDropdown)}
          className={`relative p-2.5 rounded-xl transition-all duration-200 ${openDropdown ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {notifications.length}
            </span>
          )}
        </button>

        {openDropdown && (
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Notificações</h3>
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black">
                {notifications.length} NOVAS
              </span>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200">
                    <Check size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-bold">Tudo limpo por aqui!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedRequest(n);
                      setOpenDropdown(false);
                    }}
                    className="w-full p-4 text-left hover:bg-primary/5 border-b border-slate-50 last:border-0 transition-colors flex gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{n.nomeCompleto}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{n.setor}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        {n.horarioAbertura ? new Date(n.horarioAbertura).toLocaleDateString('pt-BR') : 'Agora'}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* PORTALED MODAL (For correct Z-Index) */}
      {selectedRequest && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
            <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/50 text-center relative">
              <div className="w-full text-center">
                <h2 className="text-xl font-black text-secondary leading-tight">
                  {showChamadoInput ? 'Finalizar Atendimento' : 'Detalhes da Solicitação'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  ID #{selectedRequest.id}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedRequest(null);
                  setShowChamadoInput(false);
                  setChamadoCesu('');
                }} 
                className="absolute top-6 right-6 p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {!showChamadoInput ? (
                <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-center md:text-left">
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Nome Completo</label>
                    <p className="text-sm font-bold text-slate-700">{selectedRequest.nomeCompleto}</p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Ramal</label>
                    <p className="text-sm font-bold text-slate-700">{selectedRequest.ramalTelefone}</p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Setor</label>
                    <p className="text-sm font-bold text-slate-700">{selectedRequest.setor}</p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Aberto em</label>
                    <p className="text-sm font-bold text-slate-700">{new Date(selectedRequest.horarioAbertura).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Email</label>
                    <p className="text-sm font-bold text-slate-700">{selectedRequest.email || '-'}</p>
                  </div>
                </div>
                  
                  <div className="space-y-2 pt-2 text-center md:text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descrição da Solicitação</label>
                    <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedRequest.descricao || 'Sem descrição.'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 items-center">
                      <div className="bg-primary text-white p-2 rounded-lg">
                        <Check size={18} />
                      </div>
                      <p className="text-xs font-medium text-slate-600 text-left">
                        Você está concluindo esta solicitação. Por favor, informe o número do chamado gerado.
                      </p>
                   </div>

                   <div className="space-y-2 text-center md:text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº do Chamado Cesu</label>
                      <input 
                        autoFocus
                        value={chamadoCesu}
                        onChange={(e) => setChamadoCesu(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg text-center"
                      />
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-slate-50/50 flex gap-4">
              {showChamadoInput ? (
                <>
                  <button
                    disabled={loadingAction}
                    onClick={() => setShowChamadoInput(false)}
                    className="flex-1 px-6 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all text-xs"
                  >
                    VOLTAR
                  </button>
                  <button
                    disabled={loadingAction}
                    onClick={() => handleAction(selectedRequest.id, 'concluido')}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 text-xs"
                  >
                    {loadingAction ? 'PROCESSANDO...' : 'FINALIZAR AGORA'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled={loadingAction}
                    onClick={() => handleAction(selectedRequest.id, 'negado')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-red-50 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-xs uppercase tracking-widest"
                  >
                    <X size={16} /> Negar
                  </button>
                  <button
                    disabled={loadingAction}
                    onClick={() => handleAction(selectedRequest.id, 'concluido')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
                  >
                    <Check size={16} /> Concluir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Edit, Trash2, AlertCircle, Plus, Search, User, Shield, Briefcase, Calendar, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function highlight(text, search) {
  if (!search || !text) return text;
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.toString().split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>
    ) : part
  );
}

function Usuarios() {
  const { user, authenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const isMaster = authenticated && user?.tipo?.toLowerCase() === 'master';
  const estaCarregando = authLoading || loading;

  useEffect(() => {
    if (!authLoading && !isMaster) {
      navigate('/');
      return;
    }
  }, [authLoading, isMaster, navigate]);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      const data = Array.isArray(res.data) ? res.data : [];
      setUsuarios(data.sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
      setErro(null);
    } catch (err) {
      setErro('Erro ao carregar usuários. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMaster) {
      carregarUsuarios();
    }
  }, [isMaster]);

  const filtrados = usuarios.filter((u) =>
    `${u.nome || ''} ${u.username || ''} ${u.cpf || ''} ${u.setor || ''} ${u.email || ''}`.toLowerCase().includes(busca.toLowerCase())
  );

  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
    if (id === user.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter(item => item.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isMaster) return null;

  const UserCard = ({ u }) => {
    const isMe = u.id === user.id;
    const cpfFormatado = u.cpf ? u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-';
    
    const formatarData = (dataISO) => {
      if (!dataISO) return '-';
      const date = new Date(dataISO);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      return `${dia}/${mes}/${ano}`;
    };

    return (
      <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col overflow-hidden h-full">
        {/* Top Accent Color */}
        <div className={`h-2 w-full ${
          u.tipo === 'Master' ? 'bg-red-500' : 
          u.tipo === 'Administrador' ? 'bg-blue-500' : 
          'bg-slate-300'
        }`} />

        <div className="p-6 flex flex-col flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                u.tipo === 'Master' ? 'bg-red-500 shadow-red-200' : 
                u.tipo === 'Administrador' ? 'bg-blue-500 shadow-blue-200' : 
                'bg-slate-400 shadow-slate-200'
              }`}>
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  {highlight(u.nome, busca)}
                </h3>
                <p className="text-xs font-bold text-slate-400">@{highlight(u.username, busca)}</p>
              </div>
            </div>
            {isMe && (
              <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg">Você</span>
            )}
          </div>

          {/* Info Grid */}
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Shield size={14} className="text-slate-400" />
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                u.tipo === 'Master' ? 'bg-red-50 text-red-600' : 
                u.tipo === 'Administrador' ? 'bg-blue-50 text-blue-600' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {u.tipo || 'Usuário'}
              </span>
            </div>

            {u.setor && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Briefcase size={14} className="text-slate-400" />
                <span className="truncate">{highlight(u.setor, busca)}</span>
              </div>
            )}

            {/* {u.email && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Shield size={14} className="text-slate-400" />
                <span className="truncate">{highlight(u.email, busca)}</span>
              </div>
            )} */}

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <Fingerprint size={12} className="text-slate-400" />
                <span>{cpfFormatado}</span>
              </div>
              {/* <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <Calendar size={12} className="text-slate-400" />
                <span>{formatarData(u.dtNasc)}</span>
              </div> */}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <button 
              onClick={() => navigate(`/usuarios/${u.id}`)}
              className="text-primary text-xs font-black uppercase tracking-widest hover:underline transition-all"
            >
              Editar Perfil
            </button>

            <div className="flex gap-1">
              {!isMe && (
                <button
                  onClick={() => deletar(u.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Gerenciamento de Usuários">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome, usuário, setor ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <button
          onClick={() => navigate('/usuarios/novo')}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {estaCarregando ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : erro ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-bold">{erro}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtrados.map((usuario) => (
            <UserCard key={usuario.id} u={usuario} />
          ))}
          
          {filtrados.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum usuário encontrado para sua busca.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Usuarios;
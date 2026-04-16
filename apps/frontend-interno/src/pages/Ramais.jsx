import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Edit, Trash2, AlertCircle } from 'lucide-react';

function highlight(text, search) {
  if (!text || !search) return text || '';
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>
    ) : part
  );
}

function Ramais() {
  const { user, authenticated, loading } = useAuth();
  const [busca, setBusca] = useState('');
  const [ramais, setRamais] = useState([]);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', subsetor: '', ramal: '' });
  const [carregando, setCarregando] = useState(false);



  // Definição de permissões baseada no "tipo"
  const isMaster = authenticated && user?.tipo?.toLowerCase() === 'master';
  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');

  useEffect(() => {
    const carregarRamais = async () => {
      try {
        const res = await api.get('/setores');
        setRamais(res.data || []);
        setErro(null);
      } catch (err) {
        setErro('Erro ao carregar ramais. Tente novamente mais tarde.');
      }
    };
    carregarRamais();
  }, []);

  // Abrir modal para novo ramal
  const abrirModalNovo = () => {
    setForm({ nome: '', subsetor: '', ramal: '' });
    setEditando(null);
    setModalAberto(true);
  };

  // Abrir modal para editar ramal
  const abrirModalEditar = (ramal) => {
    setForm({ nome: ramal.nome, subsetor: ramal.subsetor, ramal: ramal.ramal });
    setEditando(ramal.id);
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setForm({ nome: '', subsetor: '', ramal: '' });
  };

  // Salvar (criar ou editar)
  const salvar = async (e) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.ramal.trim()) {
      alert('Nome e Ramal são obrigatórios');
      return;
    }

    setCarregando(true);
    try {
      if (editando) {
        // Editar
        await api.put(`/setores/${editando}`, form);
      } else {
        // Criar
        await api.post('/setores', form);
      }
      // Recarregar lista
      const res = await api.get('/setores');
      setRamais(res.data || []);
      fecharModal();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.message || err.message));
    } finally {
      setCarregando(false);
    }
  };

  // Deletar
  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    
    try {
      await api.delete(`/setores/${id}`);
      setRamais(ramais.filter(r => r.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Layout title="Ramais"><p className="text-center">A verificar permissões...</p></Layout>;

  const filtrados = ramais.filter((r) =>
    `${r.ramal || ''} ${r.nome || ''} ${r.subsetor || ''}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <Layout title="Ramais">
      {/* Aviso de Erro */}
      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-800 text-sm">{erro}</p>
        </div>
      )}

      {/* Botão Adicionar - Apenas Admin e Master */}
      {isAdminOrMaster && (
        <div className="mb-6 flex justify-end">
          <button 
            onClick={abrirModalNovo}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 shadow-md transition"
          >
            + Adicionar Novo Setor/Ramal
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar por número, setor ou subsetor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
      />

      {ramais.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>Nenhum ramal cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtrados.length === 0 ? (
            <p className="text-center text-slate-400 py-4">Nenhum resultado encontrado</p>
          ) : (
            filtrados.map((ramal) => (
              <div key={ramal.id} className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center hover:shadow-lg transition">
                <div>
                  <p className="text-lg font-bold text-primary">{highlight(ramal.ramal || 'S/N', busca)}</p>
                  <p className="text-sm text-secondary font-semibold">{highlight(ramal.nome, busca)}</p>
                  <p className="text-xs text-muted">{highlight(ramal.subsetor, busca)}</p>
                </div>

                {/* Ações Laterais Protegidas */}
                <div className="flex gap-2">
                  {isAdminOrMaster && (
                    <button 
                      onClick={() => abrirModalEditar(ramal)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  {isMaster && (
                    <button 
                      onClick={() => deletar(ramal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-96 max-w-full mx-4 border border-white/30">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editando ? 'Editar Setor/Ramal' : 'Novo Setor/Ramal'}
            </h2>

            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ramal * (máx 6 dígitos)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123"
                  value={form.ramal}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setForm({ ...form, ramal: valor });
                  }}
                  maxLength="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Departamento de TI"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subsetor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Suporte"
                  value={form.subsetor}
                  onChange={(e) => setForm({ ...form, subsetor: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {carregando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Ramais;
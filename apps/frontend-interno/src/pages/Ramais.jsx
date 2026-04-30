import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Edit, 
  Trash2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Hash, 
  Building2, 
  User, 
  Plus, 
  X,
  Phone
} from 'lucide-react';

function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\./g, ""); // Remove pontos
}

function highlight(text, search) {
  if (!text || !search) return text || '';
  
  const normalizedText = normalizeText(text);
  const normalizedSearch = normalizeText(search);
  
  if (!normalizedSearch) return text;

  const parts = [];
  let currentIndex = 0;
  
  // Encontra todas as ocorrências na string normalizada
  let matchIndex = normalizedText.indexOf(normalizedSearch, currentIndex);
  
  if (matchIndex === -1) return text;

  while (matchIndex !== -1) {
    // Texto antes do match
    parts.push(text.substring(currentIndex, matchIndex));
    // O match real (mantendo a grafia original)
    const matchLength = search.replace(/\./g, '').length;
    parts.push(
      <span key={matchIndex} className="bg-yellow-100 px-0.5 rounded font-bold">
        {text.substring(matchIndex, matchIndex + matchLength)}
      </span>
    );
    currentIndex = matchIndex + matchLength;
    matchIndex = normalizedText.indexOf(normalizedSearch, currentIndex);
  }
  
  parts.push(text.substring(currentIndex));
  return parts;
}

function Ramais() {
  const { user, authenticated, loading: authLoading } = useAuth();
  const [busca, setBusca] = useState('');
  const [ramais, setRamais] = useState([]);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', subsetor: '', ramal: '' });
  const [carregando, setCarregando] = useState(false);
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // Definição de permissões baseada no "tipo"
  const isMaster = authenticated && user?.tipo?.toLowerCase() === 'master';
  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');

  useEffect(() => {
    const carregarRamais = async () => {
      try {
        const res = await api.get('/setores');
        // Ordenar inicialmente por Setor (nome), depois Local, depois Ramal
        const ordenados = (res.data || []).sort((a, b) => {
          const setorA = normalizeText(a.nome || '');
          const setorB = normalizeText(b.nome || '');
          if (setorA < setorB) return -1;
          if (setorA > setorB) return 1;
          
          const localA = normalizeText(a.subsetor || '');
          const localB = normalizeText(b.subsetor || '');
          if (localA < localB) return -1;
          if (localA > localB) return 1;

          const ramalA = (a.ramal || '').replace(/\./g, '');
          const ramalB = (b.ramal || '').replace(/\./g, '');
          return ramalA.localeCompare(ramalB, undefined, { numeric: true });
        });
        setRamais(ordenados);
        setErro(null);
      } catch (err) {
        setErro('Erro ao carregar ramais. Tente novamente mais tarde.');
      }
    };
    carregarRamais();
  }, []);

  // Resetar página ao buscar
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const filtrados = useMemo(() => {
    const buscaNorm = normalizeText(busca);
    return ramais.filter((r) => {
      const conteudoNorm = normalizeText(`${r.ramal || ''} ${r.nome || ''} ${r.subsetor || ''}`);
      return conteudoNorm.includes(buscaNorm);
    });
  }, [ramais, busca]);

  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const ramaisPaginados = filtrados.slice(inicio, inicio + itensPorPagina);

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
        await api.put(`/setores/${editando}`, form);
      } else {
        await api.post('/setores', form);
      }
      const res = await api.get('/setores');
      // Re-ordenar ao salvar
      const ordenados = (res.data || []).sort((a, b) => {
        const setorA = normalizeText(a.nome || '');
        const setorB = normalizeText(b.nome || '');
        if (setorA < setorB) return -1;
        if (setorA > setorB) return 1;
        const localA = normalizeText(a.subsetor || '');
        const localB = normalizeText(b.subsetor || '');
        if (localA < localB) return -1;
        if (localA > localB) return 1;
        const ramalA = (a.ramal || '').replace(/\./g, '');
        const ramalB = (b.ramal || '').replace(/\./g, '');
        return ramalA.localeCompare(ramalB, undefined, { numeric: true });
      });
      setRamais(ordenados);
      fecharModal();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.message || err.message));
    } finally {
      setCarregando(false);
    }
  };

  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    
    try {
      await api.delete(`/setores/${id}`);
      setRamais(ramais.filter(r => r.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  if (authLoading) {
    return (
      <Layout title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ramais">
      <div className="max-w-5xl mx-auto px-4 md:px-0 mb-10">
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-secondary">Ramais e Setores</h1>
              <p className="text-slate-400 font-medium text-sm">Consulte e gerencie os ramais internos</p>
            </div>
            {isAdminOrMaster && (
              <button 
                onClick={abrirModalNovo}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95 text-sm"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                Novo Ramal
              </button>
            )}
          </div>

          <div className="relative group mb-8">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por setor, número ou local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-base"
            />
          </div>

          {erro && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-bold text-sm">{erro}</p>
            </div>
          )}

          <div className="space-y-3">
            {ramais.length === 0 ? (
              <div className="py-16 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <Phone size={32} />
                </div>
                <p className="text-slate-400 font-bold">Nenhum ramal cadastrado.</p>
              </div>
            ) : filtrados.length === 0 ? (
              <div className="py-16 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <Search size={32} />
                </div>
                <p className="text-slate-400 font-bold">Nenhum resultado para "{busca}"</p>
              </div>
            ) : (
              <>
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-4 flex items-center gap-1.5"><User size={12} /> Setor</div>
                  <div className="col-span-2 flex items-center gap-1.5"><Hash size={12} /> Ramal</div>
                  <div className="col-span-4 flex items-center gap-1.5"><Building2 size={12} /> SubSetor</div>
                  <div className="col-span-2 text-right">Ações</div>
                </div>

                {ramaisPaginados.map((ramal) => (
                  <div 
                    key={ramal.id} 
                    className="bg-white border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 md:px-6 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-center group"
                  >
                    <div className="col-span-4 w-full">
                      <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Setor</span>
                      <p className="text-sm font-black text-secondary truncate">
                        {highlight(ramal.nome, busca)}
                      </p>
                    </div>

                    <div className="col-span-2 w-full">
                      <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ramal</span>
                      <p className="text-xl font-black text-primary tracking-tight">
                        {highlight(ramal.ramal || 'S/N', busca)}
                      </p>
                    </div>

                    <div className="col-span-4 w-full">
                      <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Local</span>
                      <p className="text-sm font-bold text-slate-500 truncate">
                        {highlight(ramal.subsetor || '---', busca)}
                      </p>
                    </div>

                    <div className="col-span-2 w-full flex justify-end gap-2 border-t md:border-0 pt-3 md:pt-0">
                      {isAdminOrMaster && (
                        <button 
                          onClick={() => abrirModalEditar(ramal)}
                          className="flex-1 md:flex-none p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all" 
                          title="Editar"
                        >
                          <Edit size={16} className="mx-auto" />
                        </button>
                      )}
                      {isMaster && (
                        <button 
                          onClick={() => deletar(ramal.id)}
                          className="flex-1 md:flex-none p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all" 
                          title="Excluir"
                        >
                          <Trash2 size={16} className="mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                      onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                      disabled={paginaAtual === 1}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2">
                      <span className="text-sm font-black text-primary">{paginaAtual}</span>
                      <span className="text-[10px] font-bold text-slate-300">/</span>
                      <span className="text-sm font-black text-slate-600">{totalPaginas}</span>
                    </div>

                    <button
                      onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaAtual === totalPaginas}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={fecharModal}
              className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-secondary flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Phone size={20} />
                </div>
                {editando ? 'Editar' : 'Novo'} Ramal
              </h2>
            </div>

            <form onSubmit={salvar} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 ml-1 uppercase tracking-widest">
                  Setor / Nome *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Recepção"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full p-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-black text-slate-700 ml-1 uppercase tracking-widest">
                    Ramal *
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={form.ramal}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setForm({ ...form, ramal: valor });
                    }}
                    maxLength="6"
                    className="w-full p-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-black text-center text-base"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-700 ml-1 uppercase tracking-widest">
                    Local / Unidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Unidade Centro"
                    value={form.subsetor}
                    onChange={(e) => setForm({ ...form, subsetor: e.target.value })}
                    className="w-full p-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 px-4 py-3.5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black hover:bg-slate-50 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="flex-1 px-4 py-3.5 bg-primary text-white rounded-2xl font-black hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {carregando ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  ) : 'Salvar'}
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
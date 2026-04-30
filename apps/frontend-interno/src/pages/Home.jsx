import React, { useEffect, useState } from 'react';
import {
  Phone, FileText, BookOpen, Megaphone, Globe, Folder, X, Plus, Pencil, Trash2, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ModalUsuarioCeSu from '../components/ModalUsuarioCeSu';
import ModalForm from '../components/ModalForm';

function Home() {
  const navigate = useNavigate();
  const { user, authenticated } = useAuth();

  const [links, setLinks] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ nome: '', url: '', tipo: 'link' });
  const [savingLink, setSavingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);

  const [openFormModal, setOpenFormModal] = useState(false);
  const [openCeSuModal, setOpenCeSuModal] = useState(false);

  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');

  const carregarLinks = async () => {
    try {
      const res = await api.get('/links');
      const data = res.data || [];
      setLinks(data.filter(i => i.tipo === 'link'));
      setPdfs(data.filter(i => i.tipo === 'pdf'));
    } catch (err) {
      console.error('Erro ao carregar links:', err);
    }
  };

  const carregarComunicados = async () => {
    try {
      const res = await api.get('/publicacoes?tipo=Atualizacoes');
      const data = Array.isArray(res.data) ? res.data : [];
      // Ordenar por data decrescente
      const ordenados = data.sort((a, b) => new Date(b.dtCriacao) - new Date(a.dtCriacao));
      setComunicados(ordenados.slice(0, 3));
    } catch (err) {
      console.error('Erro ao carregar comunicados:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    carregarLinks();
    carregarComunicados();
  }, []);

  const NewsCard = ({ item, isLarge }) => {
    if (!item) return null;

    const isImage = item.pdfUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.pdfUrl);
    const bgImage = isImage ? item.pdfUrl : null;

    return (
      <div
        onClick={() => navigate(`/publicacoes/comunicados/${item.id}`)}
        className={`group relative overflow-hidden rounded-[2rem] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 ${isLarge ? 'h-[420px]' : 'h-[200px]'}`}
      >
        {/* Background Image or Fallback */}
        <div className="absolute inset-0 bg-slate-200">
          {bgImage ? (
            <img
              src={bgImage}
              alt={item.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary/30">
              <Megaphone size={isLarge ? 64 : 32} />
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-wider mb-2">
            Comunicado
          </span>
          <h3 className={`font-bold text-white leading-tight line-clamp-2 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
            {item.titulo}
          </h3>
          {isLarge && item.dtCriacao && (
            <p className="text-white/60 text-xs mt-2">
              {new Date(item.dtCriacao).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    );
  };

  const abrirModal = (item = null) => {
    if (item) {
      setLinkForm({
        nome: item.nome ?? '',
        url: item.url ?? '',
        tipo: item.tipo ?? 'link'
      });
      setEditingLinkId(item.id);
    } else {
      setLinkForm({ nome: '', url: '', tipo: 'link' });
      setEditingLinkId(null);
    }
    setOpenLinkModal(true);
  };

  const fecharModal = () => {
    setOpenLinkModal(false);
    setEditingLinkId(null);
  };

  const abrirFormModal = () => {
    setOpenFormModal(true);
  };

  const fecharFormModal = () => {
    setOpenFormModal(false);
  };

  const salvarLink = async () => {
    if (savingLink) return;
    const nomeLimpo = linkForm.nome.trim();
    const urlLimpa = linkForm.url.trim();

    if (!nomeLimpo) {
      alert('Nome é obrigatório');
      return;
    }

    if (!urlLimpa) {
      alert('Link é obrigatório');
      return;
    }

    if (!user?.id) {
      alert('Usuário não identificado');
      return;
    }

    setSavingLink(true);
    try {
      const payload = {
        nome: nomeLimpo,
        tipo: 'link',
        url: urlLimpa,
        pasta: '',
        subpasta: '',
        usuarioId: user.id
      };

      if (editingLinkId) {
        const res = await api.put(`/links/${editingLinkId}`, payload);
        setLinks((prev) => prev.map((link) => link.id === editingLinkId ? res.data : link));
      } else {
        const res = await api.post('/links', payload);
        setLinks((prev) => [...prev, res.data]);
      }

      fecharModal();
    } catch (err) {
      console.error('Erro ao salvar link:', err.response?.data || err);
      alert('Erro ao salvar link. Verifique os dados e tente novamente.');
    } finally {
      setSavingLink(false);
    }
  };

  const excluirLink = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este link?')) return;
    try {
      await api.delete(`/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  const menu = [
    { nome: 'Ramais', icon: Phone, rota: '/ramais' },
    { nome: 'Manuais', icon: FileText, rota: '/publicacoes/manuais' },
    { nome: 'Portal de Capacitação', icon: BookOpen, rota: '/publicacoes/portal-capacitacao' },
    { nome: 'Comunicados', icon: Megaphone, rota: '/publicacoes/comunicados' }
  ];

  // 🔥 AGRUPAMENTO PDFs
  const agrupado = pdfs.reduce((acc, item) => {
    if (!acc[item.pasta]) acc[item.pasta] = {};
    const sub = item.subpasta || 'root';
    if (!acc[item.pasta][sub]) acc[item.pasta][sub] = [];
    acc[item.pasta][sub].push(item);
    return acc;
  }, {});

  return (
    <Layout title="Sistema Interno">

      {/* NOTÍCIAS / COMUNICADOS */}
      <div className="mb-10">
        <h2 className="text-lg md:text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
          <Megaphone className="text-primary" size={24} />
          Comunicados Recentes
        </h2>

        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[420px]">
            <div className="md:col-span-2 bg-slate-100 animate-pulse rounded-[2rem]" />
            <div className="space-y-6">
              <div className="h-1/2 bg-slate-100 animate-pulse rounded-[2rem]" />
              <div className="h-1/2 bg-slate-100 animate-pulse rounded-[2rem]" />
            </div>
          </div>
        ) : comunicados.length === 0 ? (
          <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
            <Megaphone size={48} className="mb-3 opacity-20" />
            <p className="font-bold text-lg">Aguardando Novidades</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notícia Principal (Vertical) */}
            <div className="md:col-span-2">
              <NewsCard item={comunicados[0]} isLarge={true} />
            </div>

            {/* Notícias Secundárias */}
            <div className="flex flex-col gap-6">
              <NewsCard item={comunicados[1]} isLarge={false} />
              <NewsCard item={comunicados[2]} isLarge={false} />
            </div>
          </div>
        )}
      </div>

      {/* ACESSO RÁPIDO */}
      <h2 className="text-lg md:text-2xl font-bold text-secondary mb-6">
        Acesso rápido
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-10">
        {menu.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(item.rota)}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
            >
              <div className="bg-primary text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
                <Icon size={24} />
              </div>

              <span className="font-semibold text-secondary">
                {item.nome}
              </span>
            </div>
          );
        })}

        <div
          onClick={() => setOpenCeSuModal(true)}
          className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
        >
          <div className="bg-primary text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
            <UserPlus size={24} />
          </div>

          <span className="font-semibold text-secondary text-center">
            Criar Usuário CeSu
          </span>
        </div>
      </div>

      {/* 🔥 LINKS EXTERNOS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-secondary">
          Links Externos
        </h2>
        {isAdminOrMaster && (
          <button
            onClick={() => abrirModal()}
            className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Adicionar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-10">

        {links.length === 0 && !isAdminOrMaster && (
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
            <X size={28} className="text-gray-400 mb-2" />
            <span className="text-gray-400 text-sm">Sem link</span>
          </div>
        )}

        {links.length === 0 && isAdminOrMaster && (
          <div
            onClick={() => abrirModal()}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer min-h-[150px]"
          >
            <div className="bg-green-500 text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
              <Plus size={24} />
            </div>
            <span className="text-sm font-semibold text-secondary">Adicionar link</span>
          </div>
        )}

        {links.map((item, index) => (
          <div
            key={item.id ?? `link-${index}`}
            className="group bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition min-h-[150px] relative"
          >
            <div
              onClick={() => window.open(item.url, '_blank')}
              className="cursor-pointer flex flex-col items-center justify-center w-full h-full absolute inset-0 rounded-xl"
            >
              <div className="bg-blue-500 text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
                <Globe size={24} />
              </div>
              <span className="text-sm font-semibold text-secondary capitalize">
                {item.nome}
              </span>
            </div>

            {isAdminOrMaster && (
              <div className="absolute top-2 right-2 flex gap-2 bg-white rounded-lg p-2 shadow-md opacity-0 group-hover:opacity-100 transition">
                <Pencil
                  onClick={() => abrirModal(item)}
                  className="cursor-pointer text-blue-600 hover:scale-110 transition"
                  size={16}
                />
                <Trash2
                  onClick={() => excluirLink(item.id)}
                  className="cursor-pointer text-red-500 hover:scale-110 transition"
                  size={16}
                />
              </div>
            )}
          </div>
        ))}

      </div>

      {openLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold">{editingLinkId ? 'Editar Link' : 'Adicionar Link'}</h3>
                <p className="text-sm text-slate-500">Preencha nome e link do recurso.</p>
              </div>
              <button onClick={fecharModal} className="text-slate-500 hover:text-slate-800 transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Nome</label>
                <input
                  value={linkForm.nome ?? ''}
                  onChange={(e) => setLinkForm({ ...linkForm, nome: e.target.value })}
                  className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Nome do link"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Link</label>
                <input
                  value={linkForm.url ?? ''}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Tipo</label>
                <div className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-600">
                  Link
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={fecharModal}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarLink}
                  disabled={savingLink}
                  className="px-5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingLink ? 'Salvando...' : editingLinkId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIOS PERSONALIZADOS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-secondary">
          Formulários personalizados
        </h2>
        {isAdminOrMaster && (
          <button
            onClick={abrirFormModal}
            className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Adicionar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">

        {Object.keys(agrupado).length === 0 && !isAdminOrMaster && (
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center min-h-[150px] ">
            <X size={28} className="text-gray-400 mb-2" />
            <span className="text-gray-400 text-sm">Sem formulários</span>
          </div>
        )}

        {Object.keys(agrupado).length === 0 && isAdminOrMaster && (
          <div
            onClick={abrirFormModal}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer min-h-[150px]"
          >
            <div className="bg-green-500 text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
              <Plus size={24} />
            </div>
            <span className="text-sm font-semibold text-secondary">Adicionar formulário</span>
          </div>
        )}

        {Object.keys(agrupado).map((pasta) => (
          <div
            key={pasta}
            onClick={() => navigate(`/formularios/${pasta}`)}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer min-h-[150px]"
          >
            <div className="bg-yellow-500 text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
              <Folder size={24} />
            </div>

            <span className="text-sm font-semibold text-secondary capitalize">
              {pasta}
            </span>
          </div>
        ))}
      </div>

      <ModalForm
        open={openFormModal}
        onClose={fecharFormModal}
        onSuccess={carregarLinks}
      />

      <ModalUsuarioCeSu
        open={openCeSuModal}
        onClose={() => setOpenCeSuModal(false)}
        onSuccess={() => alert('Solicitação enviada!')}
      />

    </Layout>
  );
}

export default Home;
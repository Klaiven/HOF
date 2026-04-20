import React, { useEffect, useState } from 'react';
import {
  Phone, FileText, BookOpen, Megaphone, Globe, Folder, FileDown, Eye, X, Plus, Pencil, Trash2, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ModalUsuarioCeSu from '../components/ModalUsuarioCeSu';

function Home() {

    const gerarNomeDoArquivo = (fileName) => {
      return fileName
        .replace('.pdf', '')
        .replace(/[_-]/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
    };

    const processarArquivo = (file) => {
      if (!file) return;

      if (file.type !== 'application/pdf') {
        setFormError('Formulário não corresponde ao tipo aceito. Envie um arquivo PDF.');
        return;
      }

      setFormUpload(prev => ({
        ...prev,
        file,
        nome: prev.nome || gerarNomeDoArquivo(file.name)
      }));

      setFormError('');
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      processarArquivo(file);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };





  const navigate = useNavigate();
  const { user, authenticated } = useAuth();

  const [links, setLinks] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ nome: '', url: '', tipo: 'link' });
  const [savingLink, setSavingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);

  const [openFormModal, setOpenFormModal] = useState(false);
  const [openCeSuModal, setOpenCeSuModal] = useState(false);
  const [formUpload, setFormUpload] = useState({ nome: '', pasta: '', subpasta: '', file: null });
  const [savingForm, setSavingForm] = useState(false);
  const [formError, setFormError] = useState('');

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

  useEffect(() => {
    carregarLinks();
  }, []);

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
    setFormUpload({ nome: '', pasta: '', subpasta: '', file: null });
    setFormError('');
    setOpenFormModal(true);
  };

  const fecharFormModal = () => {
    setOpenFormModal(false);
    setFormError('');
  };

  const uploadArquivoPDF = async () => {
    if (!formUpload.file) return null;

    const formData = new FormData();
    formData.append('pasta', formUpload.pasta.trim());
    formData.append('subpasta', formUpload.subpasta.trim());
    formData.append('file', formUpload.file);

    const res = await api.post('/links/upload', formData);
    return res.data.url;
  };

  const salvarForm = async () => {
    if (savingForm) return;
    setFormError('');
    const nomeLimpo = formUpload.nome.trim();
    const pastaLimpa = formUpload.pasta.trim();

    if (!nomeLimpo) {
      setFormError('Nome é obrigatório');
      return;
    }

    if (!pastaLimpa) {
      setFormError('Pasta é obrigatória');
      return;
    }

    if (!formUpload.file) {
      setFormError('Arquivo PDF é obrigatório');
      return;
    }

    if (formUpload.file.type !== 'application/pdf') {
      setFormError('Formulário não corresponde ao tipo aceito. Envie um arquivo do tipo PDF.');
      return;
    }

    if (!user?.id) {
      setFormError('Usuário não identificado');
      return;
    }

    setSavingForm(true);
    try {
      const urlFinal = await uploadArquivoPDF();
      const payload = {
        nome: nomeLimpo,
        tipo: 'pdf',
        url: urlFinal,
        pasta: pastaLimpa,
        subpasta: formUpload.subpasta.trim(),
        usuarioId: user.id
      };

      const res = await api.post('/links', payload);
      setPdfs((prev) => [...prev, res.data]);
      fecharFormModal();
    } catch (err) {
      console.error('Erro ao salvar formulário:', err.response?.data || err);
      alert('Erro ao salvar formulário. Verifique os dados e tente novamente.');
    } finally {
      setSavingForm(false);
    }
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
    { nome: 'Tutoriais', icon: BookOpen, rota: '/publicacoes/tutoriais' },
    { nome: 'Atualizações', icon: Megaphone, rota: '/publicacoes/atualizacoes' }
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
            onClick={abrirModal}
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
              <button onClick={fecharModal} className="text-slate-500 hover:text-slate-800">
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

      {openFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold">Adicionar Formulário</h3>
                <p className="text-sm text-slate-500">Preencha os dados e envie o PDF.</p>
              </div>
              <button onClick={fecharFormModal} className="text-slate-500 hover:text-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Nome <span className="text-red-500">*</span></label>
                <input
                  value={formUpload.nome ?? ''}
                  onChange={(e) => setFormUpload({ ...formUpload, nome: e.target.value })}
                  className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Nome do formulário"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Pasta <span className="text-red-500">*</span></label>
                <input
                  value={formUpload.pasta ?? ''}
                  onChange={(e) => setFormUpload({ ...formUpload, pasta: e.target.value })}
                  className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Pasta principal"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Subpasta</label>
                <input
                  value={formUpload.subpasta ?? ''}
                  onChange={(e) => setFormUpload({ ...formUpload, subpasta: e.target.value })}
                  className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Subpasta (opcional)"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Tipo <span className="text-red-500">*</span></label>
                <div className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-600 font-semibold">
                  📄 PDF
                </div>
              </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-3">Arquivo PDF <span className="text-red-500">*</span></label>
                  <div className="relative w-full">

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="relative w-full"
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => processarArquivo(e.target.files?.[0])}
                    className="hidden"
                    id="file-input"
                  />

                  <label htmlFor="file-input" className="block cursor-pointer">
                    <div className="w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition text-center">

                      {formUpload.file ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileDown size={18} className="text-green-600" />
                          <span className="text-sm font-semibold text-slate-700">
                            {formUpload.file.name}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <FileText size={24} className="text-slate-400 mx-auto mb-2" />
                          <span className="text-sm text-slate-600">
                            Clique ou arraste um PDF aqui
                          </span>
                        </div>
                      )}

                    </div>
                  </label>
                </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={fecharFormModal}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarForm}
                  disabled={savingForm}
                  className="px-5 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingForm ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <ModalUsuarioCeSu
        open={openCeSuModal}
        onClose={() => setOpenCeSuModal(false)}
        onSuccess={() => alert('Solicitação enviada!')}
      />

    </Layout>
  );
}

export default Home;
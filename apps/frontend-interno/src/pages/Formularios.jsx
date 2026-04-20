import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
//import axios from 'axios';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, FileText, FileDown, Eye, Pencil, Trash2, X, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function Formularios() {




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
      setFormError('Formulário não corresponde ao tipo aceito. PDF');
      return;
    }

    setFormUpload(prev => ({
      ...prev,
      file,
      nome: prev.nome || gerarNomeDoArquivo(file.name) // 🔥 só preenche se estiver vazio
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




  const { pasta, sub } = useParams();
  const navigate = useNavigate();
  const { user, authenticated } = useAuth();

  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const [openFormModal, setOpenFormModal] = useState(false);
  const [formUpload, setFormUpload] = useState({ nome: '', pasta: '', subpasta: '', file: null });
  const [savingForm, setSavingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingFormId, setEditingFormId] = useState(null);

  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');

  const carregarDados = async () => {
    const res = await api.get('/links');
    setDados(res.data.filter(i => i.tipo === 'pdf'));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // 🔥 bloquear scroll quando modal aberto
  useEffect(() => {
    document.body.style.overflow = previewUrl || openFormModal ? 'hidden' : 'auto';
  }, [previewUrl, openFormModal]);

  const abrirFormModal = (pastaVal = pasta, subpastaVal = sub, item = null) => {
    if (item) {
      setFormUpload({ nome: item.nome ?? '', pasta: item.pasta ?? '', subpasta: item.subpasta ?? '', file: null });
      setEditingFormId(item.id);
    } else {
      setFormUpload({ nome: '', pasta: pastaVal || '', subpasta: subpastaVal || '', file: null });
      setEditingFormId(null);
    }
    setFormError('');
    setOpenFormModal(true);
  };

  const fecharFormModal = () => {
    setOpenFormModal(false);
    setFormError('');
    setEditingFormId(null);
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

    if (!editingFormId && !formUpload.file) {
      setFormError('Arquivo PDF é obrigatório');
      return;
    }

    if (formUpload.file && formUpload.file.type !== 'application/pdf') {
      setFormError('Formulário não corresponde ao tipo aceito. PDF');
      return;
    }

    if (!user?.id) {
      setFormError('Usuário não identificado');
      return;
    }

    setSavingForm(true);
    try {
      let urlFinal = null;
      if (formUpload.file) {
        urlFinal = await uploadArquivoPDF();
      }

      const payload = {
        nome: nomeLimpo,
        tipo: 'pdf',
        pasta: pastaLimpa,
        subpasta: formUpload.subpasta.trim(),
        usuarioId: user.id,
        ...(urlFinal && { url: urlFinal })
      };

      if (editingFormId) {
        // Editar
        await api.put(`/links/${editingFormId}`, payload);
        setDados(prev => prev.map(item => item.id === editingFormId ? { ...item, ...payload } : item));
      } else {
        // Criar
        const res = await api.post('/links', payload);
        setDados(prev => [...prev, res.data]);
      }

      fecharFormModal();
    } catch (err) {
      console.error('Erro ao salvar formulário:', err.response?.data || err);
      setFormError('Erro ao salvar formulário. Verifique os dados e tente novamente.');
    } finally {
      setSavingForm(false);
    }
  };

  const excluirForm = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja excluir este formulário?')) return;
    try {
      await api.delete(`/links/${itemId}`);
      setDados(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Erro ao excluir formulário:', err);
      alert('Erro ao excluir formulário');
    }
  };

  // 🔥 AGRUPAMENTO
  const agrupado = dados.reduce((acc, item) => {
    if (!acc[item.pasta]) acc[item.pasta] = {};
    const s = item.subpasta || 'root';
    if (!acc[item.pasta][s]) acc[item.pasta][s] = [];
    acc[item.pasta][s].push(item);
    return acc;
  }, {});

  // 🔥 BUSCA
  const dadosDaPasta = dados.filter(item => item.pasta === pasta);

  const resultadosBusca = dadosDaPasta.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // 🔥 ITEM PADRÃO
  const Item = ({ icon: Icon, nome, caminho, onClick, actions, clickable }) => (
    <div
      onClick={clickable ? onClick : undefined}
      className={`flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition ${
        clickable ? 'cursor-pointer hover:bg-slate-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 capitalize">
        <div className="bg-slate-100 p-2 rounded-lg">
          <Icon size={18} className="text-slate-600" />
        </div>

        <div>
          <p className="font-medium text-slate-700">{nome}</p>
          {caminho && (
            <p className="text-xs text-slate-400 capitalize">{caminho}</p>
          )}
        </div>
      </div>

      {actions && (
        <div
          className="flex gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );

  // 🔥 PASTA PRINCIPAL
  if (pasta && !sub) {
    const conteudo = agrupado[pasta] || {};
    const subpastas = Object.keys(conteudo).filter(s => s !== 'root');
    const arquivos = conteudo['root'] || [];

    return (
      <Layout title={pasta}>
        {openFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold">{editingFormId ? 'Editar' : 'Adicionar'} Formulário</h3>
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

                {!editingFormId && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-3">
                      Arquivo PDF <span className="text-red-500">*</span>
                    </label>

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
                )}

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

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Voltar
          </button>
          {isAdminOrMaster && (
            <button
              onClick={() => abrirFormModal(pasta, '')}
              className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Adicionar
            </button>
          )}
        </div>

        <input
          placeholder="Buscar arquivos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full mb-6 p-3 border rounded-xl"
        />

        <div className="space-y-3">

          {busca ? (
            resultadosBusca.map((item) => (
              <Item
                key={item.id}
                icon={FileText}
                nome={item.nome}
                caminho={`${item.pasta}${item.subpasta ? ' / ' + item.subpasta : ''}`}
                clickable
                onClick={() => setPreviewUrl(item.url)}
                actions={
                  <>
                    <Eye
                      onClick={() => setPreviewUrl(item.url)}
                      className="cursor-pointer text-slate-500 hover:text-blue-600"
                    />
                    <FileDown
                      onClick={() => window.open(item.url)}
                      className="cursor-pointer text-slate-500 hover:text-green-600"
                    />
                    {isAdminOrMaster && (
                      <>
                        <Pencil
                          onClick={() => abrirFormModal(null, null, item)}
                          className="cursor-pointer text-slate-500 hover:text-orange-600"
                          size={18}
                        />
                        <Trash2
                          onClick={() => excluirForm(item.id)}
                          className="cursor-pointer text-slate-500 hover:text-red-600"
                          size={18}
                        />
                      </>
                    )}
                  </>
                }
              />
            ))
          ) : (
            <>
              {subpastas.map((s) => (
                <Item
                  key={s}
                  icon={Folder}
                  nome={s}
                  clickable
                  onClick={() => navigate(`/formularios/${pasta}/${s}`)}
                />
              ))}

              {arquivos.map((item) => (
                <Item
                  key={item.id}
                  icon={FileText}
                  nome={item.nome}
                  clickable
                  onClick={() => setPreviewUrl(item.url)}
                  actions={
                    <>
                      <Eye
                        onClick={() => setPreviewUrl(item.url)}
                        className="cursor-pointer text-slate-500 hover:text-blue-600"
                      />
                      <FileDown
                        onClick={() => window.open(item.url)}
                        className="cursor-pointer text-slate-500 hover:text-green-600"
                      />
                      {isAdminOrMaster && (
                        <>
                          <Pencil
                            onClick={() => abrirFormModal(null, null, item)}
                            className="cursor-pointer text-slate-500 hover:text-orange-600"
                            size={18}
                          />
                          <Trash2
                            onClick={() => excluirForm(item.id)}
                            className="cursor-pointer text-slate-500 hover:text-red-600"
                            size={18}
                          />
                        </>
                      )}
                    </>
                  }
                />
              ))}
            </>
          )}

        </div>

        {/* 🔥 MODAL PREVIEW */}
        {previewUrl && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl overflow-hidden shadow-xl flex flex-col">

              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-slate-700">
                  Visualização do PDF
                </h3>

                <button
                  onClick={() => setPreviewUrl(null)}
                  className="text-red-500 font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <iframe
                src={`${previewUrl}#zoom=page-width`}
                className="w-full flex-1"
                title="Preview PDF"
              />

            </div>

          </div>
        )}

      </Layout>
    );
  }

  // 🔥 SUBPASTA
  if (pasta && sub) {
    const itens = agrupado[pasta]?.[sub] || [];

    const itensFiltrados = busca
      ? resultadosBusca.filter(item => item.subpasta === sub)
      : itens;

    return (
      <Layout title={`${pasta} / ${sub}`}>
        {openFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold">{editingFormId ? 'Editar' : 'Adicionar'} Formulário</h3>
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

                {!editingFormId && (
                  <div>
  <label className="text-sm font-semibold text-slate-700 block mb-3">
    Arquivo PDF <span className="text-red-500">*</span>
  </label>

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
                )}

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

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Voltar
          </button>
          {isAdminOrMaster && (
            <button
              onClick={() => abrirFormModal(pasta, sub)}
              className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Adicionar
            </button>
          )}
        </div>

        <input
          placeholder="Buscar arquivos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full mb-6 p-3 border rounded-xl"
        />

        <div className="space-y-3">

          {itensFiltrados.map((item) => (
            <Item
              key={item.id}
              icon={FileText}
              nome={item.nome}
              caminho={`${item.pasta} / ${item.subpasta}`}
              clickable
              onClick={() => setPreviewUrl(item.url)}
              actions={
                <>
                  <Eye
                    onClick={() => setPreviewUrl(item.url)}
                    className="cursor-pointer text-slate-500 hover:text-blue-600"
                  />
                  <FileDown
                    onClick={() => window.open(item.url)}
                    className="cursor-pointer text-slate-500 hover:text-green-600"
                  />
                  {isAdminOrMaster && (
                    <>
                      <Pencil
                        onClick={() => abrirFormModal(null, null, item)}
                        className="cursor-pointer text-slate-500 hover:text-orange-600"
                        size={18}
                      />
                      <Trash2
                        onClick={() => excluirForm(item.id)}
                        className="cursor-pointer text-slate-500 hover:text-red-600"
                        size={18}
                      />
                    </>
                  )}
                </>
              }
            />
          ))}

        </div>

        {/* 🔥 MODAL PREVIEW */}
        {previewUrl && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl overflow-hidden shadow-xl flex flex-col">

              <div className="flex justify-between items-center p-4 border-b ">
                <h3 className="font-bold text-slate-700 ">
                  Visualização do PDF
                </h3>

                <button
                  onClick={() => setPreviewUrl(null)}
                  className="text-red-500 font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <iframe
                src={`${previewUrl}#zoom=page-width`}
                className="w-full flex-1 "
                title="Preview PDF"
              />

            </div>

          </div>
        )}

      </Layout>
    );
  }

  return null;
}

export default Formularios;
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, FileText, FileDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ModalForm from '../components/ModalForm';

function Formularios() {
  const { pasta, sub } = useParams();
  const navigate = useNavigate();
  const { user, authenticated } = useAuth();

  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');

  const carregarDados = async () => {
    try {
      const res = await api.get('/links');
      setDados(res.data.filter(i => i.tipo === 'pdf'));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // 🔥 bloquear scroll quando modal aberto
  useEffect(() => {
    document.body.style.overflow = previewUrl || openFormModal ? 'hidden' : 'auto';
  }, [previewUrl, openFormModal]);

  const abrirFormModal = (item = null) => {
    setEditingItem(item);
    setOpenFormModal(true);
  };

  const fecharFormModal = () => {
    setOpenFormModal(false);
    setEditingItem(null);
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
  ).sort((a, b) => a.nome.localeCompare(b.nome));

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
    const subpastas = Object.keys(conteudo)
      .filter(s => s !== 'root')
      .sort((a, b) => a.localeCompare(b));
    const arquivos = (conteudo['root'] || [])
      .sort((a, b) => a.nome.localeCompare(b.nome));

    return (
      <Layout title={pasta}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Voltar
          </button>
          {isAdminOrMaster && (
            <button
              onClick={() => abrirFormModal(null)}
              className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              <FileDown size={18} className="rotate-180" />
              Adicionar em Lote
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
                          onClick={() => abrirFormModal(item)}
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
                            onClick={() => abrirFormModal(item)}
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
                <h3 className="font-bold text-slate-700">Visualização do PDF</h3>
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

        <ModalForm
          open={openFormModal}
          onClose={fecharFormModal}
          onSuccess={carregarDados}
          initialPasta={pasta}
          initialSubpasta={sub || ''}
          editItem={editingItem}
        />
      </Layout>
    );
  }

  // 🔥 SUBPASTA
  if (pasta && sub) {
    const itens = (agrupado[pasta]?.[sub] || [])
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const itensFiltrados = busca
      ? resultadosBusca.filter(item => item.subpasta === sub)
      : itens;

    return (
      <Layout title={`${pasta} / ${sub}`}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Voltar
          </button>
          {isAdminOrMaster && (
            <button
              onClick={() => abrirFormModal(null)}
              className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              <FileDown size={18} className="rotate-180" />
              Adicionar em Lote
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
                        onClick={() => abrirFormModal(item)}
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
                <h3 className="font-bold text-slate-700 ">Visualização do PDF</h3>
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

        <ModalForm
          open={openFormModal}
          onClose={fecharFormModal}
          onSuccess={carregarDados}
          initialPasta={pasta}
          initialSubpasta={sub}
          editItem={editingItem}
        />
      </Layout>
    );
  }

  return null;
}

export default Formularios;
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
//import axios from 'axios';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, FileText, FileDown, Eye } from 'lucide-react';

function Formularios() {
  const { pasta, sub } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    api.get('/links')
      .then(res => setDados(res.data.filter(i => i.tipo === 'pdf')));
  }, []);

  // 🔥 bloquear scroll quando modal aberto
  useEffect(() => {
    document.body.style.overflow = previewUrl ? 'hidden' : 'auto';
  }, [previewUrl]);

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

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          ← Voltar
        </button>

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

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          ← Voltar
        </button>

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
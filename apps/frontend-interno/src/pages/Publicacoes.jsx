import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Edit, Trash2, AlertCircle, Plus, Search, Calendar, User, ArrowRight, FileText, PlayCircle, Image as ImageIcon } from 'lucide-react';

function highlight(text, search) {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>
    ) : part
  );
}

const TITULOS = { manuais: 'Manuais', 'portal-capacitacao': 'Portal de Capacitação', comunicados: 'Comunicados' };
const SINGULAR = { manuais: 'Manual', 'portal-capacitacao': 'Portal de Capacitação', comunicados: 'Comunicado' };

function Publicacoes() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const { user, authenticated, loading: authLoading } = useAuth();

  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const tipoFormatado = tipo === 'manuais' ? 'Manual' : tipo === 'portal-capacitacao' ? 'Tutoriais' : 'Atualizacoes';
  const isMaster = authenticated && user?.tipo?.toLowerCase() === 'master';
  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');
  const estaCarregando = authLoading || loading;

  useEffect(() => {
    api.get(`/publicacoes?tipo=${tipoFormatado}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setDados(data.sort((a, b) => new Date(b.dtCriacao) - new Date(a.dtCriacao)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar publicações');
        setLoading(false);
      });
  }, [tipoFormatado]);

  const filtrados = dados.filter((item) =>
    `${item.titulo} ${item.descricao}`.toLowerCase().includes(busca.toLowerCase())
  );

  const deletar = async (id) => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${SINGULAR[tipo] || 'item'}?`)) return;
    try {
      await api.delete(`/publicacoes/${id}`);
      setDados(dados.filter(item => item.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  const NewsItem = ({ item }) => {
    const isImage = item.pdfUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.pdfUrl);
    const isVideo = item.pdfUrl && /\.(mp4|webm|ogg)$/i.test(item.pdfUrl);
    const isPdf = item.pdfUrl && /\.pdf$/i.test(item.pdfUrl);

    return (
      <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col overflow-hidden h-full">
        {/* Thumbnail Area */}
        <div 
          className="relative h-48 overflow-hidden cursor-pointer bg-slate-100"
          onClick={() => navigate(`/publicacoes/${tipo}/${item.id}`)}
        >
          {isImage ? (
            <img src={item.pdfUrl} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:text-primary/40 transition-colors">
              {isVideo ? <PlayCircle size={48} /> : isPdf ? <FileText size={48} /> : <ImageIcon size={48} />}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(item.dtCriacao).toLocaleDateString('pt-BR')}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="flex items-center gap-1">
              <User size={12} />
              {item.usuario?.nome?.split(' ')[0] || 'Admin'}
            </span>
          </div>

          <h3 
            className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
            onClick={() => navigate(`/publicacoes/${tipo}/${item.id}`)}
          >
            {highlight(item.titulo, busca)}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
            {highlight(item.descricao, busca)}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <button 
              onClick={() => navigate(`/publicacoes/${tipo}/${item.id}`)}
              className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              LER MAIS <ArrowRight size={14} />
            </button>

            {(isAdminOrMaster || isMaster) && (
              <div className="flex gap-1">
                {isAdminOrMaster && (
                  <button
                    onClick={() => navigate(`/publicacoes/${tipo}/${item.id}/editar`)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {isMaster && (
                  <button
                    onClick={() => deletar(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title={TITULOS[tipo] || 'Publicações'}>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={`Pesquisar em ${TITULOS[tipo] || 'publicações'}...`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {isAdminOrMaster && (
          <button
            onClick={() => navigate(`/publicacoes/${tipo}/novo`)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Novo {SINGULAR[tipo] || 'item'}
          </button>
        )}
      </div>

      {estaCarregando ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : erro ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-bold">{erro}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtrados.map((item) => (
            <NewsItem key={item.id} item={item} />
          ))}
          
          {filtrados.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum resultado encontrado para sua busca.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Publicacoes;
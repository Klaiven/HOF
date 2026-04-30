import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Calendar, User, ArrowLeft, Edit, FileText, Download, PlayCircle, Clock } from 'lucide-react';

function PublicacaoDetalhe() {
  const { id, tipo } = useParams();
  const navigate = useNavigate();
  const { user, authenticated } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const TIPO_DISPLAY = {
    Manual: 'Manual',
    Tutoriais: 'Portal de Capacitação',
    Atualizacoes: 'Comunicado'
  };

  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');

  useEffect(() => {
    api.get(`/publicacoes/${id}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar');
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <Layout title="Carregando">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Buscando conteúdo...</p>
      </div>
    </Layout>
  );

  if (erro || !data) return (
    <Layout title="Erro">
      <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
        <p className="text-red-500 font-bold text-lg">Erro ao carregar a publicação.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline font-bold flex items-center gap-2 mx-auto">
          <ArrowLeft size={18} /> Voltar para a lista
        </button>
      </div>
    </Layout>
  );

  const dataFormatada = new Date(data.dtCriacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const horaFormatada = new Date(data.dtCriacao).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const renderConteudo = (url) => {
    if (!url) return null;
    const urlLower = url.toLowerCase();

    if (urlLower.endsWith('.pdf')) {
      return <iframe src={url} className="w-full h-[700px] border-0 rounded-2xl shadow-inner" title="Visualizador PDF" />;
    }

    const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    if (imgExts.some(ext => urlLower.endsWith(ext))) {
      return (
        <div className="bg-slate-50 p-2 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <img 
            src={url} 
            alt="Conteúdo da publicação" 
            className="max-w-full max-h-[80vh] object-contain rounded-[2rem]" 
          />
        </div>
      );
    }

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
      return <iframe src={embedUrl} className="w-full aspect-video border-0 rounded-[2rem] shadow-lg" allowFullScreen title="Vídeo YouTube" />;
    }

    const videoExts = ['.mp4', '.webm', '.ogg'];
    if (videoExts.some(ext => urlLower.endsWith(ext))) {
      return (
        <video controls className="w-full max-h-[70vh] rounded-[2rem] shadow-lg bg-black">
          <source src={url} type="video/mp4" />
        </video>
      );
    }

    return (
      <div className="w-full p-10 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-500 mb-6 font-bold">Arquivo pronto para visualização externa.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition shadow-xl shadow-primary/20"
        >
          <Download size={20} />
          ABRIR DOCUMENTO
        </a>
      </div>
    );
  };

  return (
    <Layout title={TIPO_DISPLAY[data.tipo] || data.tipo}>
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold transition-all text-xs group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-slate-100 transition-all">
              <ArrowLeft size={16} />
            </div>
            VOLTAR
          </button>

          {isAdminOrMaster && (
            <button
              onClick={() => navigate(`/publicacoes/${tipo}/${id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all text-xs shadow-sm"
            >
              <Edit size={16} />
              EDITAR
            </button>
          )}
        </div>

        <article className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-50">
          {/* Header Banner-like Section */}
          <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary text-[9px] font-black text-white uppercase tracking-wider">
                {TIPO_DISPLAY[data.tipo] || 'Publicação'}
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock size={12} /> {horaFormatada}
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-secondary leading-tight mb-4">
              {data.titulo}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Autor</p>
                  <p className="text-xs font-bold text-slate-700 capitalize">{data.usuario?.nome || 'Administrador'}</p>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Data</p>
                  <p className="text-xs font-bold text-slate-700">{dataFormatada}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 space-y-6">
            {data.descricao && (
              <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-2xl">
                <p className="text-base text-slate-700 font-medium italic leading-relaxed">
                  "{data.descricao}"
                </p>
              </div>
            )}

            <div className="prose prose-slate max-w-none">
              <div className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap font-medium">
                {data.texto}
              </div>
            </div>

            {/* Media Section */}
            {data.pdfUrl && (
              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                    <FileText size={18} />
                  </div>
                  <h2 className="text-lg font-black text-secondary tracking-tight">Conteúdo Adicional</h2>
                </div>
                
                <div className="flex items-center justify-center">
                  {renderConteudo(data.pdfUrl)}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Footer Actions */}
        <div className="flex justify-center py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-primary hover:border-primary rounded-2xl font-black transition-all shadow-sm text-xs"
          >
            <ArrowLeft size={16} />
            VOLTAR PARA A LISTA
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PublicacaoDetalhe;
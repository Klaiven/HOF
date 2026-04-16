import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Link as LinkIcon, FileText, Type, AlignLeft, Tag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function AdminTutorialForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isEdit = !!id;
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    tipo: 'Tutoriais', // 🔥 Padrão alterado
    titulo: '',
    descricao: '',
    texto: '',
    pdfUrl: ''
  });

  // 🔥 carregar dados para edição
  useEffect(() => {
    if (isEdit) {
      api.get(`/publicacoes`)
        .then(res => {
          const item = res.data.find(p => p.id === Number(id));
          if (item) setForm(item);
        });
    }
  }, [id]);

  // 🔥 detectar mídia
  const renderPreview = () => {
    if (!form.pdfUrl) return null;

    const url = form.pdfUrl;

    // 1. YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId =
        url.includes('v=')
          ? url.split('v=')[1]?.split('&')[0]
          : url.split('/').pop();

      return (
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
           <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pré-visualização do YouTube
          </div>
          <iframe
            className="w-full aspect-video"
            src={`https://www.youtube.com/embed/${videoId}`}
            allowFullScreen
          />
        </div>
      );
    }

    // 🔥 VERIFICAÇÃO INTELIGENTE DO BLOB LOCAL
    const isLocalPdf = file && file.type === 'application/pdf' && url.startsWith('blob:');
    const isLocalVideo = file && file.type.startsWith('video/') && url.startsWith('blob:');

    // 2. PDF (Link terminando em .pdf OU Blob de arquivo tipo PDF)
    if (url.toLowerCase().endsWith('.pdf') || isLocalPdf) {
      return (
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
           <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pré-visualização do PDF
          </div>
          <iframe
            src={url}
            className="w-full h-96"
          />
        </div>
      );
    }

    // 3. Vídeo (Link com extensão de vídeo OU Blob de arquivo tipo Vídeo)
    if (url.match(/\.(mp4|webm|ogg)$/i) || isLocalVideo) {
      return (
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pré-visualização de Vídeo
          </div>
          <video controls className="w-full max-h-96 bg-black">
            <source src={url} />
          </video>
        </div>
      );
    }

    return null;
  };

  // 🔥 upload local (preview)
  const handleFile = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    setFile(arquivo);

    const url = URL.createObjectURL(arquivo);

    setForm({
      ...form,
      pdfUrl: url
    });
  };

  const uploadArquivo = async () => {
  if (!file) return form.pdfUrl;

  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post(
    '/publicacoes/upload',
    formData
  );

  return res.data.url;
};

  // 🔥 salvar
  const salvar = async () => {
    try {
      const url = await uploadArquivo();

      const payload = {
        ...form,
        pdfUrl: url,
        usuarioId: user.id
      };

      if (isEdit) {
        await api.put(
          `/publicacoes/${id}`,
          payload
        );
      } else {
        await api.post(
          `/publicacoes`,
          payload
        );
      }

      navigate('/admin');

    } catch (err) {
      console.error('Erro ao salvar', err);
      alert('Erro ao salvar');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
            title="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isEdit ? 'Editar Publicação' : 'Novo Tutorial'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEdit ? 'Modifique as informações do documento abaixo.' : 'Preencha os dados para criar um novo documento no sistema.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA - INFORMAÇÕES TEXTUAIS */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <FileText size={20} className="text-primary" />
              Informações Gerais
            </h2>

            {/* TIPO (edição apenas) */}
            {isEdit && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                   <Tag size={16} /> Categoria
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option>Manual</option>
                  <option>Atualizações</option>
                  <option>Tutoriais</option>
                  <option>Publicações</option>
                </select>
              </div>
            )}

            {/* TÍTULO */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Type size={16} /> Título
              </label>
              <input
                placeholder="Ex: Como configurar a impressora..."
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            {/* DESCRIÇÃO */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <AlignLeft size={16} /> Breve Descrição
              </label>
              <input
                placeholder="Um resumo curto do que se trata..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
              />
            </div>

            {/* TEXTO */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                 Conteúdo Completo
              </label>
              <textarea
                rows={8}
                placeholder="Escreva o passo a passo ou as informações detalhadas aqui..."
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 resize-y"
              />
            </div>
          </div>

          {/* COLUNA DIREITA - MÍDIA E AÇÕES */}
          <div className="space-y-6">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Upload size={20} className="text-primary" />
              Mídia e Anexos
            </h2>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
              
              {/* LINK */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <LinkIcon size={16} /> Link Externo
                </label>
                <input
                  placeholder="Link do YouTube, PDF ou Vídeo"
                  value={form.pdfUrl}
                  onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center justify-center w-full">
                  <div className="w-full border-t border-slate-300"></div>
                  <span className="px-3 text-slate-400 text-xs font-bold uppercase">Ou</span>
                  <div className="w-full border-t border-slate-300"></div>
              </div>

              {/* UPLOAD LOCAL */}
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-600">
                  Upload de Arquivo Local
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="mb-1 text-sm text-slate-500"><span className="font-semibold text-primary">Clique para buscar</span></p>
                        <p className="text-xs text-slate-400">PDF, MP4, WEBM</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,video/*"
                      onChange={handleFile}
                    />
                </label>
              </div>

            </div>

             {/* PREVIEW */}
             {renderPreview()}
          </div>

        </div>

        {/* RODAPÉ DO FORMULÁRIO / AÇÕES */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Save size={20} />
            {isEdit ? 'Salvar Alterações' : 'Publicar Tutorial'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminTutorialForm;
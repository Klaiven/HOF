import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { FileText, X, Upload, AlertCircle, Trash2, PlayCircle, Image as ImageIcon } from 'lucide-react';

function PublicacaoForm() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const TITULOS = { manuais: 'Manual', 'portal-capacitacao': 'Portal de Capacitação', comunicados: 'Comunicado' };
  const TIPO_MAP = { manuais: 'Manual', 'portal-capacitacao': 'Tutoriais', comunicados: 'Atualizacoes' };
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    texto: '',
    pdfUrl: '',
    tipo: TIPO_MAP[tipo] || tipo || ''
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.get(`/publicacoes/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            titulo: data.titulo || '',
            descricao: data.descricao || '',
            texto: data.texto || '',
            pdfUrl: data.pdfUrl || '',
            tipo: data.tipo || tipo || ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Erro ao carregar publicação:', err);
          setError('Erro ao carregar publicação');
          setLoading(false);
        });
    }
  }, [id, tipo, isEditing]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf', 
        'video/mp4', 
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'image/webp'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Apenas arquivos PDF, Vídeos MP4 ou Imagens (JPG, PNG, GIF, WEBP) são permitidos');
        return;
      }
      setFile(selectedFile);
      setError('');

      // Gerar preview usando Blob URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    }
  };

  const removerArquivo = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    setForm({ ...form, pdfUrl: '' });
  };

  const uploadFile = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/publicacoes/upload', formData);
      return res.data.url;
    } catch (err) {
      const errorData = err.response?.data;
      
      // Verifica se o erro é de permissão (EPERM) retornado como HTML ou string
      if (typeof errorData === 'string' && errorData.includes('EPERM')) {
        console.error('Erro de permissão no servidor (EPERM)');
        throw new Error('Erro de permissão no servidor: O sistema não tem permissão para gravar na pasta de uploads. Contate o administrador.');
      }

      console.error('Erro detalhado no upload:', errorData || err.message);
      throw new Error('Erro ao fazer upload do arquivo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.titulo.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!form.texto.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    if (!user?.id) {
      setError('Usuário não identificado');
      return;
    }

    setSaving(true);
    try {
      let finalPdfUrl = form.pdfUrl;

      if (file) {
        finalPdfUrl = await uploadFile();
      }

      const payload = {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        texto: form.texto.trim(),
        tipo: form.tipo,
        pdfUrl: finalPdfUrl,
        usuarioId: user.id
      };

      if (isEditing) {
        await api.put(`/publicacoes/${id}`, payload);
      } else {
        await api.post('/publicacoes', payload);
      }

      navigate(`/publicacoes/${tipo}`);
    } catch (err) {
      console.error('Erro ao salvar publicação:', err);
      setError(err.response?.data?.message || 'Erro ao salvar publicação');
    } finally {
      setSaving(false);
    }
  };

  const renderFilePreview = () => {
    const url = filePreview || form.pdfUrl;
    if (!url) return null;

    const urlLower = url.toLowerCase();
    const isImage = file?.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(urlLower);
    const isVideo = file?.type === 'video/mp4' || /\.mp4$/i.test(urlLower);
    const isPdf = file?.type === 'application/pdf' || /\.pdf$/i.test(urlLower);

    return (
      <div className="relative group w-full max-w-2xl mx-auto mt-4 rounded-3xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
        <div className="min-h-[200px] max-h-[400px] flex items-center justify-center bg-slate-200">
          {isImage ? (
            <img src={url} alt="Preview" className="w-full h-full object-contain" />
          ) : isVideo ? (
            <video src={url} controls className="w-full max-h-[400px]" />
          ) : isPdf ? (
            <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-full h-[400px] border-0" title="PDF Preview" />
          ) : (
            <div className="p-10 text-center">
              <FileText size={48} className="text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Preview indisponível</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              {isImage ? <ImageIcon size={18} /> : isVideo ? <PlayCircle size={18} /> : <FileText size={18} />}
            </div>
            <span className="text-xs font-bold text-slate-700 truncate">
              {file ? file.name : 'Arquivo anexado'}
            </span>
          </div>
          <button
            type="button"
            onClick={removerArquivo}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${isEditing ? 'Editar' : 'Nova'} ${TITULOS[tipo] || 'Publicação'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-secondary">
                {isEditing ? 'Editar' : 'Criar'} {TITULOS[tipo] || 'Publicação'}
              </h1>
              <p className="text-slate-400 mt-1 font-medium">
                {isEditing ? 'Atualize as informações' : 'Preencha os dados abaixo'}
              </p>
            </div>
            <button
              onClick={() => navigate(`/publicacoes/${tipo}`)}
              className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-500"
            >
              <X size={28} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold"
                  placeholder="Ex: Novo Manual de Processos"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Categoria</label>
                {isEditing ? (
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold appearance-none"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Manual">Manual</option>
                    <option value="Tutoriais">Portal de Capacitação</option>
                    <option value="Atualizacoes">Comunicado</option>
                  </select>
                ) : (
                  <div className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-100 text-slate-500 font-bold">
                    {TITULOS[tipo] || 'Publicação'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Descrição Curta</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                placeholder="Uma breve frase sobre do que se trata"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Conteúdo</label>
              <textarea
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                rows={10}
                className="w-full p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium whitespace-pre-wrap leading-relaxed"
                placeholder="Escreva aqui o texto completo da publicação..."
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 ml-1">Mídia Adicional (PDF, Vídeo ou Imagem)</label>
              
              {!file && !form.pdfUrl ? (
                <div className="relative group">
                  <input
                    type="file"
                    accept="application/pdf,video/mp4,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-file"
                  />
                  <label htmlFor="pdf-file" className="block cursor-pointer">
                    <div className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 group-hover:bg-primary/5 group-hover:border-primary transition-all duration-300 text-center">
                      <div className="bg-white text-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                      </div>
                      <p className="text-slate-700 font-bold">Clique ou arraste um arquivo</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, MP4 ou Imagens (Máx 50MB)</p>
                    </div>
                  </label>
                </div>
              ) : (
                renderFilePreview()
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <span className="text-red-600 text-sm font-bold">{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-8 border-t border-slate-50">
              <button
                type="button"
                onClick={() => navigate(`/publicacoes/${tipo}`)}
                className="px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-4 rounded-2xl bg-primary text-white font-black hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    {isEditing ? 'Atualizar Publicação' : 'Publicar Agora'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default PublicacaoForm;
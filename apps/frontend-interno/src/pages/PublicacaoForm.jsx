import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { FileText, X, Upload, AlertCircle } from 'lucide-react';

function PublicacaoForm() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const TITULOS = { manuais: 'Manual', tutoriais: 'Tutorial', atualizacoes: 'Atualização' };
  const TIPO_MAP = { manuais: 'Manual', tutoriais: 'Tutoriais', atualizacoes: 'Atualizacoes' };
  const isEditing = !!id;


    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);

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
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/publicacoes/upload', formData);
      return res.data.url;
    } catch (err) {
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
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                {isEditing ? 'Editar' : 'Criar'} {TITULOS[tipo] || 'Publicação'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isEditing ? 'Atualize as informações da publicação' : 'Preencha os dados da nova publicação'}
              </p>
            </div>
            <button
              onClick={() => navigate(`/publicacoes/${tipo}`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Digite o título da publicação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Manual">Manual</option>
                    <option value="Tutoriais">Tutoriais</option>
                    <option value="Atualizacoes">Atualizações</option>
                  </select>
                ) : (
                  <div className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                    {TIPO_MAP[tipo] || 'Publicação'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Breve descrição da publicação (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Conteúdo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                rows={8}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-vertical"
                placeholder="Digite o conteúdo da publicação..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Arquivo PDF (opcional)
              </label>
              <div className="relative w-full">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-file"
                />
                <label htmlFor="pdf-file" className="block cursor-pointer">
                  <div className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition text-center">
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText size={18} className="text-green-600" />
                        <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                      </div>
                    ) : form.pdfUrl ? (
                      <div className="flex items-center justify-center gap-2">
                        <Upload size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-slate-700">PDF já anexado</span>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                        <span className="text-sm text-slate-600">Clique para anexar um PDF</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/publicacoes/${tipo}`)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    {isEditing ? 'Atualizar' : 'Criar'} Publicação
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
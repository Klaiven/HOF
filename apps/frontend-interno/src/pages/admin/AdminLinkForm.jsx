import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// 🔥 FUNÇÃO PARA LIMPAR O NOME DA PASTA NA URL
const formatarParaUrl = (texto) => {
  if (!texto) return '';
  return texto
    .normalize('NFD') // Separa os caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/[^a-zA-Z0-9]/g, '') // Remove espaços e caracteres especiais
    .toLowerCase(); // Deixa tudo minúsculo
};

function AdminLinkForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEdit = !!id && !isNaN(id);

  const [form, setForm] = useState({
    nome: '',
    tipo: 'pdf',
    url: '',
    pasta: '',
    subpasta: ''
  });

  const [file, setFile] = useState(null);
  const [pastas, setPastas] = useState([]);
  const [subpastas, setSubpastas] = useState([]);

  // 🔒 BLOQUEIO SEM USUÁRIO
  if (!user) {
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        Usuário não autenticado
      </div>
    );
  }

  // 🔥 CARREGAR DADOS
  useEffect(() => {
    api.get('/links')
      .then(res => {
        const data = res.data;

        setPastas([...new Set(data.map(i => i.pasta).filter(Boolean))]);
        setSubpastas([...new Set(data.map(i => i.subpasta).filter(Boolean))]);

        if (isEdit) {
          const item = data.find(i => i.id === Number(id));
          if (item) setForm(item);
        }
      });
  }, [id, isEdit]);

  // 🔥 UPLOAD
  const uploadArquivo = async () => {
    if (!file) return form.url;

    const formData = new FormData();
    
    // 1º - ANEXE OS TEXTOS PRIMEIRO (Usando a formatação limpa para o IIS/Servidor)
    formData.append('pasta', formatarParaUrl(form.pasta));
    formData.append('subpasta', formatarParaUrl(form.subpasta));
    
    // 2º - ANEXE O ARQUIVO POR ÚLTIMO
    formData.append('file', file);

    const res = await api.post(
      '/links/upload',
      formData
    );

    return res.data.url;
  };

  // 🔥 SALVAR
  const salvar = async () => {
    if (!user?.id) {
      alert('Erro: usuário não identificado');
      return;
    }

    if (!form.nome) {
      alert('Nome é obrigatório');
      return;
    }

    if (form.tipo === 'pdf') {
      if (!form.pasta) {
        alert('Pasta é obrigatória');
        return;
      }

      if (!file && !form.url) {
        alert('Envie um arquivo PDF');
        return;
      }
    }

    if (form.tipo === 'link' && !form.url) {
      alert('Informe a URL');
      return;
    }

    try {
      const url = form.tipo === 'pdf'
        ? await uploadArquivo()
        : form.url;

      const payload = {
        nome: form.nome,
        tipo: form.tipo.toLowerCase(),
        url,
        // 🔥 Mantém o nome ORIGINAL no banco (sem formatação, com espaços e especiais)
        pasta: form.tipo === 'pdf' ? form.pasta : '',
        subpasta: form.tipo === 'pdf' ? (form.subpasta || '') : '',
        usuarioId: user.id
      };

      if (isEdit) {
        await api.put(`/links/${id}`, payload);
      } else {
        await api.post('/links', payload);
      }

      navigate('/admin');

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar');
    }
  };

  // 🔥 PREVIEW
  const renderPreview = () => {
    if (form.tipo !== 'pdf') return null;
    if (!file && !form.url) return null;

    const preview = file ? URL.createObjectURL(file) : form.url;

    return (
      <div className="border rounded-xl overflow-hidden">
        <iframe
          src={`${preview}#zoom=page-width`}
          className="w-full h-80"
          title="Preview do PDF"
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 md:mt-10 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-black">
          {isEdit ? 'Editar' : 'Novo'} Formulário
        </h1>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NOME */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Nome *</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full mt-1 p-3 border rounded-xl"
            />
          </div>

          {/* TIPO */}
          <div>
            <label className="text-sm font-semibold">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full mt-1 p-3 border rounded-xl"
            >
              <option value="pdf">PDF</option>
              <option value="link">Link</option>
            </select>
          </div>

          {/* LINK */}
          {form.tipo === 'link' && (
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">URL *</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>
          )}

          {/* PDF */}
          {form.tipo === 'pdf' && (
            <>
              <div>
                <label className="text-sm font-semibold">Pasta *</label>
                <input
                  list="pastas"
                  value={form.pasta}
                  onChange={(e) => setForm({ ...form, pasta: e.target.value })}
                  className="w-full mt-1 p-3 border rounded-xl"
                  placeholder="Ex: Recursos Humanos!"
                />
                <datalist id="pastas">
                  {pastas.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>

              <div>
                <label className="text-sm font-semibold">Subpasta</label>
                <input
                  list="subpastas"
                  value={form.subpasta || ''}
                  onChange={(e) => setForm({ ...form, subpasta: e.target.value })}
                  className="w-full mt-1 p-3 border rounded-xl"
                />
                <datalist id="subpastas">
                  {subpastas.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Arquivo PDF *</label>

                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  <Upload className="mb-2 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    Clique para enviar arquivo
                  </span>

                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                {renderPreview()}
              </div>
            </>
          )}

        </div>

        {/* BOTÃO */}
        <div className="flex justify-end">
          <button
            onClick={salvar}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>

      </div>

    </div>
  );
}

export default AdminLinkForm;
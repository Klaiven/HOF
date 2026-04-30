import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, CheckCircle, AlertCircle, Trash2, UploadCloud } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

function ModalForm({ open, onClose, onSuccess, initialPasta = '', initialSubpasta = '', editItem = null }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]); // Array of { file, nome, pasta, subpasta, progress, status, error, id, url }
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const isEdit = !!editItem;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFiles([{
          file: null,
          nome: editItem.nome || '',
          pasta: editItem.pasta || '',
          subpasta: editItem.subpasta || '',
          progress: 100,
          status: 'idle',
          id: editItem.id,
          url: editItem.url
        }]);
      } else {
        setFiles([]);
      }
      setGeneralError('');
    }
  }, [open, editItem, isEdit]);

  const gerarNomeDoArquivo = (fileName) => {
    return fileName
      .replace('.pdf', '')
      .replace(/[_-]/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  };

  const addFiles = useCallback((selectedFiles) => {
    if (isEdit) return;

    const newFiles = Array.from(selectedFiles)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({
        file: f,
        nome: gerarNomeDoArquivo(f.name),
        pasta: initialPasta,
        subpasta: initialSubpasta,
        progress: 0,
        status: 'idle'
      }));

    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 30) {
        setGeneralError('Limite de 30 itens por envio atingido.');
        return combined.slice(0, 30);
      }
      return combined;
    });
  }, [isEdit, initialPasta, initialSubpasta]);

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileField = (index, field, value) => {
    setFiles(prev => prev.map((f, i) => {
      // Atualiza o item atual
      if (i === index) return { ...f, [field]: value };
      
      // Se for o primeiro item (index 0) e o campo for pasta ou subpasta, propaga para os outros
      if (index === 0 && (field === 'pasta' || field === 'subpasta')) {
        // Só propaga se o item não estiver concluído
        if (f.status !== 'completed') {
          return { ...f, [field]: value };
        }
      }
      
      return f;
    }));
  };

  const uploadFile = async (fileObj, index) => {
    try {
      updateFileField(index, 'status', 'uploading');
      
      let url = fileObj.url;

      if (fileObj.file) {
        const formData = new FormData();
        formData.append('pasta', fileObj.pasta.trim());
        formData.append('subpasta', fileObj.subpasta.trim());
        formData.append('file', fileObj.file);

        const res = await api.post('/links/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            updateFileField(index, 'progress', percentCompleted);
          }
        });
        url = res.data.url;
      }

      updateFileField(index, 'status', 'saving');
      updateFileField(index, 'progress', 95);
      
      const payload = {
        nome: fileObj.nome.trim(),
        tipo: 'pdf',
        url: url,
        pasta: fileObj.pasta.trim(),
        subpasta: fileObj.subpasta.trim(),
        usuarioId: user.id
      };

      if (isEdit) {
        await api.put(`/links/${fileObj.id}`, payload);
      } else {
        await api.post('/links', payload);
      }

      updateFileField(index, 'status', 'completed');
      updateFileField(index, 'progress', 100);
      return true;
    } catch (err) {
      console.error('Erro no upload:', err);
      updateFileField(index, 'status', 'error');
      
      const errorData = err.response?.data;
      if (typeof errorData === 'string' && errorData.includes('EPERM')) {
        updateFileField(index, 'error', 'Erro de permissão no servidor (EPERM)');
      } else {
        updateFileField(index, 'error', err.response?.data?.message || 'Erro ao enviar');
      }
      
      return false;
    }
  };

  const handleSave = async () => {
    if (loading) return;
    setGeneralError('');

    if (files.length === 0) {
      setGeneralError('Selecione pelo menos um arquivo PDF.');
      return;
    }

    const invalid = files.find(f => !f.nome.trim() || !f.pasta.trim());
    if (invalid) {
      setGeneralError('Preencha nome e pasta de todos os itens.');
      return;
    }

    setLoading(true);

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'completed') {
        successCount++;
        continue;
      }
      const success = await uploadFile(files[i], i);
      if (success) successCount++;
    }

    setLoading(false);

    if (successCount === files.length) {
      onSuccess();
      onClose();
    } else {
      setGeneralError('Alguns itens falharam no envio.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-xl font-bold">{isEdit ? 'Editar' : 'Adicionar'} Formulário</h3>
            <p className="text-sm text-slate-500">
              {isEdit ? 'Preencha os dados para atualizar.' : 'Envio em lote (máx. 30 arquivos PDF).'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {!isEdit && files.length < 30 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative"
            >
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
                id="batch-file-input"
              />
              <label htmlFor="batch-file-input" className="block cursor-pointer">
                <div className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition text-center group">
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Clique ou arraste seus PDFs aqui</p>
                  <p className="text-xs text-slate-400 mt-1">Limite de 30 arquivos</p>
                </div>
              </label>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-8">
              {files.map((fileObj, idx) => (
                <div key={idx} className="relative space-y-5 p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary text-white p-2 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item #{idx + 1}</span>
                    </div>
                    {!loading && !isEdit && fileObj.status !== 'completed' && (
                      <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Nome <span className="text-red-500">*</span></label>
                      <input
                        value={fileObj.nome}
                        onChange={(e) => updateFileField(idx, 'nome', e.target.value)}
                        disabled={loading || fileObj.status === 'completed'}
                        className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                        placeholder="Nome do formulário"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Pasta <span className="text-red-500">*</span></label>
                        <input
                          value={fileObj.pasta}
                          onChange={(e) => updateFileField(idx, 'pasta', e.target.value)}
                          disabled={loading || fileObj.status === 'completed'}
                          className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                          placeholder="Pasta principal"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Subpasta</label>
                        <input
                          value={fileObj.subpasta}
                          onChange={(e) => updateFileField(idx, 'subpasta', e.target.value)}
                          disabled={loading || fileObj.status === 'completed'}
                          className="w-full mt-2 p-3 border border-slate-200 rounded-2xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                          placeholder="Subpasta (opcional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(fileObj.status !== 'idle' || loading) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className={fileObj.status === 'error' ? 'text-red-500' : 'text-primary'}>
                          {fileObj.status === 'uploading' ? `Enviando arquivo...` : 
                           fileObj.status === 'saving' ? 'Salvando dados...' : 
                           fileObj.status === 'completed' ? 'Concluído' : 
                           fileObj.error || 'Erro'}
                        </span>
                        <span className="text-slate-500">{fileObj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            fileObj.status === 'error' ? 'bg-red-500' : 
                            fileObj.status === 'completed' ? 'bg-green-500' : 
                            'bg-primary'
                          }`}
                          style={{ width: `${fileObj.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {fileObj.status === 'completed' && (
                    <div className="absolute top-4 right-4 text-green-500">
                      <CheckCircle size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {generalError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {generalError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            {files.some(f => f.status === 'completed') ? 'Fechar' : 'Cancelar'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading || files.length === 0 || files.every(f => f.status === 'completed')}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : isEdit ? 'Salvar' : files.length > 1 ? `Enviar ${files.length} Itens` : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalForm;
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

function ModalUsuarioCeSu({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    ramalTelefone: '',
    email: '',
    setor: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (open) {
      setFormData({
        nomeCompleto: '',
        ramalTelefone: '',
        email: '',
        setor: '',
        descricao: ''
      });
      setErro(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      await api.post('/cesus', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro ao salvar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Criar Usuário CeSu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nome Completo *</label>
            <input
              type="text"
              name="nomeCompleto"
              required
              value={formData.nomeCompleto}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Ramal/Telefone *</label>
            <input
              type="text"
              name="ramalTelefone"
              required
              value={formData.ramalTelefone}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: 2045"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: joao@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Setor *</label>
            <input
              type="text"
              name="setor"
              required
              value={formData.setor}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: TI"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition h-24 resize-none"
              placeholder="Opcional"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalUsuarioCeSu;
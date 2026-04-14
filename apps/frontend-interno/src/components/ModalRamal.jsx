import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api'; // Importa a nossa API com o interceptor de token

function ModalRamal({ open, onClose, onSuccess, ramalEdit }) {
  // 🔥 Novos campos mapeados para a tabela Setores
  const [nome, setNome] = useState('');
  const [subsetor, setSubsetor] = useState('');
  const [ramal, setRamal] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (open) {
      // Se for edição, preenche os campos com os dados existentes
      if (ramalEdit) {
        setNome(ramalEdit.nome || '');
        setSubsetor(ramalEdit.subsetor || '');
        setRamal(ramalEdit.ramal || '');
      } else {
        // Se for novo, limpa o formulário
        setNome('');
        setSubsetor('');
        setRamal('');
      }
      setErro(null);
    }
  }, [open, ramalEdit]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      // Monta o objeto com o novo padrão do backend
      const payload = { nome, subsetor, ramal };

      if (ramalEdit) {
        // Modo Edição (PUT)
        await api.put(`/setores/${ramalEdit.id}`, payload);
      } else {
        // Modo Criação (POST)
        await api.post('/setores', payload);
      }

      onSuccess(); // Recarrega a lista na tabela principal
      onClose();   // Fecha o modal
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro ao salvar. Verifique se tem as permissões corretas (Administrador/Master).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {ramalEdit ? 'Editar Setor/Ramal' : 'Novo Setor/Ramal'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {erro && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Setor (Nome) *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: Recursos Humanos"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Subsetor</label>
            <input
              type="text"
              value={subsetor}
              onChange={(e) => setSubsetor(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: Recrutamento (Opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Ramal (Número)</label>
            <input
              type="text"
              value={ramal}
              onChange={(e) => setRamal(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ex: 2045 (Opcional)"
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
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ModalRamal;
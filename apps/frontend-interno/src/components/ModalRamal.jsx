import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

function ModalRamal({ open, onClose, onSuccess, ramalEdit }) {
  const [form, setForm] = useState({
    numero: '',
    setor: '',
    subsetor: ''
  });

  // 🔥 preencher ao editar
  useEffect(() => {
    if (ramalEdit) {
      setForm(ramalEdit);
    } else {
      setForm({ numero: '', setor: '', subsetor: '' });
    }
  }, [ramalEdit]);

  if (!open) return null;

  // 🔥 salvar (criar ou editar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (ramalEdit) {
        await axios.put(
          `http://localhost:3000/api/ramais/${ramalEdit.id}`,
          form
        );
      } else {
        await axios.post(
          `http://localhost:3000/api/ramais`,
          form
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black">
            {ramalEdit ? 'Editar Ramal' : 'Novo Ramal'}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Setor"
            value={form.setor}
            onChange={(e) =>
              setForm({ ...form, setor: e.target.value.toUpperCase() })
            }
            className="w-full p-3 bg-slate-50 rounded-xl outline-none"
            required
          />

          <input
            placeholder="Subsetor"
            value={form.subsetor}
            onChange={(e) =>
              setForm({ ...form, subsetor: e.target.value.toUpperCase() })
            }
            className="w-full p-3 bg-slate-50 rounded-xl outline-none"
          />

          <input
            placeholder="Número do Ramal"
            value={form.numero}
            onChange={(e) =>
              setForm({ ...form, numero: e.target.value })
            }
            className="w-full p-3 bg-slate-50 rounded-xl outline-none font-mono"
            required
          />

          <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90">
            {ramalEdit ? 'Salvar Alterações' : 'Cadastrar'}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ModalRamal;
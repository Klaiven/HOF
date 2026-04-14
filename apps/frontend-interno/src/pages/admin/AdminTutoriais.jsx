import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import api from '../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminTutoriais() {
  const [tutoriais, setTutoriais] = useState([]);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Tutoriais'); // 🔥 Padrão alterado para Tutoriais

  const navigate = useNavigate();

  // 🔥 Carrega os dados filtrando pelo tipo selecionado no select
  const carregar = async () => {
    try {
      const { data } = await api.get(
        `/publicacoes?tipo=${tipoFiltro}`
      );
      setTutoriais(data);
    } catch (err) {
      console.error('Erro ao carregar tutoriais');
    }
  };

  // 🔥 Recarrega sempre que o tipo no select mudar
  useEffect(() => {
    carregar();
  }, [tipoFiltro]);

  // 🔥 Debounce para a busca por texto
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaInput);
    }, 300);

    return () => clearTimeout(timeout);
  }, [buscaInput]);

  // 🔥 Excluir registro
  const excluir = async (id) => {
    if (!window.confirm('Deseja realmente excluir?')) return;

    try {
      await api.delete(`/publicacoes/${id}`);
      carregar();
    } catch (err) {
      console.error('Erro ao excluir');
    }
  };

  // 🔥 FILTRO: Busca tanto no campo TÍTULO quanto na DESCRIÇÃO
  const filtrados = tutoriais.filter((item) => {
    const termo = busca.toLowerCase();
    return (
      item.titulo?.toLowerCase().includes(termo) ||
      item.descricao?.toLowerCase().includes(termo)
    );
  });

  // 🔥 Highlight (pode ser usado tanto no título quanto na descrição)
  const highlight = (texto) => {
    if (!texto) return '';
    if (!busca) return texto;

    const regex = new RegExp(`(${busca})`, 'gi');
    const partes = texto.toString().split(regex);

    return partes.map((parte, i) =>
      parte.toLowerCase() === busca.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 px-1 rounded">
          {parte}
        </span>
      ) : (
        parte
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">
          Tutoriais
        </h1>

        <button
          onClick={() => navigate('/admin/tutoriais/novo')}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} />
          Novo Tutorial
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={buscaInput}
          onChange={(e) => setBuscaInput(e.target.value)}
          className="w-full md:max-w-md p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
        />

        <button
          onClick={() => {
            setBusca('');
            setBuscaInput('');
          }}
          className="px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300"
        >
          Limpar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Título</th>
              <th className="p-4 text-left">Descrição</th>
              <th className="p-4 text-left">Tipo</th>
              <th className="p-4 text-left">Data</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((item) => (
              <tr key={item.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-medium">
                  {highlight(item.titulo)}
                </td>
                <td className="p-4 text-slate-600">
                  {highlight(item.descricao)}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs">
                    {item.tipo}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-500">
                  {new Date(item.dtCriacao).toLocaleDateString()}
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/tutoriais/${item.id}`)}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => excluir(item.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-6 text-slate-400">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTutoriais;
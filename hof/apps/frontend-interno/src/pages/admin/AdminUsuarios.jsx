import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, UserX, Shield, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');

  const navigate = useNavigate();

  const carregar = async () => {
    try {
      // Ajuste o endpoint caso necessário
      const { data } = await axios.get(`/api/usuarios`);
      setUsuarios(data);
    } catch (err) {
      console.error('Erro ao carregar usuários');
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusca(buscaInput);
    }, 300);
    return () => clearTimeout(timeout);
  }, [buscaInput]);

  const desativar = async (id, nome) => {
    if (!window.confirm(`Deseja realmente desativar o acesso de ${nome}? Ele não será excluído do banco.`)) return;

    try {
      await axios.delete(`/api/usuarios/${id}`);
      carregar();
    } catch (err) {
      console.error('Erro ao desativar');
    }
  };

  const filtrados = usuarios.filter((item) => {
    const termo = busca.toLowerCase();
    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.username?.toLowerCase().includes(termo) ||
      item.setor?.toLowerCase().includes(termo)
    );
  });

  const highlight = (texto) => {
    if (!texto) return '';
    if (!busca) return texto;

    const regex = new RegExp(`(${busca})`, 'gi');
    const partes = texto.toString().split(regex);

    return partes.map((parte, i) =>
      parte.toLowerCase() === busca.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 px-1 rounded">{parte}</span>
      ) : (parte)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">Gerenciar Usuários</h1>
        <button
          onClick={() => navigate('/admin/usuarios/novo')}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome, usuário ou setor..."
          value={buscaInput}
          onChange={(e) => setBuscaInput(e.target.value)}
          className="w-full md:max-w-md p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => { setBusca(''); setBuscaInput(''); }}
          className="px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition"
        >
          Limpar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Setor</th>
              <th className="p-4 text-left">Tipo</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item) => (
              <tr key={item.id} className="border-t hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-800 capitalize">{highlight(item.nome)}</p>
                  <p className="text-xs text-slate-500 lowercase">@{highlight(item.username)}</p>
                </td>
                <td className="p-4 text-slate-600 flex items-center gap-2 mt-2">
                  <Briefcase size={14} className="text-slate-400" />
                  {highlight(item.setor)}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 w-max ${
                    item.tipo.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.tipo.toLowerCase() === 'admin' && <Shield size={12} />}
                    {item.tipo}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/usuarios/${item.id}`)}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => desativar(item.id, item.nome)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                    title="Desativar Acesso"
                  >
                    <UserX size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-6 text-slate-400">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsuarios;
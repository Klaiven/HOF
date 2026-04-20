import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Edit, Trash2, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Usuarios() {
  const { user, authenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const isMaster = authenticated && user?.tipo?.toLowerCase() === 'master';
  const estaCarregando = authLoading || loading;

  // Redirecionar se não for master
  useEffect(() => {
    if (!authLoading && !isMaster) {
      navigate('/');
      return;
    }
  }, [authLoading, isMaster, navigate]);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data || []);
      setErro(null);
    } catch (err) {
      setErro('Erro ao carregar usuários. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMaster) {
      carregarUsuarios();
    }
  }, [isMaster]);

  const filtrados = usuarios.filter((u) =>
    `${u.nome || ''} ${u.username || ''} ${u.cpf || ''}`.toLowerCase().includes(busca.toLowerCase())
  );

  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    // Não permitir excluir o próprio usuário
    if (id === user.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter(item => item.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  // Não renderizar nada se não for master
  if (!isMaster) {
    return null;
  }

  return (
    <Layout title="Gerenciamento de Usuários">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate('/usuarios/novo')}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 shadow-md transition flex items-center gap-2"
        >
          <Plus size={18} />
          Novo usuário
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar usuários por nome, usuário ou CPF..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
      />

      {estaCarregando && <p className="text-center">Carregando...</p>}
      {erro && (
        <p className="text-red-500 text-center flex items-center justify-center gap-2">
          <AlertCircle size={18} />
          {erro}
        </p>
      )}

      {!estaCarregando && !erro && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-secondary mb-2">
                      {usuario.nome}
                    </h3>
                    <p className="text-sm text-muted mb-1">@{usuario.username || 'sem usuário'}</p>
                    <p className="text-sm text-muted mb-2">CPF: {usuario.cpf ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      usuario.tipo === 'Master'
                        ? 'bg-red-100 text-red-800'
                        : usuario.tipo === 'Administrador'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.tipo || 'Usuário'}
                    </span>
                    {usuario.id === user.id && (
                      <span className="inline-block ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Você
                      </span>
                    )}
                    {usuario.setor && (
                      <p className="mt-2 text-xs text-slate-500">Setor: {usuario.setor}</p>
                    )}
                  </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/usuarios/${usuario.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  {usuario.id !== user.id && (
                    <button
                      onClick={() => deletar(usuario.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-auto text-xs text-muted">
                Criado em: {new Date(usuario.createdAt || Date.now()).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}

          {filtrados.length === 0 && (
            <p className="text-muted col-span-full text-center">
              Nenhum usuário encontrado
            </p>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Usuarios;
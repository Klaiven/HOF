import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Edit, Trash2, AlertCircle, Plus } from 'lucide-react';

function highlight(text, search) {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>
    ) : part
  );
}

const TITULOS = { manuais: 'Manuais', tutoriais: 'Tutoriais', atualizacoes: 'Atualizações' };

// Mapeamento para singular
const SINGULAR = { manuais: 'Manual', tutoriais: 'Tutorial', atualizacoes: 'Atualização' };

function Publicacoes() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const { user, authenticated, loading: authLoading } = useAuth();

  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const tipoFormatado = tipo === 'manuais' ? 'Manual' : tipo === 'tutoriais' ? 'Tutoriais' : 'Atualizacoes';
  const isMaster = authenticated && user?.tipo?.toLowerCase() === 'master';
  const isAdminOrMaster = authenticated && (user?.tipo?.toLowerCase() === 'administrador' || user?.tipo?.toLowerCase() === 'master');
  const estaCarregando = authLoading || loading;

  useEffect(() => {
    // Usando a API com interceptor
    api.get(`/publicacoes?tipo=${tipoFormatado}`)
      .then((res) => {
        setDados(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar');
        setLoading(false);
      });
  }, [tipoFormatado]);

  const filtrados = dados.filter((item) =>
    `${item.titulo} ${item.descricao}`.toLowerCase().includes(busca.toLowerCase())
  );

  const deletar = async (id) => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${SINGULAR[tipo] || 'item'}?`)) return;
    try {
      await api.delete(`/publicacoes/${id}`);
      setDados(dados.filter(item => item.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Layout title={TITULOS[tipo] || 'Publicações'}>
      {isAdminOrMaster && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate(`/admin/${tipo}/novo`)}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 shadow-md transition flex items-center gap-2"
          >
            <Plus size={18} />
            Novo {SINGULAR[tipo] || 'item'}
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder={`Buscar ${TITULOS[tipo] || 'publicações'}...`}
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
          {filtrados.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-secondary mb-2">
                    {highlight(item.titulo, busca)}
                  </h3>
                  <p className="text-sm text-muted">
                    {highlight(item.descricao, busca)}
                  </p>
                </div>
                {(isAdminOrMaster || isMaster) && (
                  <div className="flex gap-2">
                    {isAdminOrMaster && (
                      <button
                        onClick={() => navigate(`/admin/${tipo}/${item.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {isMaster && (
                      <button
                        onClick={() => deletar(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <span className="mt-auto text-primary text-sm font-medium cursor-pointer" onClick={() => navigate(`/publicacoes/${tipo}/${item.id}`)}>
                Ver detalhes →
              </span>
            </div>
          ))}
          {filtrados.length === 0 && <p className="text-muted col-span-full text-center">Nenhum resultado encontrado</p>}
        </div>
      )}
    </Layout>
  );
}

export default Publicacoes;
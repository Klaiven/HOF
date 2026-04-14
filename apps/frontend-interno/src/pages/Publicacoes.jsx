import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

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

function Publicacoes() {
  const { tipo } = useParams();
  const navigate = useNavigate();

  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const tipoFormatado = tipo === 'manuais' ? 'Manual' : tipo === 'tutoriais' ? 'Tutoriais' : 'Atualizacoes';

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

  return (
    <Layout title={TITULOS[tipo] || 'Publicações'}>
      <input
        type="text"
        placeholder={`Buscar ${TITULOS[tipo] || 'publicações'}...`}
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
      />

      {loading && <p className="text-center">Carregando...</p>}
      {erro && <p className="text-red-500 text-center">{erro}</p>}

      {!loading && !erro && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/publicacoes/${tipo}/${item.id}`)}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition flex flex-col cursor-pointer"
            >
              <h3 className="text-base font-semibold text-secondary mb-2">
                {highlight(item.titulo, busca)}
              </h3>
              <p className="text-sm text-muted flex-grow">
                {highlight(item.descricao, busca)}
              </p>
              <span className="mt-4 text-primary text-sm font-medium">
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
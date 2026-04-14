import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

function highlight(text, search) {
  if (!text || !search) return text || '';
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>
    ) : part
  );
}

function Ramais() {
  const [busca, setBusca] = useState('');
  const [ramais, setRamais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // 🔥 Agora busca na rota de setores
    api.get('/setores')
      .then(res => {
        setRamais(res.data);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar ramais');
        setLoading(false);
      });
  }, []);

  const filtrados = ramais.filter((r) =>
    `${r.ramal || ''} ${r.nome || ''} ${r.subsetor || ''}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <Layout title="Ramais">
      <input
        type="text"
        placeholder="Buscar por número, setor ou subsetor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
      />

      {loading && <p className="text-center text-muted">Carregando...</p>}
      {erro && <p className="text-center text-red-500">{erro}</p>}

      {!loading && !erro && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
          {filtrados.map((ramal) => (
            <div key={ramal.id} className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition">
              <p className="text-lg font-bold text-primary">
                {highlight(ramal.ramal || 'Sem número', busca)}
              </p>
              <p className="text-sm text-secondary font-semibold">
                {highlight(ramal.nome, busca)}
              </p>
              <p className="text-xs text-muted">
                {highlight(ramal.subsetor, busca)}
              </p>
            </div>
          ))}
          {filtrados.length === 0 && <p className="text-muted col-span-full text-center">Nenhum ramal encontrado</p>}
        </div>
      )}
    </Layout>
  );
}

export default Ramais;
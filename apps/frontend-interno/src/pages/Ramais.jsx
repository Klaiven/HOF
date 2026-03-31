import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function highlight(text, search) {
  if (!search) return text;

  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 px-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
}


function Ramais() {
  const [busca, setBusca] = useState('');
  const [ramais, setRamais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/ramais')
      .then(res => res.json())
      .then(data => {
        setRamais(data);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar ramais');
        setLoading(false);
      });
  }, []);

  const filtrados = ramais.filter((r) =>
    `${r.numero} ${r.setor} ${r.subsetor}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <Layout title="Ramais">

      {/* BUSCA */}
      <input
        type="text"
        placeholder="Buscar por número, setor ou subsetor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
      />

      {/* LOADING */}
      {loading && (
        <p className="text-center text-muted">Carregando...</p>
      )}

      {/* ERRO */}
      {erro && (
        <p className="text-center text-red-500">{erro}</p>
      )}

      {/* LISTA */}
      {!loading && !erro && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">

          {filtrados.map((ramal) => (
            <div
              key={ramal.id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
            >
              <p className="text-lg font-bold text-primary">
                {highlight(ramal.numero, busca)}
              </p>

              <p className="text-sm text-secondary font-semibold">
                {highlight(ramal.setor, busca)}
              </p>

              <p className="text-xs text-muted">
                {highlight(ramal.subsetor, busca)}
              </p>
            </div>
          ))}

          {filtrados.length === 0 && (
            <p className="text-muted col-span-full text-center">
              Nenhum ramal encontrado
            </p>
          )}

        </div>
      )}

    </Layout>
  );
}

export default Ramais;
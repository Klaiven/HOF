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

function Atualizacoes() {
  const [busca, setBusca] = useState('');
  const [Atualizacoes, setAtualizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/publicacoes?tipo=Atualizacoes')
      .then(res => res.json())
      .then(data => {
        setAtualizacoes(data);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar Atualizacoes');
        setLoading(false);
      });
  }, []);

  const filtrados = Atualizacoes.filter((m) =>
    `${m.titulo} ${m.descricao}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <Layout title="Atualizacoes">

      <input
        type="text"
        placeholder="Buscar manual..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
      />

      {loading && <p className="text-center">Carregando...</p>}
      {erro && <p className="text-red-500 text-center">{erro}</p>}

      {!loading && !erro && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filtrados.map((manual) => (
            <a
              key={manual.id}
              href={manual.pdfUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition flex flex-col"
            >
              <h3 className="text-base font-semibold text-secondary mb-2">
                {highlight(manual.titulo, busca)}
              </h3>

              <p className="text-sm text-muted flex-grow">
                {highlight(manual.descricao, busca)}
              </p>

              <span className="mt-4 text-primary text-sm font-medium">
                Abrir documento →
              </span>
            </a>
          ))}

          {filtrados.length === 0 && (
            <p className="text-muted col-span-full text-center">
              Nenhum manual encontrado
            </p>
          )}

        </div>
      )}

    </Layout>
  );
}

export default Atualizacoes;
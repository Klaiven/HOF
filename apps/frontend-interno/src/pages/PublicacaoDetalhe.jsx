import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

function PublicacaoDetalhe() {
  const { id, tipo } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/publicacoes/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Layout title="Carregando"><p className="text-center">Carregando...</p></Layout>;
  if (erro || !data) return <Layout title="Erro"><p className="text-center text-red-500">Erro ao carregar</p></Layout>;

  const dataFormatada = new Date(data.dtCriacao).toLocaleString();

  return (
    <Layout title={data.tipo}>

      <div className="bg-white rounded-2xl shadow p-6 md:p-10">

        <h1 className="text-2xl md:text-3xl font-black text-secondary mb-4">
          {data.titulo}
        </h1>

        <div className="text-sm text-slate-500 mb-6 flex flex-col md:flex-row md:gap-6">
          <span>📅 {dataFormatada}</span>
          <span>👤 {data.usuario?.nome || 'Usuário'}</span>
        </div>

        {data.descricao && (
          <p className="text-slate-600 mb-6 italic">
            {data.descricao}
          </p>
        )}

        <div className="prose max-w-none">
          {data.texto?.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {data.pdfUrl && (
          <div className="mt-10">

            <h2 className="text-lg font-bold mb-4">
              Conteúdo adicional
            </h2>

            <div className="w-full h-[500px] rounded-xl overflow-hidden border">

              {data.pdfUrl.endsWith('.pdf') && (
                <iframe src={data.pdfUrl} className="w-full h-full" />
              )}

              {data.pdfUrl.includes('youtube') && (
                <iframe
                  src={data.pdfUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}

              {!data.pdfUrl.endsWith('.pdf') &&
                !data.pdfUrl.includes('youtube') && (
                <video src={data.pdfUrl} controls className="w-full h-full" />
              )}

            </div>

          </div>
        )}

      </div>

    </Layout>
  );
}

export default PublicacaoDetalhe;
import React, { useEffect, useState } from 'react';
import {
  Phone, FileText, BookOpen, Megaphone, Lock, Globe, Folder, FileDown, Eye, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  // 🔥 carregar dados
  useEffect(() => {
    axios.get('/api/links')
      .then(res => {
        const data = res.data;

        setLinks(data.filter(i => i.tipo === 'link'));
        setPdfs(data.filter(i => i.tipo === 'pdf'));
      });
  }, []);

  const menu = [
    { nome: 'Ramais', icon: Phone, rota: '/ramais' },
    { nome: 'Manuais', icon: FileText, rota: '/publicacoes/manuais' },
    { nome: 'Tutoriais', icon: BookOpen, rota: '/publicacoes/tutoriais' },
    { nome: 'Atualizações', icon: Megaphone, rota: '/publicacoes/atualizacoes' },
    { nome: 'Login', icon: Lock, rota: '/login' }
  ];

  // 🔥 AGRUPAMENTO PDFs
  const agrupado = pdfs.reduce((acc, item) => {
    if (!acc[item.pasta]) acc[item.pasta] = {};

    const sub = item.subpasta || 'root';

    if (!acc[item.pasta][sub]) acc[item.pasta][sub] = [];

    acc[item.pasta][sub].push(item);

    return acc;
  }, {});

  return (
    <Layout title="Sistema Interno">

      {/* ACESSO RÁPIDO */}
      <h2 className="text-lg md:text-2xl font-bold text-secondary mb-6">
        Acesso rápido
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-10">
        {menu.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(item.rota)}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
            >
              <div className="bg-primary text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
                <Icon size={24} />
              </div>

              <span className="font-semibold text-secondary">
                {item.nome}
              </span>
            </div>
          );
        })}
      </div>

      {/* 🔥 LINKS EXTERNOS */}
      <h2 className="text-lg md:text-2xl font-bold text-secondary mb-6">
        Links Externos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-10">

        {links.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
            <X size={28} className="text-gray-400 mb-2" />
            <span className="text-gray-400 text-sm">Sem link</span>
          </div>
        )}

        {links.map((item) => (
          <div
            key={item.id}
            onClick={() => window.open(item.url, '_blank')}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer min-h-[150px]"
          >
            <div className="bg-blue-500 text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
              <Globe size={24} />
            </div>

            <span className="text-sm font-semibold text-secondary capitalize">
              {item.nome}
            </span>
          </div>
        ))}

      </div>

      <h2 className="text-lg md:text-2xl font-bold text-secondary mb-6">
  Formulários personalizados
</h2>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">

  {Object.keys(agrupado).length === 0 && (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center min-h-[150px] ">
      <X size={28} className="text-gray-400 mb-2" />
      <span className="text-gray-400 text-sm">Sem formulários</span>
    </div>
  )}

  {Object.keys(agrupado).map((pasta) => (
      <div
        key={pasta}
        onClick={() => navigate(`/formularios/${pasta}`)}
        className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer min-h-[150px]"
      >
        <div className="bg-yellow-500 text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
          <Folder size={24} />
        </div>

          <span className="text-sm font-semibold text-secondary capitalize">
            {pasta}
          </span>
            </div>
          ))}

        </div>

    </Layout>
  );
}

export default Home;
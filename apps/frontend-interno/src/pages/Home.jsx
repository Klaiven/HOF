import React from 'react';
import {
  Phone,
  FileText,
  BookOpen,
  Megaphone,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function Home() {
  const navigate = useNavigate();

  const menu = [
    { nome: 'Ramais', icon: Phone, rota: '/ramais' },
    { nome: 'Manuais', icon: FileText, rota: 'publicacoes/manuais' },
    { nome: 'Tutoriais', icon: BookOpen, rota: 'publicacoes/tutoriais' },
    { nome: 'Atualizações', icon: Megaphone, rota: 'publicacoes/atualizacoes' },
    { nome: 'Login', icon: Lock, rota: '/login' }
  ];

  return (
    <Layout title="Sistema Interno">

      <h2 className="text-lg md:text-2xl font-bold text-secondary mb-6">
        Acesso rápido
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">

        {menu.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(item.rota)}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer min-h-[150px]"
            >
              <div className="bg-primary text-white w-14 h-14 flex items-center justify-center rounded-xl mb-3">
                <Icon size={24} />
              </div>

              <span className="text-sm md:text-base font-semibold text-secondary">
                {item.nome}
              </span>
            </div>
          );
        })}

      </div>

    </Layout>
  );
}

export default Home;
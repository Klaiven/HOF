import React, { useState } from 'react';
import LayoutAdmin from '../components/LayoutAdmin';
import { useNavigate } from 'react-router-dom';

import AdminRamais from './admin/AdminRamais';
import AdminManuais from './admin/AdminManuais';
import AdminTutoriais from './admin/AdminTutoriais';
import AdminAtualizacoes from './admin/AdminAtualizacoes';
import AdminUsuarios from './admin/AdminUsuarios';

function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('ramais');
  const navigate = useNavigate();

  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'ramais':
        return <AdminRamais />;

      case 'manuais':
        return <AdminManuais />;

      case 'tutoriais':
        return <AdminTutoriais />;

      case 'atualizacoes':
        return <AdminAtualizacoes />;

      case 'usuarios':
        return <AdminUsuarios />;

      case 'inicio':
        navigate('/');
      break;

      default:
        return <p>Bem-vindo ao painel administrativo</p>;
    }
  };

  return (
    <LayoutAdmin abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva}>
      
      <h1 className="text-2xl font-black mb-6">
        {abaAtiva.toUpperCase()}
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        {renderConteudo()}
      </div>

    </LayoutAdmin>
  );
}

export default Admin;
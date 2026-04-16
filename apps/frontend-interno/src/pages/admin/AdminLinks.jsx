import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import api from '../../services/api';
import { Pencil, Trash2, Folder, FileText, Globe, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminLinks() {
  const [dados, setDados] = useState([]);
  const navigate = useNavigate();

  const carregar = async () => {
    try {
      console.log('Carregando links...');
      const res = await api.get('/links');
      console.log('Links carregados:', res.data);
      setDados(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      alert('Erro ao carregar documentos: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const excluir = async (id) => {
    if (!window.confirm('Deseja excluir?')) return;
    try {
      await api.delete(`/links/${id}`);
      carregar();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir: ' + (error.response?.data?.message || error.message));
    }
  };

  const linksExternos = dados.filter(i => i.tipo === 'link');
  const pdfs = dados.filter(i => i.tipo === 'pdf');

  const agrupado = pdfs.reduce((acc, item) => {
    if (!acc[item.pasta]) acc[item.pasta] = {};
    const sub = item.subpasta || 'root';
    if (!acc[item.pasta][sub]) acc[item.pasta][sub] = [];
    acc[item.pasta][sub].push(item);
    return acc;
  }, {});

  // 🔥 ITEM PADRÃO
  const Item = ({ icon: Icon, nome, item }) => (
    <div className="group flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition">

      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg">
          <Icon size={16} className="text-slate-600" />
        </div>

        <span className="text-sm font-medium text-slate-700 capitalize">
          {nome}
        </span>
      </div>

      {/* AÇÕES */}
      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
        <Pencil
          onClick={() => navigate(`/admin/links/${item.id}`)}
          className="cursor-pointer text-blue-600 hover:scale-110 transition"
          size={16}
        />
        <Trash2
          onClick={() => excluir(item.id)}
          className="cursor-pointer text-red-500 hover:scale-110 transition"
          size={16}
        />
      </div>

    </div>
  );

  return (
    <div className="space-y-8">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-black text-slate-800">
          Formulários personalizados
        </h1>

        <button
          onClick={() => navigate('/admin/links/novo')}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={18} />
          Novo item
        </button>

      </div>

      {/* 🔗 LINKS EXTERNOS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

        <div className="flex items-center gap-2 mb-5">
          <Globe className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-slate-800">
            Links externos
          </h2>
        </div>

        <div className="space-y-2">
          {linksExternos.length === 0 && (
            <p className="text-sm text-slate-400">
              Nenhum link cadastrado
            </p>
          )}

          {linksExternos.map(item => (
            <Item
              key={item.id}
              icon={Globe}
              nome={item.nome}
              item={item}
            />
          ))}
        </div>

      </div>

      {/* 📄 FORMULÁRIOS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

        <div className="flex items-center gap-2 mb-5">
          <FileText className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-slate-800">
            Formulários personalizados
          </h2>
        </div>

        <div className="space-y-6">

          {Object.entries(agrupado).map(([pasta, subs]) => (
            <div key={pasta}>

              {/* PASTA */}
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3 capitalize">
                <Folder size={18} className="text-yellow-500 " />
                {pasta}
              </div>

              <div className="ml-4 space-y-4 border-l border-slate-100 pl-4">

                {Object.entries(subs).map(([sub, itens]) => (
                  <div key={sub}>

                    {/* SUBPASTA */}
                    {sub !== 'root' && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2 capitalize">
                        <Folder size={16} className="text-slate-400" />
                        {sub}
                      </div>
                    )}

                    {/* ARQUIVOS */}
                    <div className="space-y-2 ml-2 capitalize">
                      {itens.map(item => (
                        <Item
                          key={item.id}
                          icon={FileText}
                          nome={item.nome}
                          item={item}
                        />
                      ))}
                    </div>

                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default AdminLinks;
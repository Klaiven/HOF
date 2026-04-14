import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import ModalRamal from '../../components/ModalRamal';

function AdminRamais() {
  const [ramais, setRamais] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [ramalEdit, setRamalEdit] = useState(null);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [setorFiltro, setSetorFiltro] = useState('');
  
  // Como os setores agora se chamam "nome" na tabela
  const setoresUnicos = [...new Set(ramais.map(r => r.nome))];

  const carregarRamais = async () => {
    try {
      // 🔥 Rota atualizada para /setores
      const { data } = await api.get('/setores');
      setRamais(data);
    } catch (err) {
      console.error('Erro ao carregar ramais');
    }
  };

  const highlight = (texto) => {
    if (!texto || !busca) return texto || '';
    const regex = new RegExp(`(${busca})`, 'gi');
    const partes = String(texto).split(regex);
    return partes.map((parte, i) =>
      parte.toLowerCase() === busca.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 px-1 rounded">{parte}</span>
      ) : parte
    );
  };

  useEffect(() => { carregarRamais(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => { setBusca(buscaInput); }, 300);
    return () => clearTimeout(timeout);
  }, [buscaInput]);

  const excluirRamal = async (id) => {
    if (!window.confirm('Deseja realmente excluir?')) return;
    try {
      await api.delete(`/setores/${id}`);
      carregarRamais();
    } catch (err) {
      console.error("ERRO AO EXCLUIR:", err.response || err);
    }
  };

  const ramaisFiltrados = ramais.filter((ramal) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      (ramal.nome || '').toLowerCase().includes(termo) ||
      (ramal.subsetor || '').toLowerCase().includes(termo) ||
      (ramal.ramal || '').toString().includes(termo);

    const matchSetor = setorFiltro ? ramal.nome === setorFiltro : true;
    return matchBusca && matchSetor;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">Setores / Ramais</h1>
        <button
          onClick={() => { setRamalEdit(null); setOpenModal(true); }}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} /> Adicionar
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
            type="text"
            placeholder="Buscar por setor, subsetor ou ramal..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            className="w-full md:max-w-md p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value)}
            className="p-3 bg-white border border-slate-200 rounded-xl outline-none"
        >
            <option value="">Todos os setores</option>
            {setoresUnicos.map((setor, i) => (
            <option key={i} value={setor}>{setor}</option>
            ))}
        </select>
        <button
            onClick={() => { setBusca(''); setBuscaInput(''); setSetorFiltro(''); }}
            className="px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300"
        > Limpar </button>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Setor</th>
              <th className="p-4 text-left">Subsetor</th>
              <th className="p-4 text-left">Ramal</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ramaisFiltrados.map((ramal) => (
              <tr key={ramal.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-medium">{highlight(ramal.nome)}</td>
                <td className="p-4">{highlight(ramal.subsetor)}</td>
                <td className="p-4 font-mono font-bold">{highlight(ramal.ramal)}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => { setRamalEdit(ramal); setOpenModal(true); }} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"><Pencil size={16} /></button>
                  <button onClick={() => excluirRamal(ramal.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {ramaisFiltrados.length === 0 && (
              <tr><td colSpan="4" className="text-center p-6 text-slate-400">Nenhum ramal encontrado</td></tr>
            )}
          </tbody>
        </table>
        <ModalRamal open={openModal} onClose={() => setOpenModal(false)} onSuccess={carregarRamais} ramalEdit={ramalEdit} />
      </div>
    </div>
  );
}

export default AdminRamais;
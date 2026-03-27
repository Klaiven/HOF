import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Phone, FileText, Plus, LogOut, Trash2, CheckCircle, AlertCircle, LayoutDashboard } from 'lucide-react';
import axios from 'axios';

function Admin() {
  const { user, logout } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('ramais'); // 'ramais' ou 'publicacoes'
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Estados para os formulários
  const [ramalForm, setRamalForm] = useState({ numero: '', setor: '', subsetor: '' });
  const [pubForm, setPubForm] = useState({ tipo: 'MANUAL', titulo: '', descricao: '', texto: '', pdfUrl: '' });

  // Função para exibir alertas temporários
  const mostrarAlerta = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000);
  };

  const salvarRamal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/ramais', ramalForm);
      mostrarAlerta("Ramal cadastrado com sucesso!", "sucesso");
      setRamalForm({ numero: '', setor: '', subsetor: '' });
    } catch (err) {
      mostrarAlerta("Erro ao salvar ramal. Verifique a conexão.", "erro");
    }
  };

  const salvarPublicacao = async (e) => {
    e.preventDefault();
    try {
      // O backend precisa do usuarioId, que pegamos do hook useAuth
      await axios.post('http://localhost:3000/api/publicacoes', { ...pubForm, usuarioId: user.id });
      mostrarAlerta("Publicação enviada com sucesso!", "sucesso");
      setPubForm({ tipo: 'MANUAL', titulo: '', descricao: '', texto: '', pdfUrl: '' });
    } catch (err) {
      mostrarAlerta("Erro ao salvar publicação.", "erro");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR LATERAL */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="text-primary" size={20} />
            <h2 className="font-black text-slate-800 tracking-tight uppercase">Painel HOF</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gestão Interna</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setAbaAtiva('ramais')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${abaAtiva === 'ramais' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Phone size={18} /> Ramais
          </button>
          <button 
            onClick={() => setAbaAtiva('publicacoes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${abaAtiva === 'publicacoes' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText size={18} /> Publicações
          </button>
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
              {user?.nome?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-800">{user?.nome}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user?.setor}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-grow p-10 overflow-y-auto">
        
        {/* ALERTAS */}
        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-bounce ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensagem.tipo === 'sucesso' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {mensagem.texto}
          </div>
        )}

        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">
            Gerenciar {abaAtiva === 'ramais' ? 'Ramais' : 'Publicações'}
          </h1>
          <p className="text-slate-500 font-medium">Cadastre novas informações para a rede interna do hospital.</p>
        </header>

        {/* CONTEÚDO DINÂMICO */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          
          {abaAtiva === 'ramais' ? (
            <form onSubmit={salvarRamal} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Setor Principal</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Ex: RADIOLOGIA"
                    value={ramalForm.setor}
                    onChange={(e) => setRamalForm({...ramalForm, setor: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Subsetor</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Ex: RECEPÇÃO"
                    value={ramalForm.subsetor}
                    onChange={(e) => setRamalForm({...ramalForm, subsetor: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Número do Ramal</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono text-xl font-bold"
                  placeholder="2026"
                  value={ramalForm.numero}
                  onChange={(e) => setRamalForm({...ramalForm, numero: e.target.value})}
                  required
                />
              </div>
              <button className="bg-primary text-white font-black px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all">Salvar Ramal</button>
            </form>
          ) : (
            <form onSubmit={salvarPublicacao} className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Tipo</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    value={pubForm.tipo}
                    onChange={(e) => setPubForm({...pubForm, tipo: e.target.value})}
                  >
                    <option value="MANUAL">MANUAL</option>
                    <option value="TUTORIAL">TUTORIAL</option>
                    <option value="ATUALIZACAO">ATUALIZAÇÃO</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Título</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Título do documento"
                    value={pubForm.titulo}
                    onChange={(e) => setPubForm({...pubForm, titulo: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Descrição Curta</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Resumo em uma linha"
                  value={pubForm.descricao}
                  onChange={(e) => setPubForm({...pubForm, descricao: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Texto Completo</label>
                <textarea 
                  rows={4}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Escreva o conteúdo aqui..."
                  value={pubForm.texto}
                  onChange={(e) => setPubForm({...pubForm, texto: e.target.value})}
                />
              </div>
              <button className="bg-primary text-white font-black px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all">Publicar Agora</button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}

export default Admin;
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false); // <--- Adicionado aqui
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true); // Ativa o estado de carregamento

    try {
      console.log("Tentando login...");
      await login(username, senha);
      
      console.log("Login OK! Redirecionando...");
      // O replace: true evita que o usuário volte para o login ao clicar no botão "voltar" do navegador
      navigate("/admin", { replace: true }); 
      
    } catch (err) {
      console.error("Erro no login:", err);
      setErro(err.message || "Usuário ou senha inválidos");
      setCarregando(false); // Desativa o carregamento para o usuário tentar de novo
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans text-slate-900">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl p-10 border border-slate-100">
        
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-[24px] mb-6 text-blue-600">
            <Lock size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Login</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Painel Administrativo HOF</p>
        </header>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-pulse">
            <AlertCircle size={18} /> {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CAMPO USUÁRIO */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Usuário</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                placeholder="Seu username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

          {/* CAMPO SENHA */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

          {/* BOTÃO ENTRAR */}
          <button 
            type="submit" 
            disabled={carregando}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 mt-8 ${carregando ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {carregando ? "Autenticando..." : "Entrar no Painel"}
            {!carregando && <ArrowRight size={20} />}
          </button>
        </form>

        <footer className="mt-10 text-center border-t border-slate-50 pt-6">
          <a href="/" className="text-sm text-slate-400 hover:text-blue-600 transition-colors font-bold">
            ← Voltar para Consulta
          </a>
        </footer>
      </div>
    </div>
  );
}

export default Login;
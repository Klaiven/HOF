import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação dos campos
    if (!form.username.trim() || !form.senha.trim()) {
      setErro('Preencha todos os campos');
      return;
    }

    setCarregando(true);
    setErro('');
    
    try {
      await login(form.username, form.senha);
      navigate('/admin');
    } catch (err) {
      console.error('Erro de login:', err);
      setErro(err.response?.data?.message || 'Usuário ou senha inválidos');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-400 text-sm">Acesso restrito</p>
        </div>

        {erro && (
          <div className="mb-4 text-red-500 text-sm font-bold">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            placeholder="Usuário"
            className="w-full p-4 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary outline-none"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9._]/g, '') })}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full p-4 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary outline-none"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
          />

          <button 
            disabled={carregando}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn size={18} />
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;
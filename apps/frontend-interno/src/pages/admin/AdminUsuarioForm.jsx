import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Lock, Briefcase, Shield, Fingerprint } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function AdminUsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const token = localStorage.getItem('token');

  const isEdit = !!id;

  const [form, setForm] = useState({
    nome: '',
    username: '',
    cpf: '',
    senha: '',
    tipo: 'Comum',
    setor: 'TI' // 🔥 Agora tem um valor padrão válido
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/usuarios`)
        .then(res => {
          const item = res.data.find(u => u.id === Number(id));
          if (item) {
            setForm({ ...item, senha: '' });
          }
        });
    }
  }, [id]);

  // 🔥 MÁSCARA DE CPF: Mostra pontuação enquanto digita, mas limita a 11 números
  const handleCpfChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    
    if (valor.length <= 11) {
      // Aplica a máscara: 000.000.000-00
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setForm({ ...form, cpf: valor });
    }
  };

  // 🔥 VALIDAÇÃO E SUBMISSÃO
  const salvar = async () => {
    // 1. Limpar o CPF para enviar APENAS os 11 números para o banco
    const cpfLimpo = form.cpf.replace(/\D/g, '');

    // 2. Verificar se há campos vazios
    if (!form.nome || !form.username || !cpfLimpo || !form.setor || !form.tipo) {
      return alert('Por favor, preencha todos os campos obrigatórios.');
    }

    // 3. Verificar regra dos 11 dígitos do CPF
    if (cpfLimpo.length !== 11) {
      return alert('O CPF deve conter exatamente 11 números válidos.');
    }

    // 4. Verificar regra da senha (mínimo 4 caracteres)
    if (!isEdit && form.senha.length < 4) {
      return alert('A senha deve ter no mínimo 4 caracteres.');
    }
    if (isEdit && form.senha && form.senha.length < 4) {
      return alert('A nova senha deve ter no mínimo 4 caracteres.');
    }

    try {
      // Monta o objeto que vai pro banco com o CPF limpo
      const payload = {
        ...form,
        cpf: cpfLimpo
      };

      if (isEdit) {
        // Na edição, se a senha estiver vazia, removemos do payload para não apagar a atual
        if (!payload.senha) delete payload.senha;
        await api.put(`/usuarios/${id}`, payload);
      } else {
        await api.post(`/usuarios`, {
          ...payload,
          criadoPorId: user.id
        });
      }
      
      navigate('/admin'); 
    } catch (err) {
      console.error('Erro ao salvar', err);
      alert('Erro ao salvar usuário. Verifique se o Username já está em uso.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEdit ? 'Atualize as credenciais e permissões.' : 'Crie um novo acesso ao sistema.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* NOME */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 capitalize">
              <User size={16} /> Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Ex: João da Silva..."
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none capitalize"
            />
          </div>

          {/* USERNAME */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <User size={16} /> Username de Login <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Ex: joao.silva"
              value={form.username}
              // 🔥 Expressão Regular (.replace) impede que o usuário digite espaços
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value
                    .toLowerCase()
                    .replace(/\s/g, '')
                    .replace(/[^a-z0-9._]/g, '')
                })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Fingerprint size={16} /> CPF <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleCpfChange} // 🔥 Usa a máscara
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          {/* SETOR - AGORA É UM SELECT */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Briefcase size={16} /> Setor <span className="text-red-500">*</span>
            </label>
            <select
              value={form.setor}
              onChange={(e) => setForm({ ...form, setor: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="TI">TI</option>
              <option value="RH">RH</option>
              <option value="Direção">Direção</option>
            </select>
          </div>

          {/* TIPO DE ACESSO */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Shield size={16} /> Nível de Acesso <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="Comum">Comum</option>
              <option value="Administrador">Administrador</option>
              <option value="Master">Master</option>
            </select>
          </div>

          {/* SENHA */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Lock size={16} /> Senha 
              {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && <span className="text-xs text-slate-400 font-normal">(Deixe em branco para manter a atual)</span>}
            </label>
            <input
              type="password"
              placeholder={isEdit ? "••••••••" : "Mínimo de 4 caracteres..."}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button onClick={salvar} className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 shadow-md transition-all">
            <Save size={20} />
            {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminUsuarioForm;
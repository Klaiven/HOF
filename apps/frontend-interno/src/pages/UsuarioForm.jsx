import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Shield, Eye, EyeOff, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function UsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isEdit = !!id;
  const isMaster = user?.tipo?.toLowerCase() === 'master';

  // Redirecionar se não for master
  useEffect(() => {
    if (!isMaster) {
      navigate('/');
      return;
    }
  }, [isMaster, navigate]);

  const [form, setForm] = useState({
    nome: '',
    username: '',
    senha: '',
    cpf: '',
    tipo: 'Comum',
    setor: ''
  });
  const [setores, setSetores] = useState([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const carregarSetores = async () => {
      try {
        const { data } = await api.get('/setores');
        setSetores(data);
      } catch (err) {
        console.error('Erro ao carregar setores:', err);
      }
    };

    carregarSetores();
  }, []);

  // Carregar dados para edição
  useEffect(() => {
    if (isEdit) {
      api.get('/usuarios')
        .then(res => {
          const usuario = res.data.find(u => u.id === Number(id));
          if (usuario) {
            setForm({
              nome: usuario.nome || '',
              username: usuario.username || '',
              senha: '', // Não mostrar senha existente
              cpf: usuario.cpf || '',
              tipo: usuario.tipo || 'Comum',
              setor: usuario.setor || ''
            });
          }
        })
        .catch(err => {
          console.error('Erro ao carregar usuário:', err);
          alert('Erro ao carregar dados do usuário');
        });
    }
  }, [id, isEdit]);

  const validarNome = (value) => {
    if (!value.trim()) return 'Nome é obrigatório';
    if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (/\d/.test(value)) return 'Nome não pode conter números';
    if (/\s{2,}/.test(value)) return 'Nome não pode ter espaços exagerados';
    return null;
  };

  const validarUsuario = (value) => {
    if (!value.trim()) return 'Usuário é obrigatório';
    if (!/^[a-z]+$/.test(value)) return 'Usuário deve conter apenas letras minúsculas sem espaços';
    if (value.length < 3) return 'Usuário deve ter pelo menos 3 caracteres';
    return null;
  };

  const validarSetor = (value) => {
    if (!value.trim()) return 'Setor é obrigatório';
    return null;
  };

  const validarSenha = (value) => {
    if (!isEdit && !value) return 'Senha é obrigatória para novos usuários';
    if (value && value.length < 4) return 'Senha deve ter pelo menos 4 dígitos';
    return null;
  };

  const validarCPF = (value) => {
    const cpfNumeros = value.replace(/\D/g, '');
    if (!cpfNumeros) return 'CPF é obrigatório';
    if (cpfNumeros.length !== 11) return 'CPF deve ter 11 dígitos';
    return null;
  };

  const capitalizarNome = (value) => {
    return value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatarCPF = (value) => {
    const cpfNumeros = value.replace(/\D/g, '').slice(0, 11);
    return cpfNumeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  };

  const salvar = async () => {
    if (saving) return;

    const erroNome = validarNome(form.nome);
    if (erroNome) { alert(erroNome); return; }

    const erroUsuario = validarUsuario(form.username);
    if (erroUsuario) { alert(erroUsuario); return; }

    const erroSetor = validarSetor(form.setor);
    if (erroSetor) { alert(erroSetor); return; }

    const erroSenha = validarSenha(form.senha);
    if (erroSenha) { alert(erroSenha); return; }

    const erroCPF = validarCPF(form.cpf);
    if (erroCPF) { alert(erroCPF); return; }

    setSaving(true);
    try {
      const payload = {
        nome: capitalizarNome(form.nome),
        username: form.username,
        tipo: form.tipo,
        setor: form.setor,
        cpf: form.cpf.replace(/\D/g, '')
      };

      if (form.senha) {
        payload.senha = form.senha;
      }

      if (isEdit) {
        await api.put(`/usuarios/${id}`, payload);
        alert('Usuário atualizado com sucesso!');
      } else {
        await api.post('/usuarios', payload);
        alert('Usuário criado com sucesso!');
      }

      navigate('/usuarios');

    } catch (err) {
      console.error('Erro ao salvar:', err.response?.data || err);

      if (err.response?.status === 400) {
        alert('Dados inválidos. Verifique os campos.');
      } else if (err.response?.status === 409) {
        alert('Usuário já está em uso. Verifique o nome de usuário ou CPF.');
      } else if (err.response?.status === 403) {
        alert('Você não tem permissão para esta ação.');
      } else {
        alert('Erro ao salvar usuário: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  // Não renderizar se não for master
  if (!isMaster) {
    return null;
  }

  return (
    <Layout title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}>
      <div className="max-w-2xl mx-auto space-y-8 pb-12">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              title="Voltar"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isEdit ? 'Modifique as informações do usuário abaixo.' : 'Preencha os dados para criar um novo usuário no sistema.'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">

          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <User size={16} /> Nome Completo
                </label>
                <input
                  placeholder="Ex: João Silva"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  onBlur={(e) => setForm({ ...form, nome: capitalizarNome(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <User size={16} /> Usuário
                </label>
                <input
                  placeholder="Ex: joaosilva"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z]/g, '') })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Shield size={16} /> CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
                  maxLength={14}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Shield size={16} /> Senha {isEdit && '(deixe em branco para manter a atual)'}
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder={isEdit ? 'Nova senha (opcional)' : 'Digite a senha'}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Shield size={16} /> Tipo de Usuário
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="Comum">Comum</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Master">Master</option>
                </select>
                <p className="text-xs text-slate-500">
                  <strong>Master:</strong> Acesso total ao sistema<br />
                  <strong>Administrador:</strong> Pode gerenciar publicações<br />
                  <strong>Comum:</strong> Acesso limitado
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Users size={16} /> Setor
                </label>
                <select
                  value={form.setor}
                  onChange={(e) => setForm({ ...form, setor: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="">Selecione um setor</option>
                    {Array.from(
                    new Map(setores.map((s) => [s.nome, s])).values()
                    ).map((setor) => (
                    <option key={setor.id} value={setor.nome}>
                        {setor.nome}
                    </option>
                    ))}
                </select>
              </div>
            </div>

          </div>

          {/* RODAPÉ / AÇÕES */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default UsuarioForm;
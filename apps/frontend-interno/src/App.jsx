import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Ramais from './pages/Ramais';

import Formularios from './pages/Formularios';
import Usuarios from './pages/Usuarios';
import UsuarioForm from './pages/UsuarioForm';

import Publicacoes from './pages/Publicacoes';
import PublicacaoDetalhe from './pages/PublicacaoDetalhe';
import PublicacaoForm from './pages/PublicacaoForm';


function App() {
  const { authenticated, loading } = useAuth();
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Login />} />
        

        <Route path="/ramais" element={<Ramais />} />

        <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
        <Route path="/usuarios/novo" element={<ProtectedRoute><UsuarioForm /></ProtectedRoute>} />
        <Route path="/usuarios/:id" element={<ProtectedRoute><UsuarioForm /></ProtectedRoute>} />

        <Route path="/formularios/:pasta" element={<Formularios />} />
        <Route path="/formularios/:pasta/:sub" element={<Formularios />} />

        <Route path="/publicacoes/:tipo" element={<Publicacoes />} />
        <Route path="/publicacoes/:tipo/:id" element={<PublicacaoDetalhe />} />
        <Route path="/publicacoes/:tipo/novo" element={<ProtectedRoute><PublicacaoForm /></ProtectedRoute>} />
        <Route path="/publicacoes/:tipo/:id/editar" element={<ProtectedRoute><PublicacaoForm /></ProtectedRoute>} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Ramais from './pages/Ramais'

import Formularios from './pages/Formularios';


import Admin from './pages/Admin';

import AdminManualForm from './pages/admin/AdminManualForm';
import AdminTutorialForm from './pages/admin/AdminTutorialForm';
import AdminAtualizacaoForm from './pages/admin/AdminAtualizacaoForm';
import AdminLinkForm from './pages/admin/AdminLinkForm'
import AdminLinks from './pages/admin/AdminLinks'

import AdminUsuarioForm from './pages/admin/AdminUsuarioForm';


import Publicacoes from './pages/Publicacoes';
import PublicacaoDetalhe from './pages/PublicacaoDetalhe';


function App() {
  const { authenticated, loading } = useAuth();

  // Se estiver lendo o localStorage, mostra uma tela vazia rápida
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={authenticated ? <Navigate to="/admin" replace /> : <Login />} />
        

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />

      <Route path="/ramais" element={<Ramais />} />

      <Route path="/formularios/:pasta" element={<Formularios />} />
      <Route path="/formularios/:pasta/:sub" element={<Formularios />} />

      
      <Route path="/admin/Manuais/novo" element={<ProtectedRoute> <AdminManualForm /> </ProtectedRoute>} />
      <Route path="/admin/Manuais/:id" element={<ProtectedRoute> <AdminManualForm /> </ProtectedRoute>} />

      <Route path="/admin/tutoriais/novo" element={<ProtectedRoute> <AdminTutorialForm /> </ProtectedRoute>} />
      <Route path="/admin/tutoriais/:id" element={<ProtectedRoute> <AdminTutorialForm /> </ProtectedRoute>} />

      <Route path="/admin/atualizacoes/novo" element={<ProtectedRoute> <AdminAtualizacaoForm /> </ProtectedRoute>} />
      <Route path="/admin/atualizacoes/:id" element={<ProtectedRoute> <AdminAtualizacaoForm /> </ProtectedRoute>} />

      <Route path="/admin/links" element={<ProtectedRoute><AdminLinks /></ProtectedRoute>} />
      <Route path="/admin/links/:id" element={<ProtectedRoute><AdminLinkForm /></ProtectedRoute>} />



      <Route path="/admin/usuarios/novo" element={<ProtectedRoute> <AdminUsuarioForm /> </ProtectedRoute>} />
      <Route path="/admin/usuarios/:id" element={<ProtectedRoute> <AdminUsuarioForm /> </ProtectedRoute>} />



      
      <Route path="/publicacoes/:tipo" element={<Publicacoes />} />
      <Route path="/publicacoes/:tipo/:id" element={<PublicacaoDetalhe />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
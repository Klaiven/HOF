import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Ramais from './pages/Ramais';
import Manuais from './pages/Manuais';
import Tutoriais from './pages/Tutoriais';
import Atualizacoes from './pages/Atualizacoes';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminManualForm from './pages/admin/AdminManualForm';
import AdminTutorialForm from './pages/admin/AdminTutorialForm';
import AdminAtualizacaoForm from './pages/admin/AdminAtualizacaoForm';
import AdminUsuarioForm from './pages/admin/AdminUsuarioForm';


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

      
      <Route path="/admin/Manuais/novo" element={<ProtectedRoute> <AdminManualForm /> </ProtectedRoute>} />
      <Route path="/admin/Manuais/:id" element={<ProtectedRoute> <AdminManualForm /> </ProtectedRoute>} />

      <Route path="/admin/tutoriais/novo" element={<ProtectedRoute> <AdminTutorialForm /> </ProtectedRoute>} />
      <Route path="/admin/tutoriais/:id" element={<ProtectedRoute> <AdminTutorialForm /> </ProtectedRoute>} />

      <Route path="/admin/atualizacoes/novo" element={<ProtectedRoute> <AdminAtualizacaoForm /> </ProtectedRoute>} />
      <Route path="/admin/atualizacoes/:id" element={<ProtectedRoute> <AdminAtualizacaoForm /> </ProtectedRoute>} />

      <Route path="/admin/usuarios/novo" element={<ProtectedRoute> <AdminUsuarioForm /> </ProtectedRoute>} />
      <Route path="/admin/usuarios/:id" element={<ProtectedRoute> <AdminUsuarioForm /> </ProtectedRoute>} />

      <Route path="/ramais" element={<Ramais />} />
      <Route path="/manuais" element={<Manuais />}/>
      <Route path="/tutoriais" element={<Tutoriais />} />
      <Route path="/atualizacoes" element={<Atualizacoes />}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
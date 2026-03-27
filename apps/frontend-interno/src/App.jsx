import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { authenticated, loading } = useAuth();

  // Se estiver lendo o localStorage, mostra uma tela vazia rápida
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Se estiver logado, a Home é livre */}
        <Route path="/" element={<Home />} />
        
        {/* LOGIN: Se já estiver logado, JOGA pro admin direto */}
        <Route 
          path="/login" 
          element={authenticated ? <Navigate to="/admin" replace /> : <Login />} 
        />

        {/* ADMIN: Protegido */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
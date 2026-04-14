import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) return null;

  if (!authenticated) {
    // Se não tiver token, volta pro login
    return <Navigate to="/login" replace />;
  }

  return children;
};
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

// Este componente envuelve rutas privadas
const RequireAuth = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Escucha el estado de autenticación
    const unsub = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
      if (!firebaseUser) {
        navigate('/login');
      }
    });
    return () => unsub();
  }, [navigate]);

  if (checking) return <div>Cargando...</div>;
  if (!user) return null; // O redirige a login

  return children;
};

export default RequireAuth;

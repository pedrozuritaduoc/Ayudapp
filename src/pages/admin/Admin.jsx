import React from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  const handleGoUsuarios = () => {
    navigate('/admin/usuarios');
  };

  const handleGoEstudiantes = () => {
    navigate('/admin/estudiantes');
  };

  const handleGoAlertas = () => {
    navigate('/admin/alertas');
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.titulo}>Panel de Administrador</h2>
        <button onClick={handleLogout} style={styles.botonCerrar}>Cerrar sesión</button>
        <hr style={styles.separator} />
        <button onClick={handleGoUsuarios} style={styles.botonNavegar}>
          Administrar Usuarios
        </button>
        <button onClick={handleGoEstudiantes} style={styles.botonNavegar}>
          Administrar Estudiantes
        </button>
        <button onClick={handleGoAlertas} style={styles.botonNavegar}>
          Administrar Alertas
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f0fdfc, #d9f2f2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'sans-serif',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '2rem',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  titulo: {
    color: '#2E3A59',
    marginBottom: '1rem',
    fontSize: '1.8rem',
    textAlign: 'center'
  },
  botonCerrar: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    float: 'right'
  },
  separator: {
    margin: '2rem 0'
  },
  botonNavegar: {
    backgroundColor: '#4FA5A5',
    color: 'white',
    padding: '0.8rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1.1rem',
    marginTop: '1rem',
    display: 'block',
    width: '100%',
  }
};

export default Admin;

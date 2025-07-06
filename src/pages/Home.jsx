import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoAyudapp from '../assets/AyudappLogo.jpeg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={logoAyudapp} alt="Logo Ayudapp" style={styles.logoHeader} />
        <nav>
          <button onClick={() => navigate('/login')} style={styles.navButton}>Iniciar sesión</button>
        </nav>
      </header>

      <section style={styles.heroSection} id="inicio">
        <h1 style={styles.heroTitle}>Ayudapp: Apoyo Escolar en Situaciones de Crisis</h1>
        <p style={styles.heroText}>
          En Chile, 1 de cada 51 niños es diagnosticado con Trastorno del Espectro Autista (TEA). Ayudapp nace como una herramienta digital pensada para apoyar a docentes y equipos escolares a gestionar alertas en contextos críticos, promoviendo inclusión y respuesta oportuna.
        </p>
      </section>

      <section style={styles.cardsSection}>
        <div style={styles.card}>📘 Registro ágil de crisis escolares</div>
        <div style={styles.card}>🤝 Comunicación con equipo PIE y apoderados</div>
        <div style={styles.card}>📊 Seguimiento y análisis de patrones conductuales</div>
        <div style={styles.card}>🧠 Acompañamiento respetuoso e informado sobre el TEA</div>
      </section>

      <section style={styles.statsSection}>
        <h2 style={styles.statsTitle}>📊 Estadísticas sobre el TEA en Chile</h2>
        <p style={styles.statsText}>
          Se estima que más de 80.000 niños en Chile viven con alguna condición del espectro autista. La detección temprana, el acompañamiento pedagógico y el trabajo colaborativo con familias son claves para una inclusión real.
        </p>
      </section>

      <footer style={styles.footer}>
        <p>© 2025 Ayudapp - Hecho con ❤️ en Chile</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#f0fdfc',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    scrollBehavior: 'smooth'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  logoHeader: {
    width: '120px',
  },
  navButton: {
    backgroundColor: '#4FA5A5',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.8rem',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  heroSection: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'linear-gradient(to bottom right, #f0fdfc, #d9f2f2)',
  },
  heroTitle: {
    fontSize: '2.5rem',
    color: '#2E3A59',
    marginBottom: '1rem',
  },
  heroText: {
    fontSize: '1.2rem',
    color: '#4FA5A5',
    maxWidth: '800px',
    margin: '0 auto 2rem',
  },
  cardsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    padding: '2rem',
    backgroundColor: '#ffffff',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#e0f7f4',
    borderRadius: '1rem',
    padding: '1.5rem',
    fontSize: '1rem',
    color: '#2E3A59',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  statsSection: {
    backgroundColor: '#d9f2f2',
    padding: '3rem 2rem',
    textAlign: 'center'
  },
  statsTitle: {
    fontSize: '2rem',
    color: '#2E3A59',
    marginBottom: '1rem'
  },
  statsText: {
    fontSize: '1.1rem',
    color: '#4FA5A5',
    maxWidth: '700px',
    margin: '0 auto'
  },
  footer: {
    backgroundColor: '#f4f4f4',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#777'
  },
};

export default Home;

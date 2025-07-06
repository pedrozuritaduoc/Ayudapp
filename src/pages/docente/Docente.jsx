import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

const Docente = () => {
  const navigate = useNavigate();

  const [estudiantes, setEstudiantes] = useState([]);
  const [padres, setPadres] = useState([]);
  const [pies, setPies] = useState([]);
  const [estudianteId, setEstudianteId] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [alertas, setAlertas] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('activa');

  // 1. Trae la lista de estudiantes, padres y PIE al montar el componente
  useEffect(() => {
    const cargarEstudiantes = async () => {
      const snapshot = await getDocs(collection(db, 'estudiantes'));
      const lista = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setEstudiantes(lista);
    };
    cargarEstudiantes();

    // Trae todos los padres y PIE
    const cargarUsuarios = async () => {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPadres(docs.filter((user) => user.rol === 'padre'));
      setPies(docs.filter((user) => user.rol === 'pie'));
    };
    cargarUsuarios();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Al enviar la alerta, busca el estudiante seleccionado y toma sus datos
  const handleEnviarAlerta = async () => {
    if (!estudianteId) return alert('Selecciona un estudiante');
    const estudianteSeleccionado = estudiantes.find(e => e.id === estudianteId);
    if (!estudianteSeleccionado) return alert('No se encontró el estudiante');

    try {
      await addDoc(collection(db, 'alertas'), {
        estudianteId,
        docenteId: auth.currentUser.uid,
        ubicacion,
        fecha: serverTimestamp(),
        estado: 'activa',
        foto: estudianteSeleccionado.foto || '',
        protocoloActuacion: estudianteSeleccionado.protocoloActuacion || '',
        protocoloIntervencion: estudianteSeleccionado.protocoloIntervencion || '',
        pieId: estudianteSeleccionado.pieId || '',
        padreId: estudianteSeleccionado.idApoderado || '',
        nombreEstudiante: estudianteSeleccionado.nombre || '',
      });
      setMensaje('✅ Alerta activada correctamente');
      setEstudianteId('');
      setUbicacion('');
    } catch (err) {
      console.error('Error al enviar alerta:', err);
      setMensaje('❌ Error al enviar alerta');
    }
  };

  const handleCancelarAlerta = async (idAlerta) => {
    try {
      await updateDoc(doc(db, 'alertas', idAlerta), {
        estado: 'cancelada',
      });
      setMensaje('🚫 Alerta cancelada correctamente');
    } catch (error) {
      console.error('Error al cancelar la alerta:', error);
      setMensaje('❌ No se pudo cancelar la alerta');
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'alertas'),
      where('estado', '==', estadoFiltro),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((a) => a.fecha);
      setAlertas(lista);
    });

    return () => unsubscribe();
  }, [estadoFiltro]);

  // Mostrar nombre de padre y PIE
  const getNombrePadre = (padreId) => {
    const padre = padres.find(p => p.id === padreId);
    return padre ? padre.nombre : '-';
  };

  const getNombrePie = (pieId) => {
    const pie = pies.find(p => p.id === pieId);
    return pie ? pie.nombre : (pieId ? pieId : '-');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.titulo}>Panel Docente</h2>
        <button onClick={handleLogout} style={styles.botonCerrar}>Cerrar sesión</button>

        <hr />
        <h3 style={styles.subtitulo}>Activar Alerta de Estudiante</h3>

        <select
          value={estudianteId}
          onChange={(e) => setEstudianteId(e.target.value)}
          required
          style={styles.select}
        >
          <option value="">Selecciona un estudiante</option>
          {estudiantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.nombre}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ubicación (opcional)"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleEnviarAlerta} style={styles.botonAccion}>
          Enviar Alerta
        </button>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}

        <hr />
        <label style={styles.label}>Ver alertas por estado:</label>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          style={styles.select}
        >
          <option value="activa">Activas</option>
          <option value="recibida">Recibidas</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>

        <h3 style={styles.subtitulo}>Alertas ({estadoFiltro})</h3>
        <div style={styles.cardList}>
          {alertas.length === 0 && (
            <div style={styles.noAlertas}>No hay alertas</div>
          )}
          {alertas.map((alerta) => (
            <div key={alerta.id} style={styles.alertaCard}>
              <div style={styles.alertaHeader}>
                {alerta.foto ? (
                  <img
                    src={alerta.foto}
                    alt="foto estudiante"
                    style={styles.alertaFoto}
                  />
                ) : (
                  <div style={styles.alertaFotoPlaceholder}>👤</div>
                )}
                <div>
                  <h4 style={{ margin: 0 }}>{alerta.nombreEstudiante || alerta.estudianteId}</h4>
                  <div style={{ color: "#555", fontSize: "1rem" }}>
                    {alerta.ubicacion || "Ubicación no especificada"}
                  </div>
                  <div style={{ color: "#888", fontSize: "0.98rem" }}>
                    {alerta.fecha ? new Date(alerta.fecha.toDate()).toLocaleString() : 'Fecha no disponible'}
                  </div>
                </div>
              </div>
              <div style={{ margin: "0.7rem 0" }}>
                <b>Protocolo de actuación:</b>
                <div style={styles.textoCampo}>{alerta.protocoloActuacion || "-"}</div>
                <b>PIE:</b>
                <div style={styles.textoCampo}>{getNombrePie(alerta.pieId)}</div>
                <b>Padre:</b>
                <div style={styles.textoCampo}>{getNombrePadre(alerta.padreId)}</div>
              </div>
              {estadoFiltro === 'activa' && (
                <button
                  onClick={() => handleCancelarAlerta(alerta.id)}
                  style={{ ...styles.botonAccion, backgroundColor: '#e74c3c' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
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
    maxWidth: '700px'
  },
  titulo: {
    color: '#2E3A59',
    marginBottom: '1rem',
    fontSize: '1.8rem',
    textAlign: 'center'
  },
  subtitulo: {
    color: '#2E3A59',
    fontSize: '1.2rem',
    marginBottom: '1rem'
  },
  label: {
    fontWeight: 'bold',
    color: '#000000'
  },
  select: {
    padding: '0.5rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    width: '100%',
    borderRadius: '0.5rem',
    border: '1px solid #ccc'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc'
  },
  mensaje: {
    color: 'green',
    marginBottom: '1rem'
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1.5rem',
    marginBottom: '2rem'
  },
  alertaCard: {
    backgroundColor: '#f8fafd',
    borderRadius: '1.2rem',
    boxShadow: '0 4px 12px rgba(60,130,180,0.08)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    color: '#1a202c',
  },
  alertaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem'
  },
  alertaFoto: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    background: '#f3f4fa'
  },
  alertaFotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: '#e0e7ef',
    color: '#8e9bae',
    fontSize: '2.3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textoCampo: {
    background: "#e6f5f4",
    borderRadius: "0.4rem",
    padding: "0.2rem 0.6rem",
    margin: "0.2rem 0 0.5rem 0",
    fontSize: "0.98rem",
    color: "#17525a"
  },
  noAlertas: {
    color: '#000000',
    fontWeight: 'bold'
  },
  botonAccion: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#4FA5A5',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  botonCerrar: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    float: 'right'
  }
};

export default Docente;

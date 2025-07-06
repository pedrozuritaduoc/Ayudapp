// File: src/pages/padre/HistorialAlertas.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const HistorialAlertas = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAlertas = async () => {
      setCargando(true);

      // Obtener el UID del usuario logueado (padreId)
      const user = auth.currentUser;
      if (!user) {
        setAlertas([]);
        setCargando(false);
        return;
      }
      const padreId = user.uid;

      // Traer solo alertas_enviadas donde apoderado.id == padreId
      const q = query(
        collection(db, "alertas_enviadas"),
        where("apoderado.id", "==", padreId),
        orderBy("fechaEnvio", "desc")
      );
      const snap = await getDocs(q);
      setAlertas(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
      setCargando(false);
    };
    cargarAlertas();
  }, []);

  const handleVolver = () => {
    navigate('/padre');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú
        </button>
        <h2 style={styles.titulo}>Historial de Alertas</h2>
        <hr style={styles.separator} />
        {cargando ? (
          <div style={styles.noData}>Cargando...</div>
        ) : alertas.length === 0 ? (
          <div style={styles.noData}>No hay alertas registradas para tu estudiante.</div>
        ) : (
          <div style={styles.listaCartas}>
            {alertas.map((alerta) => (
              <div key={alerta.id} style={styles.carta}>
                {/* FOTO DEL ESTUDIANTE */}
                {alerta.foto && (
                  <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
                    <img
                      src={alerta.foto}
                      alt={alerta.nombreEstudiante || "Estudiante"}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "2px solid #4FA5A5",
                      }}
                    />
                  </div>
                )}
                <div>
                  <b>Estudiante:</b> {alerta.nombreEstudiante || "-"}
                </div>
                <div>
                  <b>Fecha y hora:</b>{" "}
                  {alerta.fecha?.toDate?.().toLocaleString() ||
                    (alerta.fechaEnvio?.toDate?.().toLocaleString?.() ?? "-")}
                </div>
                <div>
                  <b>Estado:</b> {alerta.estado}
                </div>
                <div>
                  <b>Ubicación:</b> {alerta.ubicacion || "-"}
                </div>
                <div>
                  <b>Observación:</b> {alerta.observacion || "-"}
                </div>
                <div>
                  <b>Protocolo de actuación:</b> {alerta.protocoloActuacion || "-"}
                </div>
                <div>
                  <b>Protocolo de intervención:</b> {alerta.protocoloIntervencion || "-"}
                </div>
              </div>
            ))}
          </div>
        )}
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
    maxWidth: '700px',
    textAlign: 'center'
  },
  botonVolver: {
    marginBottom: '1.2rem',
    backgroundColor: '#e0e7ef',
    color: '#1a202c',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '0.7rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  titulo: {
    color: '#2E3A59',
    marginBottom: '1rem',
    fontSize: '1.8rem',
    textAlign: 'center'
  },
  separator: {
    margin: '2rem 0 1.5rem 0'
  },
  listaCartas: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
  },
  carta: {
    background: '#e6f5f4',
    borderRadius: '1.1rem',
    padding: '1.1rem 1.3rem',
    color: '#1a202c',
    fontSize: '1.08rem',
    boxShadow: '0 4px 12px rgba(80,180,150,0.07)',
    textAlign: 'left',
  },
  noData: {
    color: '#888',
    textAlign: 'center',
    padding: '1.5rem',
    fontStyle: 'italic'
  }
};

export default HistorialAlertas;

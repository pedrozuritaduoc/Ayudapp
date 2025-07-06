// File: src/pages/padre/Notificaciones.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../firebase/config";
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";

const Notificaciones = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [puntuaciones, setPuntuaciones] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAlertas = async () => {
      setCargando(true);
      const user = auth.currentUser;
      if (!user) {
        setAlertas([]);
        setCargando(false);
        return;
      }
      const padreId = user.uid;
      const q = query(
        collection(db, "alertas_enviadas"),
        where("apoderado.id", "==", padreId),
        orderBy("fechaEnvio", "desc")
      );
      const snap = await getDocs(q);
      // ¡IMPORTANTE! Usar docId, no confundir con campos internos
      const lista = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          docId: docSnap.id,
          ...data,
          comentario: data.comentario || "",
          puntuacion: data.puntuacion || ""
        }
      });
      setAlertas(lista);

      // Precargar comentarios y puntuaciones
      const comentariosObj = {};
      const puntuacionesObj = {};
      lista.forEach(a => {
        comentariosObj[a.docId] = a.comentario || "";
        puntuacionesObj[a.docId] = a.puntuacion || "";
      });
      setComentarios(comentariosObj);
      setPuntuaciones(puntuacionesObj);

      setCargando(false);
    };
    cargarAlertas();
  }, []);

  const handleVolver = () => {
    navigate('/padre');
  };

  const handleComentarioChange = (docId, value) => {
    setComentarios({ ...comentarios, [docId]: value });
  };

  const handlePuntuacionChange = (docId, value) => {
    // Solo permitir números del 1 al 10
    if (value === "" || (Number(value) >= 1 && Number(value) <= 10)) {
      setPuntuaciones({ ...puntuaciones, [docId]: value });
    }
  };

  const handleGuardar = async (docId) => {
    try {
      const comentario = comentarios[docId] || "";
      const puntuacion = puntuaciones[docId] || "";
      await updateDoc(doc(db, "alertas_enviadas", docId), {
        comentario,
        puntuacion,
      });
      setMensaje("✅ Comentario y puntuación guardados");
      setTimeout(() => setMensaje(""), 2000);
    } catch (e) {
      setMensaje("❌ Error al guardar: " + e.message);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú
        </button>
        <h2 style={styles.titulo}>Notificaciones</h2>
        <hr style={styles.separator} />
        {mensaje && <div style={styles.mensajeExito}>{mensaje}</div>}
        {cargando ? (
          <div style={styles.noData}>Cargando...</div>
        ) : (
          <ul style={styles.lista}>
            {alertas.length === 0 ? (
              <li style={styles.noData}>No hay notificaciones recientes.</li>
            ) : (
              alertas.map((alerta) => (
                <li key={alerta.docId} style={styles.item}>
                  <div style={styles.fecha}>
                    {alerta.fecha?.toDate?.().toLocaleString() ||
                      (alerta.fechaEnvio?.toDate?.().toLocaleString?.() ?? "-")}
                  </div>
                  <div style={styles.tituloNotif}><b>Alerta completada</b></div>
                  <div style={styles.mensaje}><b>Estudiante:</b> {alerta.nombreEstudiante || "-"}</div>
                  <div style={styles.mensaje}><b>Ubicación:</b> {alerta.ubicacion || "-"}</div>
                  <div style={styles.mensaje}><b>Observación:</b> {alerta.observacion || "-"}</div>

                  <div style={{ marginTop: "1rem" }}>
                    <label><b>Comentario del apoderado:</b>
                      <textarea
                        style={styles.input}
                        placeholder="Escribe tu comentario"
                        value={comentarios[alerta.docId]}
                        onChange={e => handleComentarioChange(alerta.docId, e.target.value)}
                        rows={2}
                      />
                    </label>
                  </div>
                  <div style={{ marginTop: "0.7rem" }}>
                    <label>
                      <b>Puntúa la alerta (1 a 10):</b>
                      <input
                        style={{ ...styles.input, width: 60, marginLeft: 12, textAlign: "center" }}
                        type="number"
                        min={1}
                        max={10}
                        value={puntuaciones[alerta.docId]}
                        onChange={e => handlePuntuacionChange(alerta.docId, e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => handleGuardar(alerta.docId)}
                    style={styles.botonGuardar}
                  >
                    Guardar
                  </button>
                </li>
              ))
            )}
          </ul>
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
    maxWidth: '500px',
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
  lista: {
    listStyleType: 'none',
    padding: 0,
    margin: 0
  },
  item: {
    background: '#f8fafc',
    marginBottom: '1.2rem',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 2px 7px rgba(80,130,130,0.05)',
    textAlign: 'left'
  },
  fecha: {
    fontSize: '0.92rem',
    color: '#17525a',
    marginBottom: '0.2rem'
  },
  tituloNotif: {
    color: '#4FA5A5',
    fontSize: '1.07rem',
    marginBottom: '0.3rem'
  },
  mensaje: {
    color: '#111',
    fontSize: '1rem'
  },
  input: {
    width: "100%",
    borderRadius: "0.7rem",
    border: "1px solid #bdbdbd",
    padding: "0.6rem",
    fontSize: "1rem"
  },
  botonGuardar: {
    backgroundColor: '#4FA5A5',
    color: 'white',
    border: 'none',
    padding: '0.7rem 2rem',
    fontSize: '1rem',
    borderRadius: '1rem',
    cursor: 'pointer',
    marginTop: '0.8rem',
    width: '100%',
    transition: '0.3s'
  },
  noData: {
    color: '#888',
    textAlign: 'center',
    padding: '1.5rem',
    fontStyle: 'italic'
  },
  mensajeExito: {
    color: "green",
    fontWeight: "bold",
    margin: "0.7rem 0"
  }
};

export default Notificaciones;

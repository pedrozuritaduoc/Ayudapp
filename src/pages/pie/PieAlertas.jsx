// src/pages/pie/PieAlertas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";

const PieAlertas = () => {
  const navigate = useNavigate();
  const [estadoFiltro, setEstadoFiltro] = useState("activa");
  const [alertas, setAlertas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const snapshot = await getDocs(collection(db, "estudiantes"));
      const lista = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setEstudiantes(lista);
    };
    cargarEstudiantes();
  }, []);

  const cambiarEstadoAlerta = async (id, nuevoEstado) => {
    if (!auth.currentUser) {
      setMensaje("❌ Debes iniciar sesión para cambiar el estado.");
      return;
    }
    try {
      const updateData = { estado: nuevoEstado };
      if (nuevoEstado === "recibida") {
        updateData.pieId = auth.currentUser.uid;
      }
      if (nuevoEstado === "completada") {
        updateData.observacion = observaciones[id] || "";
        updateData.pieId = auth.currentUser.uid;
        updateData.enviadaAlPadre = false; // 👈 NUEVO: agrega el campo aquí
      }
      await updateDoc(doc(db, "alertas", id), updateData);
      setMensaje(`✅ Estado cambiado a "${nuevoEstado}"`);
      if (nuevoEstado === "completada") {
        setObservaciones((obs) => ({ ...obs, [id]: "" }));
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setMensaje("❌ Error al cambiar estado");
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "alertas"),
      where("estado", "==", estadoFiltro),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlertas(lista);
    });

    return () => unsubscribe();
  }, [estadoFiltro]);

  const getEstudiante = (id) => estudiantes.find((e) => e.id === id);

  const handleObsChange = (alertaId, value) => {
    setObservaciones((prev) => ({
      ...prev,
      [alertaId]: value,
    }));
  };

  const handleVolver = () => {
    navigate('/pie');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú PIE
        </button>
        <h2 style={styles.titulo}>Gestión de Alertas PIE</h2>
        <label style={styles.label}>Filtrar por estado:</label>
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
        <hr />
        <h3 style={styles.subtitulo}>Alertas ({estadoFiltro})</h3>
        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        <ul style={styles.lista}>
          {alertas.length === 0 && (
            <li style={styles.noAlertas}>No hay alertas</li>
          )}
          {alertas.map((alerta) => {
            const est = getEstudiante(alerta.estudianteId);
            return (
              <li key={alerta.id} style={styles.itemTexto}>
                <b>
                  {est?.nombre || alerta.nombreEstudiante || alerta.estudianteId}
                </b>
                <br />
                {est?.foto && (
                  <img
                    src={est.foto}
                    alt="foto estudiante"
                    style={{ maxHeight: 42, borderRadius: 8, margin: "6px 0" }}
                  />
                )}
                <div>
                  <b>Ubicación:</b>{" "}
                  {alerta.ubicacion || "Ubicación no especificada"}
                </div>
                <div>
                  <b>Fecha y hora:</b>{" "}
                  {alerta.fecha?.toDate().toLocaleString() ||
                    "Fecha no disponible"}
                </div>
                <div>
                  <b>Protocolo de intervención:</b>{" "}
                  {est?.protocoloIntervencion ||
                    alerta.protocoloIntervencion ||
                    "-"}
                </div>
                {estadoFiltro === "recibida" && (
                  <>
                    <div style={{ marginTop: "0.6rem" }}>
                      <label>
                        <b>Observación:</b>
                        <input
                          type="text"
                          placeholder="Escribe una observación"
                          value={
                            observaciones[alerta.id] || alerta.observacion || ""
                          }
                          onChange={(e) =>
                            handleObsChange(alerta.id, e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "0.4rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #ccc",
                            marginTop: "0.3rem",
                          }}
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: "1.2rem" }}>
                      <button
                        onClick={() =>
                          cambiarEstadoAlerta(alerta.id, "completada")
                        }
                        style={styles.botonAccion}
                      >
                        Marcar como Completada
                      </button>
                    </div>
                  </>
                )}
                {estadoFiltro === "completada" && (
                  <div style={{ marginTop: "0.6rem" }}>
                    <b>Observación:</b> <span>{alerta.observacion || "-"}</span>
                  </div>
                )}
                {estadoFiltro === "activa" && (
                  <button
                    onClick={() => cambiarEstadoAlerta(alerta.id, "recibida")}
                    style={styles.botonAccion}
                  >
                    Marcar como Recibida
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f0fdfc, #d9f2f2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
    padding: "2rem",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "2rem",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "700px",
  },
  botonVolver: {
    marginBottom: "1.2rem",
    backgroundColor: "#e0e7ef",
    color: "#1a202c",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "0.7rem",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem"
  },
  titulo: {
    color: "#2E3A59",
    marginBottom: "1rem",
    fontSize: "1.8rem",
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#000000",
  },
  select: {
    padding: "0.5rem",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    width: "100%",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
  },
  subtitulo: {
    color: "#2E3A59",
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
  mensaje: {
    color: "green",
    marginBottom: "1rem",
  },
  lista: {
    listStyleType: "none",
    paddingLeft: 0,
  },
  itemTexto: {
    marginBottom: "1rem",
    color: "#000000",
  },
  noAlertas: {
    color: "#000000",
    fontWeight: "bold",
  },
  botonAccion: {
    marginLeft: "1rem",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#4FA5A5",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default PieAlertas;

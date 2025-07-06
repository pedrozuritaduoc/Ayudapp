// src/pages/inspector/InspectorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

const InspectorDashboard = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  // Traer usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      const snap = await getDocs(collection(db, "usuarios"));
      setUsuarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarUsuarios();
  }, []);

  // Traer estudiantes
  useEffect(() => {
    const cargarEstudiantes = async () => {
      const snap = await getDocs(collection(db, "estudiantes"));
      setEstudiantes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarEstudiantes();
  }, []);

  // Escuchar todas las alertas en tiempo real (sin filtro)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "alertas"), (snap) => {
      const lista = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.fecha?.toDate?.() || 0) - (a.fecha?.toDate?.() || 0));
      setAlertas(lista);
    });
    return () => unsub();
  }, []);

  // Helpers para nombres
  const getDocenteNombre = (docenteId) => {
    const usuario = usuarios.find(u => u.id === docenteId);
    return usuario ? usuario.nombre : docenteId || "-";
  };
  const getEstudianteNombre = (estudianteId, nombreEstudiante) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    return estudiante ? estudiante.nombre : (nombreEstudiante || estudianteId || "-");
  };

  // Botón volver
  const handleVolver = () => {
    navigate('/inspector');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú Inspector
        </button>
        <h2 style={styles.titulo}>Dashboard de Alertas Inspector</h2>
        <hr style={styles.separator} />
        <div style={{ overflowX: "auto" }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Docente</th>
                <th style={styles.th}>Estudiante</th>
                <th style={styles.th}>Fecha y hora</th>
                <th style={styles.th}>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {alertas.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                    No hay alertas registradas
                  </td>
                </tr>
              )}
              {alertas.map(alerta => (
                <tr key={alerta.id}>
                  <td style={styles.td}>{alerta.estado}</td>
                  <td style={styles.td}>{getDocenteNombre(alerta.docenteId)}</td>
                  <td style={styles.td}>
                    {getEstudianteNombre(alerta.estudianteId, alerta.nombreEstudiante)}
                  </td>
                  <td style={styles.td}>
                    {alerta.fecha?.toDate ? alerta.fecha.toDate().toLocaleString() : "-"}
                  </td>
                  <td style={styles.td}>{alerta.ubicacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "900px",
    minHeight: "450px"
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
    textAlign: "center"
  },
  separator: {
    margin: "2rem 0 1.5rem 0"
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "1rem",
    marginTop: "1.5rem"
  },
  th: {
    background: "#e6f5f4",
    padding: "0.9rem",
    fontWeight: 700,
    color: "#17525a",
    borderRadius: "0.3rem"
  },
  td: {
    background: "#f8fafc",
    color: "#111",
    padding: "0.8rem",
    borderRadius: "0.2rem",
    textAlign: "center",
    borderBottom: "1px solid #e4e4e7"
  }
};

export default InspectorDashboard;

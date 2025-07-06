// src/pages/inspector/InspectorEstudiantes.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // <--- AGREGA ESTO
import { db } from "../../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const InspectorEstudiantes = () => {
  const navigate = useNavigate();   // <--- HOOK PARA NAVEGAR

  const [estudiantes, setEstudiantes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({});
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const snap = await getDocs(collection(db, "estudiantes"));
      setEstudiantes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarEstudiantes();
  }, []);

  const handleEditar = (estudiante) => {
    setEditandoId(estudiante.id);
    setFormData({
      protocoloActuacion: estudiante.protocoloActuacion || "",
      protocoloIntervencion: estudiante.protocoloIntervencion || "",
    });
    setMensaje("");
  };

  const handleGuardar = async (id) => {
    try {
      await updateDoc(doc(db, "estudiantes", id), {
        protocoloActuacion: formData.protocoloActuacion,
        protocoloIntervencion: formData.protocoloIntervencion,
      });
      setMensaje("✅ Protocolos actualizados correctamente");
      setEditandoId(null);
      // Recargar estudiantes
      const snap = await getDocs(collection(db, "estudiantes"));
      setEstudiantes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setMensaje("❌ Error al guardar: " + e.message);
    }
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({});
    setMensaje("");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // NUEVO: Botón Volver
  const handleVolver = () => {
    navigate('/inspector');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* BOTÓN VOLVER */}
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú Inspector
        </button>
        <h2 style={styles.titulo}>Estudiantes - Modificar Protocolos</h2>
        <hr style={styles.separator} />
        {mensaje && <div style={styles.mensaje}>{mensaje}</div>}
        <table style={styles.tabla}>
          <thead>
            <tr>
              <th style={styles.th}>Foto</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Curso</th>
              <th style={styles.th}>Protocolo de Actuación</th>
              <th style={styles.th}>Protocolo de Intervención</th>
              <th style={styles.th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map(est => (
              <tr key={est.id}>
                <td style={styles.td}>
                  <img src={est.foto} alt={est.nombre} style={{ width: 46, borderRadius: 8 }} />
                </td>
                <td style={styles.td}>{est.nombre}</td>
                <td style={styles.td}>{est.curso}</td>
                <td style={styles.td}>
                  {editandoId === est.id ? (
                    <textarea
                      name="protocoloActuacion"
                      value={formData.protocoloActuacion}
                      onChange={handleInputChange}
                      rows={2}
                      style={styles.textarea}
                    />
                  ) : (
                    est.protocoloActuacion
                  )}
                </td>
                <td style={styles.td}>
                  {editandoId === est.id ? (
                    <textarea
                      name="protocoloIntervencion"
                      value={formData.protocoloIntervencion}
                      onChange={handleInputChange}
                      rows={2}
                      style={styles.textarea}
                    />
                  ) : (
                    est.protocoloIntervencion
                  )}
                </td>
                <td style={styles.td}>
                  {editandoId === est.id ? (
                    <>
                      <button onClick={() => handleGuardar(est.id)} style={styles.botonAccion}>Guardar</button>
                      <button onClick={handleCancelar} style={styles.botonCancelar}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditar(est)} style={styles.botonEditar}>Editar</button>
                  )}
                </td>
              </tr>
            ))}
            {estudiantes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                  No hay estudiantes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    backgroundColor: "#fff",
    padding: "2.2rem",
    borderRadius: "2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: "1200px",
    textAlign: "center"
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
    fontWeight: 700
  },
  separator: {
    margin: "1.3rem 0 1.5rem 0"
  },
  mensaje: {
    color: "green",
    marginBottom: "1rem",
    fontWeight: "bold"
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "1rem",
    marginTop: "1.5rem"
  },
  th: {
    background: "#e6f5f4",
    padding: "0.7rem",
    fontWeight: 700,
    color: "#17525a",
    borderRadius: "0.3rem"
  },
  td: {
    background: "#f8fafc",
    color: "#111",
    padding: "0.7rem",
    borderRadius: "0.2rem",
    textAlign: "center",
    borderBottom: "1px solid #e4e4e7"
  },
  textarea: {
    width: "98%",
    minHeight: "45px",
    borderRadius: "0.4rem",
    border: "1px solid #bbb",
    padding: "0.4rem",
    background: "#fff",
    color: "#111",
    fontSize: "1rem",
    resize: "vertical"
  },
  botonEditar: {
    backgroundColor: "#4FA5A5",
    color: "white",
    padding: "0.6rem 1.1rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    margin: "0.2rem"
  },
  botonAccion: {
    backgroundColor: "#37c66e",
    color: "white",
    padding: "0.6rem 1.1rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    margin: "0.2rem"
  },
  botonCancelar: {
    backgroundColor: "#bbb",
    color: "#222",
    padding: "0.6rem 1.1rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    margin: "0.2rem"
  }
};

export default InspectorEstudiantes;

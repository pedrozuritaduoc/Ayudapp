import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const InspectorAlertas = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const snap = await getDocs(collection(db, "estudiantes"));
      setEstudiantes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const cargarUsuarios = async () => {
      const snap = await getDocs(collection(db, "usuarios"));
      setUsuarios(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    cargarEstudiantes();
    cargarUsuarios();
  }, []);

  useEffect(() => {
    const cargarAlertas = async () => {
      const q = query(
        collection(db, "alertas"),
        where("estado", "==", "completada"),
        where("enviadaAlPadre", "in", [false, null])
      );
      const snap = await getDocs(q);
      setAlertas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    cargarAlertas();
  }, []);

  const getEstudiante = (id) => estudiantes.find((e) => e.id === id);
  const getApoderado = (id) => usuarios.find((u) => u.id === id);

  const handleEnviarAlPadre = async (alerta) => {
    try {
      const estudiante = getEstudiante(alerta.estudianteId);
      const apoderado = estudiante ? getApoderado(estudiante.idApoderado) : null;
      const { enviadaAlPadre, ...alertaSinFlag } = alerta;
      const nuevaAlerta = {
        ...alertaSinFlag,
        idAlertaOriginal: alerta.id,
        enviadoPorInspector: true,
        fechaEnvio: new Date(),
        apoderado: apoderado
          ? {
              id: apoderado.id,
              nombre: apoderado.nombre,
              correo: apoderado.correo || "-",
              telefono: apoderado.telefono || "-",
            }
          : null,
      };

      await addDoc(collection(db, "alertas_enviadas"), nuevaAlerta);
      await updateDoc(doc(db, "alertas", alerta.id), { enviadaAlPadre: true });
      setAlertas((prev) => prev.filter((a) => a.id !== alerta.id));

      setMensaje("✅ ¡Alerta enviada al padre/apoderado!");
      setTimeout(() => setMensaje(""), 3000);
    } catch (e) {
      setMensaje("❌ Error al enviar la alerta: " + e.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate("/inspector")} style={styles.botonVolver}>
          ⬅ Volver al menú Inspector
        </button>
        <h2 style={styles.titulo}>Alertas Completadas</h2>
        <hr style={styles.separator} />
        {mensaje && <div style={styles.mensaje}>{mensaje}</div>}
        <ul style={styles.lista}>
          {alertas.length === 0 && (
            <li style={styles.noAlertas}>No hay alertas completadas.</li>
          )}
          {alertas.map((alerta) => {
            const estudiante = getEstudiante(alerta.estudianteId);
            const apoderado = estudiante ? getApoderado(estudiante.idApoderado) : null;
            return (
              <li key={alerta.id} style={styles.item}>
                <b>Estudiante:</b>{" "}
                {estudiante?.nombre || alerta.nombreEstudiante || alerta.estudianteId}
                <br />
                <b>Padre/Apoderado:</b>{" "}
                {apoderado?.nombre || estudiante?.idApoderado || "No encontrado"}
                <br />
                <b>Curso:</b> {estudiante?.curso || "-"}
                <br />
                <b>Fecha y hora:</b>{" "}
                {alerta.fecha?.toDate?.().toLocaleString?.() || "-"}
                <br />
                <b>Ubicación:</b> {alerta.ubicacion || "-"}
                <br />
                <b>Observación:</b> {alerta.observacion || "-"}
                <br />
                <button
                  onClick={() => handleEnviarAlPadre(alerta)}
                  style={styles.botonAccion}
                >
                  Enviar al padre
                </button>
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
    backgroundColor: "#fff",
    padding: "2.2rem",
    borderRadius: "2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
    textAlign: "left",
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
    fontSize: "1rem",
  },
  titulo: {
    color: "#2E3A59",
    marginBottom: "1rem",
    fontSize: "1.8rem",
    fontWeight: 700,
    textAlign: "center",
  },
  separator: {
    margin: "1.3rem 0",
    clear: "both",
  },
  mensaje: {
    color: "#178a4c",
    marginBottom: "1rem",
    fontWeight: "bold",
    textAlign: "center",
  },
  lista: {
    listStyleType: "none",
    padding: 0,
  },
  item: {
    background: "#e6f5f4",
    borderRadius: "1.1rem",
    marginBottom: "1rem",
    padding: "1.2rem",
    color: "#1a202c",
    fontSize: "1.08rem",
    boxShadow: "0 4px 12px rgba(80,180,150,0.07)",
  },
  botonAccion: {
    backgroundColor: "#4FA5A5",
    color: "white",
    padding: "0.5rem 1.2rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "0.8rem",
  },
  noAlertas: {
    color: "#888",
    textAlign: "center",
    padding: "1rem",
  },
};

export default InspectorAlertas;

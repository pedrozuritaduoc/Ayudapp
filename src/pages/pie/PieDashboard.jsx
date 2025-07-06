// src/pages/pie/PieDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";

const PieDashboard = () => {
  const navigate = useNavigate();

  // Estados para los conteos
  const [alertasActivas, setAlertasActivas] = useState(0);
  const [alertasRecibidas, setAlertasRecibidas] = useState(0);
  const [alertasCompletadas, setAlertasCompletadas] = useState(0);
  const [alertasCanceladas, setAlertasCanceladas] = useState(0);

  useEffect(() => {
    // Suscribirse en tiempo real a la colección alertas
    const unsubscribe = onSnapshot(collection(db, "alertas"), (snapshot) => {
      let activas = 0,
        recibidas = 0,
        completadas = 0,
        canceladas = 0;
      snapshot.forEach((doc) => {
        const alerta = doc.data();
        switch (alerta.estado) {
          case "activa":
            activas++;
            break;
          case "recibida":
            recibidas++;
            break;
          case "completada":
            completadas++;
            break;
          case "cancelada":
            canceladas++;
            break;
          default:
            break;
        }
      });
      setAlertasActivas(activas);
      setAlertasRecibidas(recibidas);
      setAlertasCompletadas(completadas);
      setAlertasCanceladas(canceladas);
    });

    return () => unsubscribe();
  }, []);

  const handleVolver = () => {
    navigate("/pie");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú PIE
        </button>
        <h2 style={styles.titulo}>Dashboard PIE</h2>
        <hr style={styles.separator} />
        <div style={styles.statsSection}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{alertasActivas}</span>
            <span style={styles.statLabel}>Alertas activas</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{alertasRecibidas}</span>
            <span style={styles.statLabel}>Alertas recibidas</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{alertasCompletadas}</span>
            <span style={styles.statLabel}>Alertas completadas</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{alertasCanceladas}</span>
            <span style={styles.statLabel}>Alertas canceladas</span>
          </div>
        </div>
        <div style={{ marginTop: "2rem", color: "#4FA5A5" }}>
          <b>Bienvenido al Dashboard del Equipo PIE.</b>
          <br />
          Aquí podrás ver estadísticas y métricas relevantes sobre las alertas
          gestionadas.
          <br />
          <span style={{ fontSize: "0.97rem", color: "#666" }}></span>
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
    padding: "2.2rem",
    borderRadius: "2rem",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
    width: "100%",
    maxWidth: "520px",
    textAlign: "center",
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
    marginBottom: "0.5rem",
    fontSize: "2rem",
    fontWeight: 700,
  },
  separator: {
    margin: "1.3rem 0 1.5rem 0",
  },
  statsSection: {
    display: "flex",
    justifyContent: "space-around",
    gap: "1.5rem",
    marginBottom: "1rem",
    flexWrap: "wrap", // <-- ¡ESTA LÍNEA ARREGLA EL PROBLEMA!
  },

  statCard: {
    background: "#e6f5f4",
    borderRadius: "1.2rem",
    padding: "1rem 1.1rem",
    minWidth: "85px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontSize: "2.1rem",
    color: "#34a3a3",
    fontWeight: 700,
    marginBottom: "0.3rem",
  },
  statLabel: {
    fontSize: "1.04rem",
    color: "#17525a",
    fontWeight: 500,
  },
};

export default PieDashboard;

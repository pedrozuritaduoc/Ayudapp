import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const InspectorDashboard = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");

  // Calcular años únicos de las alertas (para el select de año)
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  // ───────── CARGA INICIAL ─────────
  useEffect(() => {
    const cargarUsuarios = async () => {
      const snap = await getDocs(collection(db, "usuarios"));
      setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    cargarUsuarios();
  }, []);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const snap = await getDocs(collection(db, "estudiantes"));
      setEstudiantes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    cargarEstudiantes();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "alertas"), (snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.fecha?.toDate?.() || 0) - (a.fecha?.toDate?.() || 0));
      setAlertas(lista);

      // Calcular años únicos automáticamente
      const anios = Array.from(
        new Set(
          lista
            .map(a => a.fecha?.toDate?.()?.getFullYear())
            .filter(anio => !!anio)
        )
      ).sort((a, b) => b - a);
      setAniosDisponibles(anios);
    });
    return () => unsub();
  }, []);

  // ───────── HELPERS ─────────
  const getDocenteNombre = (id) => usuarios.find((u) => u.id === id)?.nombre ?? id ?? "-";
  const getEstudianteNombre = (id, nombreEstudiante) =>
    estudiantes.find((e) => e.id === id)?.nombre ?? nombreEstudiante ?? id ?? "-";

  // ───────── FILTRO ─────────
  const filtrarAlertas = () => {
    return alertas.filter((a) => {
      // Estado
      const estadoOk = filtroEstado ? a.estado === filtroEstado : true;

      // Mes y año
      let fechaOk = true;
      const fecha = a.fecha?.toDate?.();
      if (filtroMes) {
        fechaOk = fechaOk && fecha && fecha.getMonth() + 1 === parseInt(filtroMes);
      }
      if (filtroAnio) {
        fechaOk = fechaOk && fecha && fecha.getFullYear() === parseInt(filtroAnio);
      }
      return estadoOk && fechaOk;
    });
  };

  const handleGenerarPDF = () => {
    const filtradas = filtrarAlertas();

    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("Reporte de Alertas - Inspector", 14, 18);

    if (filtroEstado || filtroMes || filtroAnio) {
      doc.setFontSize(11);
      doc.text(
        `Filtros: ${filtroEstado || "Todos los estados"} / ` +
        `${filtroMes ? meses[filtroMes - 1] : "Todos los meses"} / ` +
        `${filtroAnio || "Todos los años"}`,
        14, 25
      );
    }

    const rows = filtradas.map((a) => [
      a.estado,
      getDocenteNombre(a.docenteId),
      getEstudianteNombre(a.estudianteId, a.nombreEstudiante),
      a.fecha?.toDate?.().toLocaleString() ?? "-",
      a.ubicacion ?? "-",
    ]);

    autoTable(doc, {
      head: [["Estado", "Docente", "Estudiante", "Fecha y Hora", "Ubicación"]],
      body: rows,
      startY: filtroEstado || filtroMes || filtroAnio ? 30 : 25,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      styles: { fontSize: 10 },
    });

    doc.save("reporte_alertas_inspector.pdf");
  };

  // ───────── AGREGAR handleVolver ─────────
  const handleVolver = () => {
    navigate("/inspector");
  };

  // ───────── RENDER ─────────
  const alertasVisibles = filtrarAlertas();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleVolver} style={styles.botonVolver}>
          ⬅ Volver al menú Inspector
        </button>
        <h2 style={styles.titulo}>Dashboard de Alertas Inspector</h2>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {/* Estado */}
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">-- Todos los estados --</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          {/* Mes */}
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
            <option value="">-- Mes --</option>
            {meses.map((nombre, idx) => (
              <option key={idx + 1} value={idx + 1}>{nombre}</option>
            ))}
          </select>
          {/* Año */}
          <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)}>
            <option value="">-- Año --</option>
            {aniosDisponibles.map(anio => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
          <button onClick={handleGenerarPDF} style={styles.botonGenerar}>
            📄 Generar PDF
          </button>
        </div>

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
              {alertasVisibles.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                    No hay alertas con esos filtros
                  </td>
                </tr>
              ) : (
                alertasVisibles.map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>{a.estado}</td>
                    <td style={styles.td}>{getDocenteNombre(a.docenteId)}</td>
                    <td style={styles.td}>{getEstudianteNombre(a.estudianteId, a.nombreEstudiante)}</td>
                    <td style={styles.td}>{a.fecha?.toDate ? a.fecha.toDate().toLocaleString() : "-"}</td>
                    <td style={styles.td}>{a.ubicacion ?? "-"}</td>
                  </tr>
                ))
              )}
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
    minHeight: "450px",
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
  botonGenerar: {
    backgroundColor: "#2E3A59",
    color: "#fff",
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
    textAlign: "center",
  },
  separator: {
    margin: "2rem 0 1.5rem 0",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "1rem",
    marginTop: "1.5rem",
  },
  th: {
    background: "#e6f5f4",
    padding: "0.9rem",
    fontWeight: 700,
    color: "#17525a",
    borderRadius: "0.3rem",
  },
  td: {
    background: "#f8fafc",
    color: "#111",
    padding: "0.8rem",
    borderRadius: "0.2rem",
    textAlign: "center",
    borderBottom: "1px solid #e4e4e7",
  },
};

export default InspectorDashboard;

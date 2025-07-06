// src/pages/admin/AdminAlertas.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';

const AdminAlertas = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombreEstudiante: '',
    estudianteId: '',
    ubicacion: '',
    estado: '',
    observacion: '',
    fecha: '',
  });

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    const snapshot = await getDocs(collection(db, 'alertas'));
    const lista = snapshot.docs.map((docSnap) => ({
      idAlerta: docSnap.id,
      ...docSnap.data(),
    }));
    setAlertas(lista);
  };

  const handleVolver = () => {
    navigate('/admin');
  };

  const handleEditar = (alerta) => {
    setEditandoId(alerta.idAlerta);
    setFormData({
      nombreEstudiante: alerta.nombreEstudiante || '',
      estudianteId: alerta.estudianteId || '',
      ubicacion: alerta.ubicacion || '',
      estado: alerta.estado || '',
      observacion: alerta.observacion || '',
      fecha: alerta.fecha ? (alerta.fecha.toDate ? alerta.fecha.toDate().toISOString().slice(0, 16) : alerta.fecha) : '',
    });
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      // Solo actualiza los campos editables (puedes agregar/quitar campos aquí)
      const updateData = {
        nombreEstudiante: formData.nombreEstudiante,
        estudianteId: formData.estudianteId,
        ubicacion: formData.ubicacion,
        estado: formData.estado,
        observacion: formData.observacion,
      };
      await updateDoc(doc(db, 'alertas', editandoId), updateData);
      setMensaje('✅ Alerta actualizada');
      setEditandoId(null);
      setFormData({
        nombreEstudiante: '',
        estudianteId: '',
        ubicacion: '',
        estado: '',
        observacion: '',
        fecha: '',
      });
      cargarAlertas();
    } catch (err) {
      console.error(err);
      setError('❌ Error al actualizar alerta: ' + err.message);
    }
  };

  const handleEliminar = async (idAlerta) => {
    if (window.confirm('¿Seguro que deseas eliminar esta alerta?')) {
      await deleteDoc(doc(db, 'alertas', idAlerta));
      setMensaje('✅ Alerta eliminada');
      cargarAlertas();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button
          onClick={handleVolver}
          style={{
            margin: '1rem 0',
            backgroundColor: '#4FA5A5',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⬅ Volver al panel principal
        </button>
        <h2 style={styles.titulo}>Administrar Alertas</h2>
        <hr style={styles.separator} />

        {editandoId && (
          <>
            <h3>Editar alerta</h3>
            <form onSubmit={handleGuardarEdicion} style={styles.form}>
              <input
                type="text"
                name="nombreEstudiante"
                placeholder="Nombre del estudiante"
                value={formData.nombreEstudiante}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <input
                type="text"
                name="estudianteId"
                placeholder="ID del estudiante"
                value={formData.estudianteId}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <input
                type="text"
                name="ubicacion"
                placeholder="Ubicación"
                value={formData.ubicacion}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="text"
                name="estado"
                placeholder="Estado (activa/recibida/completada/cancelada)"
                value={formData.estado}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <input
                type="text"
                name="observacion"
                placeholder="Observación"
                value={formData.observacion}
                onChange={handleChange}
                style={styles.input}
              />
              <button type="submit" style={styles.botonEnviar}>Guardar Cambios</button>
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setFormData({
                    nombreEstudiante: '',
                    estudianteId: '',
                    ubicacion: '',
                    estado: '',
                    observacion: '',
                    fecha: '',
                  });
                }}
                style={styles.botonCancelar}
              >
                Cancelar
              </button>
            </form>
          </>
        )}

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <hr style={styles.separator} />

        <h3>Listado de alertas</h3>
        <div style={styles.cardList}>
          {alertas.length === 0 ? (
            <div style={styles.noData}>No hay alertas en la base de datos.</div>
          ) : (
            alertas.map((alerta) => (
              <div key={alerta.idAlerta} style={styles.alertaCard}>
                <div>
                  <b>Estudiante:</b> {alerta.nombreEstudiante || "-"}
                </div>
                <div>
                  <b>Estado:</b> {alerta.estado}
                </div>
                <div>
                  <b>Ubicación:</b> {alerta.ubicacion}
                </div>
                <div>
                  <b>Observación:</b> {alerta.observacion}
                </div>
                <div>
                  <b>Fecha:</b> {alerta.fecha?.toDate?.().toLocaleString() || "-"}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button onClick={() => handleEditar(alerta)} style={styles.botonAccion}>Modificar</button>
                  <button onClick={() => handleEliminar(alerta.idAlerta)} style={styles.botonEliminar}>Eliminar</button>
                </div>
              </div>
            ))
          )}
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem'
  },
  input: {
    padding: '0.8rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  botonEnviar: {
    backgroundColor: '#4FA5A5',
    color: 'white',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer'
  },
  botonCancelar: {
    backgroundColor: '#ccc',
    color: '#333',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  mensaje: {
    color: 'green',
    marginTop: '1rem'
  },
  error: {
    color: 'red',
    marginTop: '1rem'
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
  botonAccion: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#4FA5A5',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  botonEliminar: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  noData: {
    color: '#888',
    textAlign: 'center',
    padding: '1.5rem',
    fontStyle: 'italic'
  }
};

export default AdminAlertas;

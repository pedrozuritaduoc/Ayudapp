// src/pages/admin/AdminEstudiantes.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
  doc,
} from 'firebase/firestore';

const AdminEstudiantes = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    curso: '',
    foto: '',
    protocoloActuacion: '',
    protocoloIntervencion: '',
    idApoderado: '',
  });
  const [estudiantes, setEstudiantes] = useState([]);
  const [padres, setPadres] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarEstudiantes();
    cargarPadres();
  }, []);

  const cargarEstudiantes = async () => {
    const snapshot = await getDocs(collection(db, 'estudiantes'));
    const lista = snapshot.docs.map((docSnap) => ({
      idEstudiante: docSnap.id,
      ...docSnap.data(),
    }));
    setEstudiantes(lista);
  };

  const cargarPadres = async () => {
    const snapshot = await getDocs(collection(db, 'usuarios'));
    const lista = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .filter((user) => user.rol === 'padre');
    setPadres(lista);
  };

  const handleVolver = () => {
    navigate('/admin');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCrearEstudiante = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await addDoc(collection(db, 'estudiantes'), {
        ...formData
      });
      setMensaje('✅ Estudiante creado correctamente');
      setFormData({
        nombre: '',
        curso: '',
        foto: '',
        protocoloActuacion: '',
        protocoloIntervencion: '',
        idApoderado: '',
      });
      cargarEstudiantes();
    } catch (err) {
      console.error(err);
      setError('❌ Error al crear estudiante: ' + err.message);
    }
  };

  const handleEliminarEstudiante = async (idEstudiante) => {
    if (window.confirm('¿Estás seguro de eliminar este estudiante?')) {
      await deleteDoc(doc(db, 'estudiantes', idEstudiante));
      setMensaje('✅ Estudiante eliminado');
      cargarEstudiantes();
    }
  };

  const handleEditar = (estudiante) => {
    setEditandoId(estudiante.idEstudiante);
    setFormData({
      nombre: estudiante.nombre,
      curso: estudiante.curso,
      foto: estudiante.foto,
      protocoloActuacion: estudiante.protocoloActuacion,
      protocoloIntervencion: estudiante.protocoloIntervencion,
      idApoderado: estudiante.idApoderado,
    });
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'estudiantes', editandoId), {
        ...formData
      });
      setMensaje('✅ Estudiante actualizado');
      setEditandoId(null);
      setFormData({
        nombre: '',
        curso: '',
        foto: '',
        protocoloActuacion: '',
        protocoloIntervencion: '',
        idApoderado: '',
      });
      cargarEstudiantes();
    } catch (err) {
      console.error(err);
      setError('❌ Error al actualizar estudiante: ' + err.message);
    }
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
        <h2 style={styles.titulo}>Gestión de Estudiantes</h2>
        <hr style={styles.separator} />

        <h3>{editandoId ? 'Editar Estudiante' : 'Registrar nuevo estudiante'}</h3>
        <form onSubmit={editandoId ? handleGuardarEdicion : handleCrearEstudiante} style={styles.form}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="curso"
            placeholder="Curso"
            value={formData.curso}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="url"
            name="foto"
            placeholder="URL de la foto"
            value={formData.foto}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="protocoloActuacion"
            placeholder="Protocolo de actuación"
            value={formData.protocoloActuacion}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="protocoloIntervencion"
            placeholder="Protocolo de intervención"
            value={formData.protocoloIntervencion}
            onChange={handleChange}
            style={styles.input}
          />
          <select
            name="idApoderado"
            value={formData.idApoderado}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Selecciona un apoderado</option>
            {padres.map((padre) => (
              <option key={padre.id} value={padre.id}>
                {padre.nombre}
              </option>
            ))}
          </select>
          <button type="submit" style={styles.botonEnviar}>
            {editandoId ? 'Guardar Cambios' : 'Crear Estudiante'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoId(null);
                setFormData({
                  nombre: '',
                  curso: '',
                  foto: '',
                  protocoloActuacion: '',
                  protocoloIntervencion: '',
                  idApoderado: '',
                });
              }}
              style={styles.botonCancelar}
            >
              Cancelar
            </button>
          )}
        </form>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <hr style={styles.separator} />

        <h3>Estudiantes registrados</h3>
        <div style={styles.cardList}>
          {estudiantes.map((estudiante) => (
            <div key={estudiante.idEstudiante} style={styles.estudianteCard}>
              <div style={styles.estudianteHeader}>
                {estudiante.foto
                  ? (
                    <img
                      src={estudiante.foto}
                      alt="foto estudiante"
                      style={styles.estudianteFoto}
                    />
                  )
                  : (
                    <div style={styles.estudianteFotoPlaceholder}>
                      👤
                    </div>
                  )}
                <div>
                  <h4 style={{ margin: 0 }}>{estudiante.nombre}</h4>
                  <div style={{ color: "#555", fontSize: "1rem" }}>
                    {estudiante.curso}
                  </div>
                </div>
              </div>
              <div style={{ margin: "0.7rem 0" }}>
                <b>Protocolo de actuación:</b>
                <div style={styles.textoCampo}>{estudiante.protocoloActuacion || "-"}</div>
                <b>Protocolo de intervención:</b>
                <div style={styles.textoCampo}>{estudiante.protocoloIntervencion || "-"}</div>
                <b>Apoderado:</b>
                <div style={styles.textoCampo}>
                  {padres.find(p => p.id === estudiante.idApoderado)?.nombre || estudiante.idApoderado}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button onClick={() => handleEditar(estudiante)} style={styles.botonAccion}>Modificar</button>
                <button onClick={() => handleEliminarEstudiante(estudiante.idEstudiante)} style={styles.botonEliminar}>Eliminar</button>
              </div>
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
  estudianteCard: {
    backgroundColor: '#f8fafd',
    borderRadius: '1.2rem',
    boxShadow: '0 4px 12px rgba(60,130,180,0.08)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    color: '#1a202c',
  },
  estudianteHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem'
  },
  estudianteFoto: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    background: '#f3f4fa'
  },
  estudianteFotoPlaceholder: {
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
  }
};

export default AdminEstudiantes;

// src/pages/admin/AdminUsuarios.jsx
import React, { useState, useEffect } from 'react';
import {
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  setDoc,
  doc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'docente',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [editandoUid, setEditandoUid] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const snapshot = await getDocs(collection(db, 'usuarios'));
    const lista = snapshot.docs.map((docSnap) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    }));
    setUsuarios(lista);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleVolver = () => {
    navigate('/admin');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nombre: formData.nombre,
        rol: formData.rol,
        email: formData.email,
      });

      setMensaje('✅ Usuario creado correctamente');
      setFormData({ email: '', password: '', nombre: '', rol: 'docente' });
      cargarUsuarios();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('❌ Ese correo ya está registrado. Intenta con otro.');
      } else {
        setError('❌ Error al crear usuario: ' + err.message);
      }
    }
  };

  const handleEliminarUsuario = async (uid) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteDoc(doc(db, 'usuarios', uid));
      setMensaje('✅ Usuario eliminado');
      cargarUsuarios();
    }
  };

  const handleEditar = (usuario) => {
    setEditandoUid(usuario.uid);
    setFormData({
      email: usuario.email,
      password: '',
      nombre: usuario.nombre,
      rol: usuario.rol,
    });
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'usuarios', editandoUid), {
        nombre: formData.nombre,
        rol: formData.rol,
      });
      setMensaje('✅ Usuario actualizado');
      setEditandoUid(null);
      setFormData({ email: '', password: '', nombre: '', rol: 'docente' });
      cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError('❌ Error al actualizar usuario: ' + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={handleLogout} style={styles.botonCerrar}>Cerrar sesión</button>
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
        <h2 style={styles.titulo}>Panel de Administrador</h2>

        <hr style={styles.separator} />

        <h3>{editandoUid ? 'Editar Usuario' : 'Registrar nuevo usuario'}</h3>
        <form onSubmit={editandoUid ? handleGuardarEdicion : handleCrearUsuario} style={styles.form}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {!editandoUid && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </>
          )}

          <select name="rol" value={formData.rol} onChange={handleChange} style={styles.select}>
            <option value="docente">Docente</option>
            <option value="pie">PIE</option>
            <option value="inspector">Inspector</option>
            <option value="padre">Padre</option>
            <option value="admin">Administrador</option>
          </select>

          <button type="submit" style={styles.botonEnviar}>
            {editandoUid ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
          {editandoUid && (
            <button type="button" onClick={() => setEditandoUid(null)} style={styles.botonCancelar}>
              Cancelar
            </button>
          )}
        </form>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <hr style={styles.separator} />

        <h3>Usuarios registrados</h3>
        <ul style={styles.lista}>
          {usuarios.map((usuario) => (
            <li key={usuario.uid} style={styles.itemTexto}>
              <strong>{usuario.nombre}</strong> - {usuario.rol} - {usuario.email}
              <button onClick={() => handleEditar(usuario)} style={styles.botonAccion}>Modificar</button>
              <button onClick={() => handleEliminarUsuario(usuario.uid)} style={styles.botonEliminar}>Eliminar</button>
            </li>
          ))}
        </ul>
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
  select: {
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
  lista: {
    listStyleType: 'none',
    paddingLeft: 0
  },
  itemTexto: {
    marginBottom: '1rem',
    color: '#000000'
  },
  botonAccion: {
    marginLeft: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#4FA5A5',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  botonEliminar: {
    marginLeft: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  botonCerrar: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    float: 'right'
  },
  separator: {
    margin: '2rem 0'
  }
};

export default AdminUsuarios;

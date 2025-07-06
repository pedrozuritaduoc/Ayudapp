// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import logoAyudapp from "../assets/AyudappLogo.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Estado para reset password
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "usuarios", uid));

      if (!userDoc.exists()) {
        setError("Usuario no encontrado en Firestore.");
        return;
      }

      const userData = userDoc.data();
      const rol = userData.rol;

      switch (rol) {
        case "docente": navigate("/docente"); break;
        case "pie": navigate("/pie"); break;
        case "inspector": navigate("/inspector"); break;
        case "padre": navigate("/padre"); break;
        case "admin": navigate("/admin"); break;
        default: setError("Rol desconocido.");
      }
    } catch (err) {
      setError("Correo o contraseña inválidos.");
      console.error(err);
    }
  };

  // Función para enviar correo de restablecimiento
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("✅ Correo de restablecimiento enviado. Revisa tu bandeja de entrada o SPAM.");
    } catch (err) {
      setResetMsg("❌ Error al enviar el correo: " + (err.message || "Intenta nuevamente."));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logoAyudapp} alt="Logo Ayudapp" style={styles.logo} />
        <h1 style={styles.titulo}>Iniciar Sesión</h1>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.boton}>Ingresar</button>
          {error && <p style={styles.error}>{error}</p>}
        </form>

        <button
          type="button"
          style={{ ...styles.link, marginTop: "0.7rem" }}
          onClick={() => setShowReset(true)}
        >
          ¿Olvidaste tu contraseña? o ¿necesitas restablecerla?
        </button>

        <button
          onClick={() => navigate("/")}
          style={{ ...styles.boton, backgroundColor: "#cccccc", color: "#333", marginTop: "1rem" }}
        >
          Volver al inicio
        </button>
      </div>

      {/* MODAL SIMPLE DE RESET PASSWORD */}
      {showReset && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: "1rem" }}>Restablecer Contraseña</h2>
            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={styles.input}
              />
              <button type="submit" style={styles.boton}>
                Enviar correo de restablecimiento
              </button>
            </form>
            {resetMsg && (
              <p style={{ color: resetMsg.startsWith("✅") ? "green" : "red", marginTop: "1rem" }}>
                {resetMsg}
              </p>
            )}
            <button
              type="button"
              style={{ ...styles.boton, backgroundColor: "#ccc", color: "#222", marginTop: "1.2rem" }}
              onClick={() => {
                setShowReset(false);
                setResetEmail("");
                setResetMsg("");
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(to bottom right, #f0fdfc, #d9f2f2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: "relative",
  },
  card: {
    width: '90%',
    maxWidth: '500px',
    backgroundColor: '#ffffff',
    padding: '3rem',
    borderRadius: '2rem',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    zIndex: 1,
  },
  logo: {
    width: '140px',
    marginBottom: '1.2rem',
  },
  titulo: {
    fontSize: '2rem',
    color: '#2E3A59',
    marginBottom: '2rem',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '0.9rem',
    marginBottom: '1.2rem',
    borderRadius: '1rem',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  boton: {
    backgroundColor: '#4FA5A5',
    color: '#ffffff',
    border: 'none',
    padding: '0.9rem 2.2rem',
    fontSize: '1rem',
    borderRadius: '1rem',
    cursor: 'pointer',
    width: '100%',
    transition: '0.3s',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
    fontWeight: 'bold',
  },
  link: {
    background: "none",
    border: "none",
    color: "#237aac",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "1rem",
  },
  // Modal styles:
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.32)",
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "#fff",
    padding: "2rem 2.5rem",
    borderRadius: "1.5rem",
    boxShadow: "0 8px 30px rgba(0,0,0,0.16)",
    minWidth: "320px",
    maxWidth: "95vw",
    textAlign: "center",
    zIndex: 99,
  },
};

export default Login;

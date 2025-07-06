// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Admin from '../pages/admin/Admin';
import AdminUsuarios from '../pages/admin/AdminUsuarios';
import AdminEstudiantes from '../pages/admin/AdminEstudiantes';
import AdminAlertas from '../pages/admin/AdminAlertas';
import Docente from '../pages/docente/Docente';
import PIE from '../pages/pie/PIE';
import PieAlertas from '../pages/pie/PieAlertas';
import PieDashboard from '../pages/pie/PieDashboard';
import Inspector from '../pages/inspector/Inspector';
import InspectorDashboard from '../pages/inspector/InspectorDashboard';
import InspectorAlertas from '../pages/inspector/InspectorAlertas';
import InspectorEstudiantes from '../pages/inspector/InspectorEstudiantes';
import Padre from '../pages/padre/Padre';
import HistorialAlertas from '../pages/padre/HistorialAlertas';
import Notificaciones from '../pages/padre/Notificaciones';

import RequireAuth from '../components/RequireAuth';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* RUTAS PROTEGIDAS */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Admin />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <RequireAuth>
            <AdminUsuarios />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/estudiantes"
        element={
          <RequireAuth>
            <AdminEstudiantes />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/alertas"
        element={
          <RequireAuth>
            <AdminAlertas />
          </RequireAuth>
        }
      />

      <Route
        path="/docente/*"
        element={
          <RequireAuth>
            <Docente />
          </RequireAuth>
        }
      />
      <Route
        path="/pie"
        element={
          <RequireAuth>
            <PIE />
          </RequireAuth>
        }
      />
      <Route
        path="/pie/alertas"
        element={
          <RequireAuth>
            <PieAlertas />
          </RequireAuth>
        }
      />
      <Route
        path="/pie/dashboard"
        element={
          <RequireAuth>
            <PieDashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/inspector"
        element={
          <RequireAuth>
            <Inspector />
          </RequireAuth>
        }
      />
      <Route
        path="/inspector/dashboard"
        element={
          <RequireAuth>
            <InspectorDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/inspector/alertas"
        element={
          <RequireAuth>
            <InspectorAlertas />
          </RequireAuth>
        }
      />
      <Route
        path="/inspector/estudiantes"
        element={
          <RequireAuth>
            <InspectorEstudiantes />
          </RequireAuth>
        }
      />
      <Route
        path="/padre"
        element={
          <RequireAuth>
            <Padre />
          </RequireAuth>
        }
      />
      <Route
        path="/padre/historial"
        element={
          <RequireAuth>
            <HistorialAlertas />
          </RequireAuth>
        }
      />
      <Route
        path="/padre/notificaciones"
        element={
          <RequireAuth>
            <Notificaciones />
          </RequireAuth>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

import { Navigate, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import DiagnosticoPage from './pages/DiagnosticoPage';
import InformePage from './pages/InformePage';
import LandingPage from './pages/LandingPage';
import ProspeccionPage from './pages/ProspeccionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/diagnostico" element={<DiagnosticoPage />} />
      <Route path="/informe/:id" element={<InformePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/prospeccion" element={<ProspeccionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

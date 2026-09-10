import { Navigate, Route, Routes } from 'react-router-dom';
import AdminFillRulesPage from './pages/AdminFillRulesPage';
import AdminLeadsPage from './pages/AdminLeadsPage';
import AdminRulesStatusPage from './pages/AdminRulesStatusPage';
import AppealsPage from './pages/AppealsPage';
import DiagnosticoPage from './pages/DiagnosticoPage';
import InformePage from './pages/InformePage';
import LandingPage from './pages/LandingPage';
import ProspeccionPage from './pages/ProspeccionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/appeals" element={<AppealsPage />} />
      <Route path="/diagnostico" element={<DiagnosticoPage />} />
      <Route path="/informe/:id" element={<InformePage />} />

      <Route path="/admin" element={<Navigate to="/admin/leads" replace />} />
      <Route path="/admin/leads" element={<AdminLeadsPage />} />
      <Route path="/admin/rules-status" element={<AdminRulesStatusPage />} />
      <Route path="/admin/fill-rules" element={<AdminFillRulesPage />} />
      <Route path="/prospeccion" element={<ProspeccionPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

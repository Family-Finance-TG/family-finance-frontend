import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import CreateFamily from './pages/CreateFamily';
import { useAuth } from './hooks/useAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import InviteManager from "./pages/InviteManager";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ReceivedInvites from "./pages/ReceivedInvites"; 
import Profile from "./pages/Profile";
import PermissionsPage from "./pages/PermissionsPage"; 
import FamilyMembersPage from "./pages/FamilyMembersPage";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-family" element={<CreateFamily />} />
          <Route path="/invites" element={<InviteManager />} />
          <Route path="/signup" element={<SignupPage />} /> 
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/family-members" element={<FamilyMembersPage />} />
          <Route path="/received-invites" element={<ReceivedInvites />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }      
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default App;
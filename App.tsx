
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FormEditor from './components/FormEditor/FormEditor';
import FormRunner from './components/FormRunner/FormRunner';
import SummaryPage from './components/Summary/SummaryPage';
import ResultView from './components/Summary/ResultView';
import LoginPage from './pages/LoginPage';
import AccountSettings from './pages/AccountSettings';
import UpgradePage from './pages/UpgradePage';
import AIWallet from './pages/AIWallet';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user && !location.pathname.startsWith('/run')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className={`flex-1 ${user ? 'mt-16' : ''} p-4 md:p-8`}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/editor/:id" element={<ProtectedRoute><FormEditor /></ProtectedRoute>} />
          <Route path="/run/:id" element={<FormRunner />} />
          <Route path="/summary/:id" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
          <Route path="/result/:responseId" element={<ProtectedRoute><ResultView /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><AIWallet /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;

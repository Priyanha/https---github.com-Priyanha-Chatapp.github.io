import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import MFASetup from './components/MFASetup';
import Chat from './components/Chat';
import PasswordRecovery from './components/PasswordRecovery';
import ResetPassword from './components/ResetPassword';
import AuthLayouts from "./components/layout/AuthLayout";

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<AuthLayouts><Welcome /></AuthLayouts>} />
          <Route path="/register" element={<AuthLayouts><Register /></AuthLayouts>} />
          <Route path="/login" element={<AuthLayouts><Login /></AuthLayouts>} />
          <Route path="/profile" element={isAuthenticated ? <AuthLayouts><Profile /></AuthLayouts> : <Navigate to="/login" />} />
          <Route path="/chat/:userId" element={<AuthLayouts><Chat /></AuthLayouts>} />
          <Route path="/mfa-setup" element={isAuthenticated ? <MFASetup /> : <Navigate to="/login" />} />
          <Route path="/password-recovery" element={<AuthLayouts><PasswordRecovery /></AuthLayouts>} />
          <Route path="/reset/:token" element={<AuthLayouts><ResetPassword /></AuthLayouts>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

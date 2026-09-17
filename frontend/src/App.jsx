import React from 'react';
import './App.css';   // ✅ keeps your CSS loaded into the app
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Toastify Notification Imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Language Context Provider
import { LanguageProvider } from './context/LanguageContext'; // ⚠️ Adjust path if your context file is in a different folder

// Auth Pages
import Register from './pages/Register';
import Login from './pages/Login';

// Protected Components & Pages
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import ViewEmployeeDetail from './pages/ViewEmployeeDetail';
import UpdateEmployeePage from './pages/UpdateEmployeePage';
import DeleteEmployeePage from './pages/DeleteEmployeePage';
import ScanData from './pages/scandata';
import Settings from './pages/Settings';

function App() {
  return (
    <LanguageProvider>
      <Router>
        {/* Global Toast Container for mobile-messenger-style notifications across the full webpage */}
        <ToastContainer 
          position="top-center" 
          autoClose={3000} 
          hideProgressBar={true} 
          newestOnTop={true}
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="colored"
        />

        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard and CRUD Operations Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* CRUD Operations Routes */}
              <Route path="/employees/add" element={<AddEmployee />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/view/:id" element={<ViewEmployeeDetail />} />
              <Route path="/employees/update" element={<UpdateEmployeePage />} />
              <Route path="/employees/edit/:id" element={<EditEmployee />} />
              <Route path="/employees/delete" element={<DeleteEmployeePage />} />
              <Route path="/scandata" element={< ScanData/>} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Default Redirection */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
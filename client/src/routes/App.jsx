import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from '../context/AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
       
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

    
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
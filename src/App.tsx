import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListDetails from './pages/ListDetails';
import Header from './components/Header';
import {JSX} from "react/jsx-runtime";

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/list/:id" element={<ProtectedRoute><ListDetails /></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();
    if (loading) return <p className="text-center mt-10">Loading...</p>;
    return user ? children : <Navigate to="/register" />;
}
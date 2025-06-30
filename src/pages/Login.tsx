import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
//@ts-ignore
import BackgroundImage from '../background/sky.jpg'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: unknown) {
            console.error("Login error:", err);

            if (err instanceof FirebaseError) {
                if (err.code === 'auth/invalid-credential' ||
                    err.code === 'auth/user-not-found' ||
                    err.code === 'auth/wrong-password') {
                    setError('Invalid login or password.');
                } else {
                    setError('Login error: ' + err.message);
                }
            } else {
                setError('An unknown error occurred during login.');
            }
        }
    };

    return (
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className="w-full h-full flex items-center justify-center p-4 bg-black bg-opacity-50">
                <div className="bg-white bg-opacity-80 rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <input
                                type="email"
                                placeholder="Username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-gray-50 bg-opacity-80 text-gray-800 placeholder-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-gray-50 bg-opacity-80 text-gray-800 placeholder-gray-400"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Login
                        </button>
                    </form>
                    <p className="text-center text-gray-600 text-sm">
                        Don't have account?{' '}
                        <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
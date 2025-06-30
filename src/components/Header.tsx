import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="bg-gray-200 p-4 flex justify-between items-center mb-4">
            <Link to="/" className="font-bold text-lg">To-Do App</Link>
            {user && (
                <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Logout
                </button>
            )}
        </header>
    );
}
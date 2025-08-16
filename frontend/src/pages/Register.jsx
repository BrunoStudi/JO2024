import { useState, useEffect } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { APIAuth } from "../services/Api";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState("");
    const navigate = useNavigate();

    // Validation instantanée des mots de passe
    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordMatchError("Les mots de passe ne correspondent pas");
        } else {
            setPasswordMatchError("");
        }
    }, [password, confirmPassword]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (passwordMatchError) return; // empêche l'envoi si mots de passe différents

        try {
            await APIAuth.post("/register", { username, email, password });
            navigate("/login");
        } catch {
            setError("Erreur lors de l'inscription");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Créer un compte</h2>
                <form onSubmit={handleRegister} className="space-y-5">

                    {/* Username */}
                    <div className="relative">
                        <FaUser className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 pt-5 pb-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none peer"
                            placeholder=" "
                        />
                        <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
                            Nom d'utilisateur
                        </label>
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 pt-5 pb-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none peer"
                            placeholder=" "
                        />
                        <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
                            Email
                        </label>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FaLock className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 pt-5 pb-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none peer"
                            placeholder=" "
                        />
                        <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
                            Mot de passe
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    
                    {/* Confirm Password */}
                    <div className="relative">
                        <FaLock className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`w-full pl-10 pr-10 pt-5 pb-2 border rounded-lg focus:ring-1 focus:outline-none peer
            ${passwordMatchError
                                    ? "border-red-500 ring-red-500 animate-shake"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                            placeholder=" "
                        />
                        <label className="absolute left-10 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
                            Confirmer le mot de passe
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Messages d'erreur */}
                    {passwordMatchError && <p className="text-red-500 text-sm">{passwordMatchError}</p>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                        disabled={!!passwordMatchError} // bouton désactivé si mots de passe ne correspondent pas
                    >
                        S'enregistrer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;

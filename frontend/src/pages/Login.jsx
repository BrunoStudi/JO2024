import { useState, useContext } from "react";
import API from "../services/Api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); //useContext(useAuth);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/login', {
                email,
                password
            });
            login(response.data.token);
            setError('');
            navigate('/dashboard');
        } catch {
            setError('Email ou mot de passe invalide');
        }
    };

    return (
        <div>
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br/>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                /><br/>
                <button type="submit">Se connecter</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default Login;
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Navbar = () => {
    const { isLoggedIn } = useAuth();

    return (
        <nav style={{ marginBottom: '20px' }}>
            <Link to="/">Accueil</Link> |{' '}
            {isLoggedIn ? (
                <>
                  <Link to="/Dashboard">Dashboard</Link> | {' '}
                  <Link to="/logout">Se déconnecter</Link>
                </>
            ) : (
                  <Link to="/login">Se connecter</Link>
            )}
        </nav>
    );
};

export default Navbar;
import { createContext, useEffect, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const storedToken = localStorage.getItem('token');
    const [token, setToken] = useState(storedToken || null);
    const [user, setUser] = useState(storedToken ? jwtDecode(storedToken) : null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!storedToken);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(jwtDecode(newToken));
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
    };

    useEffect(() => {
        const currentToken = localStorage.getItem('token');
        setToken(currentToken);
        setUser(currentToken ? jwtDecode(currentToken) : null);
        setIsLoggedIn(!!currentToken);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

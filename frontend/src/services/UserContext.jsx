import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // On récupère le token depuis AuthContext

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isLoggedIn } = useAuth(); 
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger le profil utilisateur dès que l'utilisateur est connecté
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:8001/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(response.data.profile);
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn]);

  const updateUserProfile = async (data) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put("http://localhost:8001/api/user/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data.profile); // mise à jour locale après succès
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    }
  };

  return (
    <UserContext.Provider value={{ userProfile, loading, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

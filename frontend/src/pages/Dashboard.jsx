import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../services/AuthContext";
import { useUser } from "../services/UserContext";
import { User, ShoppingCart, Bell, Home, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user: authUser, logout } = useAuth();
  const { userProfile } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // supprime le token et met isLoggedIn à false
    navigate("/");       // redirige vers la page d'accueil
  };

  const roles = (userProfile?.roles && userProfile.roles.length > 0) ? userProfile.roles : (authUser?.roles || []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-indigo-700 text-white w-64 p-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} md:translate-x-0 fixed md:static inset-y-0 z-50`}>
        <h2 className="text-2xl font-bold mb-8">Mon Dashboard</h2>
        <nav className="space-y-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden bg-indigo-600 px-3 py-2 rounded"
          >
            {sidebarOpen ? 'Fermer' : 'Menu'}
          </button>
          <div className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
            <Link to="/" className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
              <Home size={20} /> <span>Accueil</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
            <Link to="/Profil" className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
              <User size={20} /> <span>Profil</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
            <ShoppingCart size={20} /> <span>Commandes</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
            <Bell size={20} /> <span>Notifications</span>
          </div>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition duration-200"
        >
          <LogOut size={20} /> <span>Se déconnecter</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-8 p-6 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte Utilisateur */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <User size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold">Mes informations</h2>
            </div>
            <p><span className="font-medium">Email :</span> {authUser?.username}</p>
            <p><span className="font-medium">Prénom :</span> {userProfile?.firstName || "Non renseigné"}</p>
            <p><span className="font-medium">Nom :</span> {userProfile?.lastName || "Non renseigné"}</p>
            <p><span className="font-medium">Adresse :</span> {userProfile?.address || "Non renseignée"}</p>
            <p><span className="font-medium">Téléphone :</span> {userProfile?.phone || "Non renseigné"}</p>
            <p><span className="font-medium">Rôles :</span> {roles.length ? roles?.join(', ') : "Aucun rôle"}</p>
          </div>

          {/* Commandes */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <ShoppingCart size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold">Commandes</h2>
            </div>
            <p>Contenu à venir...</p>
          </div>

          {/* Notifications */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <Bell size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <p>Contenu à venir...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

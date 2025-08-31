import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../services/AuthContext";
import { User, ShoppingCart, Bell, Home, LogOut } from "lucide-react";

const Sidebar = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
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
        {user?.roles.includes("ROLE_ADMIN") && (
        <div className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
            <Link to="/admin" className="flex items-center space-x-2 hover:text-indigo-200 cursor-pointer">
              <User size={20} /> <span>Administration</span>
            </Link>
        </div>
        )}
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
  );
};

export default Sidebar;

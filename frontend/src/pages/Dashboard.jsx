import { useAuth } from "../services/AuthContext";
import { useUser } from "../services/UserContext";
import Sidebar from "../Composants/Sidebar";
import { User, ShoppingCart, Bell } from "lucide-react";

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const { userProfile } = useUser();

  const roles = (userProfile?.roles && userProfile.roles.length > 0) ? userProfile.roles : (authUser?.roles || []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-8 p-6 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Mon tableau de bord</h1>

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
              <h2 className="text-xl font-semibold">Mes commandes</h2>
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

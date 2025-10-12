import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import { useUser } from "../services/UserContext";
import Sidebar from "../Composants/Sidebar";
import { User, ShoppingCart, Bell } from "lucide-react";

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const { userProfile } = useUser();
  const [orders, setOrders] = useState([]);

  const roles = (userProfile?.roles && userProfile.roles.length > 0)
    ? userProfile.roles
    : (authUser?.roles || []);

  // 🔹 Fetch des commandes de l'utilisateur connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:8003/api/orders/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Erreur récupération commandes :", err));
  }, []);

  const formatDate = (datetime) => {
    const d = new Date(datetime);
    return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-8 p-6 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Mon tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte Utilisateur */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <User size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold">Mes informations</h2>
            </div>
            <p><strong>Email :</strong> {authUser?.username}</p>
            <p><strong>Prénom :</strong> {userProfile?.firstName || "Non renseigné"}</p>
            <p><strong>Nom :</strong> {userProfile?.lastName || "Non renseigné"}</p>
            <p><strong>Adresse :</strong> {userProfile?.address || "Non renseignée"}</p>
            <p><strong>Téléphone :</strong> {userProfile?.phone || "Non renseigné"}</p>
            <p><strong>Rôles :</strong> {roles.length ? roles.join(', ') : "Aucun rôle"}</p>
          </div>

          {/* Commandes */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <ShoppingCart size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold">Mes commandes</h2>
            </div>

            {orders.length === 0 ? (
              <p>Aucune commande pour le moment.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {orders.slice(0, 4).map(order => (
                    <li key={order.id} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Commande du:</span>
                      <span className="text-md text-gray-500">{formatDate(order.createdAt)}</span>
                      <span className="font-semibold">{order.totalAmount.toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
                {orders.length > 4 && (
                  <p className="mt-2 text-gray-500 text-sm">
                    +{orders.length - 4} commande{orders.length - 4 > 1 ? "s" : ""} supplémentaire{orders.length - 4 > 1 ? "s" : ""}
                  </p>
                )}
              </>
            )}
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Composants/Sidebar";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8003/api/orders/my", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur récupération commandes:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Chargement des commandes...</p>;
  if (orders.length === 0) return <p className="p-6 text-gray-600">Aucune commande trouvée.</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p><strong>Commande #{order.id}</strong></p>
                <p>Date : {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                <p>Statut : {order.status}</p>
              </div>
              <Link
                to={`/detailsorder/${order.id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Voir détails
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

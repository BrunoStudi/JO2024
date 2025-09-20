import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Composants/Sidebar";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8002/api/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur récupération commande:", err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <p className="p-6">Chargement des détails...</p>;
  if (!order) return <p className="p-6 text-red-600">Commande introuvable</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Détails de la commande #{order.id}</h1>
        <p className="mb-2"><strong>Date :</strong> {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
        <p className="mb-4"><strong>Statut :</strong> {order.status}</p>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Billets achetés</h2>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.name} x {item.qty}</span>
                <span>{item.price.toFixed(2)} €</span>
                <span>Total: {(item.price * item.qty).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-lg">Total commande: {order.totalAmount.toFixed(2)} €</p>
        </div>
      </div>
    </div>
  );
}

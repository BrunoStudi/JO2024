import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Composants/Sidebar";

export default function Confirmation() {
  const [cart, setCart] = useState({});
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cartBackup")) || {};
    setCart(savedCart);

    fetch("http://127.0.0.1:8002/api/tickets/offers")
      .then((res) => res.json())
      .then((data) => {
        setOffers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement offres billets:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Chargement des tickets...</p>;

  const cartEntries = Object.entries(cart);

  if (cartEntries.length === 0)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <p>Aucun ticket n’a été acheté.</p>
          <button
            onClick={() => navigate("/reservation")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retour aux réservations
          </button>
        </div>
      </div>
    );

  const total = cartEntries.reduce((sum, [offerId, qty]) => {
    const offer = offers.find((o) => o.id === parseInt(offerId));
    return sum + (offer ? offer.price * qty : 0);
  }, 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 text-green-600">Paiement réussi !</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif de votre commande</h2>
          <ul className="space-y-2">
            {cartEntries.map(([offerId, qty]) => {
              const offer = offers.find((o) => o.id === parseInt(offerId));
              if (!offer) return null;
              return (
                <li key={offerId} className="flex justify-between">
                  <span>{offer.name} x {qty}</span>
                  <span>{(offer.price * qty).toFixed(2)} €</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 font-bold text-lg">Total payé : {total.toFixed(2)} €</p>
        </div>

        <p className="mb-6 text-gray-700">
          Merci pour votre réservation ! Vos billets vous seront envoyés par e-mail ou
          seront disponibles sur votre compte.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
}

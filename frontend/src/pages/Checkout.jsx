import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Composants/Sidebar";

export default function Checkout() {
  const [cart, setCart] = useState({});
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupération panier
    const savedCart = JSON.parse(localStorage.getItem("cart")) || {};
    setCart(savedCart);

    // 🔹 Récupération des offres pour avoir les infos de nom, prix
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

  const handlePayment = () => {
    setPaying(true);

    // 🔹 Simuler paiement
    setTimeout(() => {
      setPaying(false);
      setSuccess(true);

      // 🔹 Vider le panier après paiement
      localStorage.removeItem("cart");

      // 🔹 Redirection vers page de confirmation ou accueil
      setTimeout(() => {
        navigate("/"); // ou "/confirmation" si tu as une page
      }, 3000);
    }, 2000); // 2 secondes pour simuler le paiement
  };

  if (loading) return <p className="p-6">Chargement du panier...</p>;

  const cartEntries = Object.entries(cart);

  if (cartEntries.length === 0)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <p>Votre panier est vide.</p>
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
        <h1 className="text-2xl font-bold mb-6">Validation de votre réservation</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Votre panier</h2>
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
          <p className="mt-4 font-bold text-lg">Total : {total.toFixed(2)} €</p>
        </div>

        {!success ? (
          <button
            onClick={handlePayment}
            disabled={paying}
            className={`w-full px-4 py-2 text-white font-semibold rounded ${paying ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {paying ? "Paiement en cours..." : "Payer maintenant"}
          </button>
        ) : (
          <p className="text-green-600 font-bold text-center text-lg">
            Paiement réussi ! Vous allez être redirigé...
          </p>
        )}
      </div>
    </div>
  );
}

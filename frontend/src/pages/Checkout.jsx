import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Sidebar from "../Composants/Sidebar";

export default function Checkout() {
  const [cart, setCart] = useState({});
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderID, setOrderID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔹 Récupération panier depuis localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart")) || {};
    setCart(savedCart);

    // 🔹 Récupération des offres
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

  const cartEntries = Object.entries(cart);

  const total = cartEntries.reduce((sum, [offerId, qty]) => {
    const offer = offers.find((o) => o.id === parseInt(offerId));
    return sum + (offer ? offer.price * qty : 0);
  }, 0);

  if (loading) return <p className="p-6">Chargement du panier...</p>;
  if (cartEntries.length === 0)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <p>Votre panier est vide.</p>
        </div>
      </div>
    );

  const createOrder = async (data, actions) => {
    const token = localStorage.getItem("token"); // JWT
    const payload = cartEntries.map(([offerId, qty]) => {
      const offer = offers.find((o) => o.id === parseInt(offerId));
      return offer
        ? { name: offer.name, price: offer.price, qty, method: "paypal" }
        : null;
    }).filter(Boolean);

    const res = await fetch("http://127.0.0.1:8003/api/pay/paypal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ items: payload }),
    });

    const dataResp = await res.json();
    if (!res.ok) throw new Error(dataResp.error || "Erreur PayPal");

    setOrderID(dataResp.id);
    return dataResp.id;
  };

  const onApprove = async (data, actions) => {
    // Capture de paiement
    await fetch(`http://127.0.0.1:8003/api/pay/capture/${data.orderID}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setSuccess(true);
    localStorage.removeItem("cart");

    // Redirection après succès
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  const onError = (err) => {
    console.error("Erreur PayPal:", err);
    alert("Une erreur est survenue lors du paiement PayPal.");
  };

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
          <PayPalScriptProvider options={{ "client-id": "AYBYWNdo8fpd7eHC9AFbvT28HPeEmXPhk8dQSc15i-ou9PLb--iZQRLcv5sgoGLuAfJ15YMpNzyFl6Ay", currency: "EUR" }}>
            <PayPalButtons
              style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
            />
          </PayPalScriptProvider>
        ) : (
          <p className="text-green-600 font-bold text-center text-lg">
            Paiement réussi ! Vous allez être redirigé...
          </p>
        )}
      </div>
    </div>
  );
}

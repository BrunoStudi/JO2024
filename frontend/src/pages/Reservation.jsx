import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Composants/Sidebar";

export default function Reservation() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8002/api/tickets/offers")
            .then((res) => {
                setOffers(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement offres billets:", err);
                setError("Impossible de charger les offres.");
                setLoading(false);
            });

        // 🔹 Récupérer panier sauvegardé si existe
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setSelected(JSON.parse(savedCart));
        }
    }, []);

    const toggleSelection = (offerId) => {
        setSelected((prev) => {
            const updated = {
                ...prev,
                [offerId]: prev[offerId] ? prev[offerId] + 1 : 1,
            };
            localStorage.setItem("cart", JSON.stringify(updated)); // 🔹 Sauvegarde auto
            return updated;
        });
    };

    const removeSelection = (offerId) => {
        setSelected((prev) => {
            const updated = { ...prev };
            if (updated[offerId] > 1) {
                updated[offerId] -= 1;
            } else {
                delete updated[offerId];
            }
            localStorage.setItem("cart", JSON.stringify(updated)); // 🔹 Sauvegarde auto
            return updated;
        });
    };

    const handleReservation = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            // 🔹 Sauvegarde du panier avant redirection
            localStorage.setItem("cart", JSON.stringify(selected));
            localStorage.setItem("redirectAfterLogin", "/reservation");
            navigate("/login");
            return;
        }

        // 🔹 Sauvegarde du panier avant checkout (sécurité)
        localStorage.setItem("cart", JSON.stringify(selected));

        // 🔹 Redirection vers checkout
        navigate("/checkout");
    };


    if (loading) return <p className="p-6">Chargement des offres...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1 p-6 pb-24 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6">Réservation de billets</h1>

                {/* Liste des offres */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="bg-white p-4 rounded-lg shadow border flex flex-col justify-between"
                        >
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{offer.name}</h2>
                                <p className="text-gray-600 mb-2">{offer.description}</p>
                                <p className="text-sm text-gray-500">
                                    Quantité dispo : {offer.quantity}
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {offer.price} €
                                </p>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={() => toggleSelection(offer.id)}
                                >
                                    Ajouter
                                </button>
                                {selected[offer.id] && (
                                    <button
                                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        onClick={() => removeSelection(offer.id)}
                                    >
                                        -
                                    </button>
                                )}
                            </div>

                            {selected[offer.id] && (
                                <p className="mt-2 text-sm text-green-600">
                                    Sélectionné : {selected[offer.id]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Résumé panier */}
                {Object.keys(selected).length > 0 && (
                    <div className="mt-10 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Votre sélection</h2>
                        <ul className="space-y-2">
                            {Object.entries(selected).map(([offerId, qty]) => {
                                const offer = offers.find((o) => o.id === parseInt(offerId));
                                return (
                                    <li key={offerId} className="flex justify-between">
                                        <span>
                                            {offer.name} x {qty}
                                        </span>
                                        <span>{(offer.price * qty).toFixed(2)} €</span>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="mt-4 font-bold text-lg">
                            Total:{" "}
                            {Object.entries(selected)
                                .reduce((sum, [offerId, qty]) => {
                                    const offer = offers.find((o) => o.id === parseInt(offerId));
                                    return sum + offer.price * qty;
                                }, 0)
                                .toFixed(2)}{" "}
                            €
                        </p>
                        <button
                            onClick={handleReservation}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
                        >
                            Valider ma réservation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

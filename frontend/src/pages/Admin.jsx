import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../services/UserContext";
import Sidebar from "../Composants/Sidebar";

export default function Admin() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [offers, setOffers] = useState([]);
  const [offerName, setOfferName] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState("");

  // --- MODIF OFFRES ---
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    quantity: 1,
    price: 0,
  });

  const startEditing = (offer) => {
    setEditingOfferId(offer.id);
    setEditData({
      name: offer.name,
      description: offer.description,
      quantity: offer.quantity,
      price: offer.price,
    });
  };

  const cancelEditing = () => {
    setEditingOfferId(null);
    setEditData({ name: "", description: "", quantity: 1, price: 0 });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8002/api/tickets/offers/${id}`, {
        ...editData,
        price: parseFloat(editData.price),
      });

      setOffers(
        offers.map((o) =>
          o.id === id ? { ...o, ...editData, price: parseFloat(editData.price) } : o
        )
      );

      cancelEditing();
    } catch (err) {
      console.error("Erreur modification offre:", err);
    }
  };

  // --- UTILISATEURS ---
  const toggleKey = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/user/${userId}/revoke-key`,
        { isKeyActive: !currentStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isKeyActive: !currentStatus } : u
        )
      );
    } catch (err) {
      console.error("Erreur lors du changement du statut de la clé:", err);
    }
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement users:", err);
        setError("Impossible de charger les utilisateurs");
        setLoading(false);
      });
  }, [user]);

  // --- OFFRES ---
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8002/api/tickets/offers")
      .then((res) => setOffers(res.data))
      .catch((err) =>
        console.error("Erreur chargement offres billets:", err)
      );
  }, []);

  // Ajouter une offre
  const addOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8002/api/tickets/offers", {
        name: offerName,
        description: offerDesc,
        quantity: offerQuantity,
        price: parseFloat(offerPrice),
      });

      setOffers([
        ...offers,
        {
          id: res.data.id,
          name: offerName,
          description: offerDesc,
          quantity: offerQuantity,
          price: parseFloat(offerPrice),
        },
      ]);

      setOfferName("");
      setOfferDesc("");
      setOfferQuantity(1);
      setOfferPrice("");
    } catch (err) {
      console.error("Erreur ajout offre:", err);
    }
  };

  // Supprimer une offre
  const deleteOffer = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette offre ?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8002/api/tickets/offers/${id}`);
      setOffers(offers.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Erreur suppression offre:", err);
    }
  };

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 space-y-12 pb-24">
        {/* SECTION UTILISATEURS */}
        <div>
          <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>

          <div className="overflow-x-auto hidden md:block">
            <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Email Utilisateur</th>
                  <th className="border px-4 py-2 text-left">Roles</th>
                  <th className="border px-4 py-2 text-left">Clé Utilisateur</th>
                  <th className="border px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-4 py-2">{u.email}</td>
                    <td className="border px-4 py-2">{u.roles.join(", ")}</td>
                    <td className="border px-4 py-2">
                      {u.publicKey || "—"}{" "}
                      <span
                        className={`ml-2 px-2 py-1 rounded text-white ${u.isKeyActive ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        {u.isKeyActive ? "Active" : "Bloquée"}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        className={`px-2 py-1 rounded text-white ${u.isKeyActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                          }`}
                        onClick={() => toggleKey(u.id, u.isKeyActive)}
                      >
                        {u.isKeyActive ? "Bloquer" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue mobile */}
          <div className="grid gap-4 md:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-lg shadow p-4 border border-gray-200"
              >
                <p className="font-semibold">Email: {u.email}</p>
                <p>Roles: {u.roles.join(", ")}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span>Clé: {u.publicKey || "—"}</span>
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${u.isKeyActive ? "bg-green-500" : "bg-red-500"
                      }`}
                  >
                    {u.isKeyActive ? "Active" : "Bloquée"}
                  </span>
                </div>

                <button
                  className={`mt-3 w-full px-3 py-1 rounded text-white ${u.isKeyActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                    }`}
                  onClick={() => toggleKey(u.id, u.isKeyActive)}
                >
                  {u.isKeyActive ? "Bloquer" : "Réactiver"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION OFFRES DE BILLETS */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Gestion des Offres de Billets</h2>

          {/* Tableau desktop */}
          <div className="overflow-x-auto hidden md:block mb-6">
            <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Offre</th>
                  <th className="border px-4 py-2 text-left">Description</th>
                  <th className="border px-4 py-2 text-left">Quantité</th>
                  <th className="border px-4 py-2 text-left">Prix (€)</th>
                  <th className="border px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id}>
                    {editingOfferId === o.id ? (
                      <>
                        <td className="border px-4 py-2">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            className="w-full border px-2 py-1 rounded"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="text"
                            value={editData.description}
                            onChange={(e) =>
                              setEditData({ ...editData, description: e.target.value })
                            }
                            className="w-full border px-2 py-1 rounded"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={editData.quantity}
                            onChange={(e) =>
                              setEditData({ ...editData, quantity: e.target.value })
                            }
                            className="w-full border px-2 py-1 rounded"
                            min="1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editData.price}
                            onChange={(e) =>
                              setEditData({ ...editData, price: e.target.value })
                            }
                            className="w-full border px-2 py-1 rounded"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => saveEdit(o.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Annuler
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border px-4 py-2">{o.name}</td>
                        <td className="border px-4 py-2">{o.description}</td>
                        <td className="border px-4 py-2">{o.quantity}</td>
                        <td className="border px-4 py-2">{o.price}</td>
                        <td className="border px-4 py-2 space-x-2">
                          <button
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            onClick={() => startEditing(o)}
                          >
                            Modifier
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => deleteOffer(o.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes mobile */}
          <div className="grid gap-4 md:hidden">
            {offers.map((o) => (
              <div key={o.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                {editingOfferId === o.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full border px-2 py-1 rounded"
                      placeholder="Nom de l'offre"
                    />
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.target.value })
                      }
                      className="w-full border px-2 py-1 rounded"
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editData.quantity}
                        onChange={(e) =>
                          setEditData({ ...editData, quantity: e.target.value })
                        }
                        className="w-1/2 border px-2 py-1 rounded"
                        min="1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editData.price}
                        onChange={(e) =>
                          setEditData({ ...editData, price: e.target.value })
                        }
                        className="w-1/2 border px-2 py-1 rounded"
                        placeholder="Prix (€)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(o.id)}
                        className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold">{o.name}</p>
                    <p>{o.description}</p>
                    <p>Quantité: {o.quantity}</p>
                    <p>Prix: {o.price} €</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => startEditing(o)}
                      >
                        Modifier
                      </button>
                      <button
                        className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => deleteOffer(o.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Formulaire ajout */}
          <form
            onSubmit={addOffer}
            className="bg-white p-4 rounded-lg shadow space-y-4 mt-4 w-full"
          >
            <div>
              <label className="block mb-1 font-medium">Nom de l'offre</label>
              <input
                type="text"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <label className="block mb-1 font-medium">Quantité</label>
                <input
                  type="number"
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  min="1"
                  required
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block mb-1 font-medium">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
            </div>
            {/* Bouton visible sur mobile */}
            <div className="w-full">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ajouter l'offre
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

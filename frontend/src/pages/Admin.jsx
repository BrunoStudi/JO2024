import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../services/UserContext";
import Sidebar from "../Composants/Sidebar";

export default function Admin() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Administration</h1>

        {/* Table responsive */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Email Utilisateur</th>
                <th className="border px-4 py-2 text-left">Roles</th>
                <th className="border px-4 py-2 text-left">Clé Utilisateur</th>
                <th className="border px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-4 py-2">{u.id}</td>
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

        {/* Vue mobile en cartes */}
        <div className="grid gap-4 md:hidden">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <p className="font-semibold">ID: {u.id}</p>
              <p>Email: {u.email}</p>
              <p>Roles: {u.roles.join(", ")}</p>

              {/* Ligne clé + badge à côté */}
              <div className="flex items-center gap-2">
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
    </div>
  );
}

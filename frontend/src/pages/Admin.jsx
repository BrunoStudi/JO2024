import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../services/UserContext";
import Sidebar from "../Composants/Sidebar";

export default function Admin() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /*if (!user || !user.roles.includes("ROLE_ADMIN")) {
      window.location.href = "/dashboard"; // redirige si pas admin
      }*/

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

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Administration</h1>
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Roles</th>
              <th className="border px-4 py-2">Clé de sécurité</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-4 py-2">{u.id}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.roles.join(", ")}</td>
                <td className="border px-4 py-2">{u.publicKey || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
